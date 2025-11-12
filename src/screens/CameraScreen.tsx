import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Dimensions, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CameraScreenProps = {
  onClose: () => void;
  onPhotoCaptured?: (
    uri: string, 
    text?: string, 
    position?: { x: number; y: number }, 
    scale?: number,
    facing?: CameraType,
    fontFamily?: string
  ) => void;
};

const CameraScreen: React.FC<CameraScreenProps> = ({ onClose, onPhotoCaptured }) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string>('System');
  const [textPosition, setTextPosition] = useState({ x: 0.5, y: 0.4 }); // Relative position (0-1), slightly higher for prominence
  const [textScale, setTextScale] = useState(1.0);
  const [baseFontSize] = useState(42); // Larger base font size for newspaper headline style
  const [cameraZoom, setCameraZoom] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const textInputRef = useRef<TextInput>(null);
  
  // Available fonts
  const fonts = [
    { name: 'System', value: 'System' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Times', value: 'Times New Roman' },
    { name: 'Courier', value: 'Courier' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
  ];
  
  // Blinking cursor effect
  useEffect(() => {
    if (!isEditing && overlayText.length === 0) {
      const interval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setCursorVisible(true);
    }
  }, [isEditing, overlayText]);
  
  // Focus text input when user taps on camera
  const handleCameraTap = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  }, []);

  // Resume typing when tapping on text overlay (when keyboard is dismissed)
  const handleTextTap = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [isEditing]);
  
  // Use shared values for gesture start positions (compatible with worklets)
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const hasGestureStart = useSharedValue(false);
  
  // Use shared value for current position to avoid ref modification issues
  const currentPositionX = useSharedValue(0.5);
  const currentPositionY = useSharedValue(0.5);
  
  // Sync shared values when position changes
  React.useEffect(() => {
    currentPositionX.value = textPosition.x;
    currentPositionY.value = textPosition.y;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textPosition.x, textPosition.y]);

  const hasPermission = useMemo(() => Boolean(permission?.granted), [permission]);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .onBegin(() => {
        // Capture starting position when gesture begins
        // Use shared values instead of refs to avoid worklet serialization issues
        gestureStartX.value = currentPositionX.value * screenWidth;
        gestureStartY.value = currentPositionY.value * screenHeight;
        hasGestureStart.value = true;
      })
      .onUpdate((event) => {
        if (!hasGestureStart.value) return;
        
        // Calculate new position: start position + translation
        // No damping factor needed - translation is already smooth
        const newX = gestureStartX.value + event.translationX;
        const newY = gestureStartY.value + event.translationY;
        
        // Convert to relative position (0-1) and clamp to bounds
        const relativeX = Math.max(0, Math.min(1, newX / screenWidth));
        const relativeY = Math.max(0, Math.min(1, newY / screenHeight));
        
        runOnJS(setTextPosition)({ x: relativeX, y: relativeY });
      })
      .onEnd(() => {
        hasGestureStart.value = false;
      });
  }, []);

  const textPinchGesture = useMemo(() => {
    let startScale = textScale;
    return Gesture.Pinch()
      .onBegin(() => {
        startScale = textScale;
      })
      .onUpdate((event) => {
        // Calculate scale relative to gesture start
        const sensitivity = 0.15;
        const scaleChange = Math.log(event.scale) * sensitivity;
        const newScale = Math.max(0.5, Math.min(3.0, startScale + scaleChange));
        runOnJS(setTextScale)(newScale);
      });
  }, [textScale]);

  // Size slider gesture
  const sliderStartScale = useSharedValue(textScale);
  const sliderStartY = useSharedValue(0);
  
  useEffect(() => {
    sliderStartScale.value = textScale;
  }, [textScale, sliderStartScale]);

  const sizeSliderGesture = useMemo(() => {
    return Gesture.Pan()
      .onBegin((event) => {
        sliderStartScale.value = textScale;
        sliderStartY.value = event.y;
      })
      .onUpdate((event) => {
        const sliderHeight = 200;
        const currentY = event.y;
        const deltaY = sliderStartY.value - currentY; // Negative when dragging up (increasing scale)
        // Add sensitivity multiplier to make slider less sensitive
        const sensitivity = 0.5; // Lower = less sensitive (requires more movement)
        const normalizedDelta = (deltaY / sliderHeight) * sensitivity;
        const scaleRange = 3.0 - 0.5; // 2.5
        const newScale = Math.max(0.5, Math.min(3.0, sliderStartScale.value + normalizedDelta * scaleRange));
        runOnJS(setTextScale)(newScale);
        // Update start Y to prevent accumulation on continuous drag
        sliderStartY.value = currentY;
        sliderStartScale.value = newScale;
      });
  }, [textScale, sliderStartScale, sliderStartY]);

  // Tap gesture to resume typing on text overlay
  const textTapGesture = useMemo(() => {
    return Gesture.Tap()
      .onEnd(() => {
        runOnJS(handleTextTap)();
      });
  }, [handleTextTap]);

  const cameraPinchGesture = useMemo(() => {
    let startZoom = cameraZoom;
    return Gesture.Pinch()
      .onBegin(() => {
        startZoom = cameraZoom;
      })
      .onUpdate((event) => {
        // Calculate zoom relative to gesture start
        const sensitivity = 0.1;
        const zoomFactor = Math.pow(event.scale, sensitivity);
        const newZoom = Math.max(0, Math.min(1, startZoom * zoomFactor));
        runOnJS(setCameraZoom)(newZoom);
      });
  }, [cameraZoom]);

  const capturePhoto = useCallback(async () => {
    try {
      const result = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      if (result?.uri) {
        setCapturedUri(result.uri);
        // Pass text position, scale, camera facing, and font to the preview
        onPhotoCaptured?.(
          result.uri, 
          overlayText.trim(), 
          textPosition, 
          textScale,
          facing,
          selectedFont
        );
        onClose();
      }
    } catch (err) {
      // For now, log the error; production code should report properly
      console.warn('Failed to capture photo:', err);
    }
  }, [onClose, onPhotoCaptured, overlayText, textPosition, textScale]);

  const usePhoto = useCallback(() => {
    if (capturedUri) {
      onPhotoCaptured?.(capturedUri);
    }
    onClose();
  }, [capturedUri, onClose, onPhotoCaptured]);

  if (!permission) {
    return <View style={styles.centered} />;
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          CoupleSnap needs access to your camera to take photos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionCancel} onPress={onClose}>
          <Text style={styles.permissionCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // We no longer render an intermediate preview here; capture triggers parent flow

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={cameraPinchGesture}>
        <CameraView 
          ref={cameraRef} 
          style={styles.camera} 
          facing={facing}
          zoom={cameraZoom}
        />
      </GestureDetector>
      
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboardAvoidingView}
        pointerEvents="box-none"
      >

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.iconText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.fontButton} 
          onPress={() => setShowFontSelector(true)}
        >
          <Text style={styles.fontIcon}>Aa</Text>
        </TouchableOpacity>
      </View>

      {/* Hidden text input for typing */}
      <TextInput
        ref={textInputRef}
        value={overlayText}
        onChangeText={setOverlayText}
        style={styles.hiddenInput}
        multiline
        maxLength={280}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        returnKeyType="default"
        blurOnSubmit={false}
      />

      {/* Tap anywhere to dismiss keyboard when editing - placed before other elements */}
      {isEditing && (
        <TouchableWithoutFeedback 
          onPress={() => {
            Keyboard.dismiss();
            setIsEditing(false);
            textInputRef.current?.blur();
          }}
        >
          <View style={styles.dismissArea} />
        </TouchableWithoutFeedback>
      )}

      {/* Text overlay on camera */}
      <View style={styles.textOverlayContainer} pointerEvents="box-none">
        {/* Blinking cursor in center when no text - clickable */}
        {!overlayText.trim() && (
          <TouchableOpacity 
            style={styles.cursorContainer}
            onPress={handleCameraTap}
            activeOpacity={0.7}
          >
            {cursorVisible && <View style={styles.cursor} />}
          </TouchableOpacity>
        )}
        
        {/* Live preview text with drag and pinch gestures */}
        {!!overlayText.trim() && (
          <View style={[styles.liveTextPreview, { 
            left: textPosition.x * screenWidth, 
            top: textPosition.y * screenHeight,
          }]}>
            <GestureDetector gesture={Gesture.Simultaneous(panGesture, textPinchGesture, textTapGesture)}>
              <View style={styles.textContainer}>
                <View style={[styles.liveTextBackground, {
                  left: -16 * textScale,
                  right: -16 * textScale,
                  top: -12 * textScale,
                  bottom: -12 * textScale,
                }]} />
                <Text 
                  style={[styles.liveText, { 
                    fontSize: baseFontSize * textScale,
                    paddingHorizontal: 20 * textScale,
                    paddingVertical: 12 * textScale,
                    lineHeight: 50 * textScale,
                    letterSpacing: 0.5 * textScale,
                    fontFamily: selectedFont === 'System' ? undefined : selectedFont,
                    maxWidth: screenWidth * 0.9 * textScale - (40 * textScale), // Account for padding
                  }]}
                  numberOfLines={0}
                >
                  {overlayText.trim()}
                </Text>
              </View>
            </GestureDetector>
          </View>
        )}
      </View>

      {/* Size slider - appears when text exists and keyboard is dismissed */}
      {overlayText.trim() && !isEditing && (
        <View style={styles.sizeSliderContainer}>
          <GestureDetector gesture={sizeSliderGesture}>
            <View style={styles.sizeSliderTrack}>
              <View 
                style={[
                  styles.sizeSliderThumb,
                  { 
                    bottom: `${((textScale - 0.5) / (3.0 - 0.5)) * 100}%`
                  }
                ]}
              />
            </View>
          </GestureDetector>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
          <Text style={styles.iconText}>↺</Text>
        </TouchableOpacity>

        {/* Send button captures photo and continues */}
        <TouchableOpacity
          style={[styles.sendButton, overlayText.trim() ? styles.sendEnabled : styles.sendDisabled]}
          onPress={capturePhoto}
          disabled={!overlayText.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </View>
      
      {/* Font Selector Modal */}
      <Modal
        visible={showFontSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFontSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFontSelector(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.fontSelectorContainer}>
                <Text style={styles.fontSelectorTitle}>Select Font</Text>
                {fonts.map((font) => (
                  <TouchableOpacity
                    key={font.value}
                    style={[
                      styles.fontOption,
                      selectedFont === font.value && styles.fontOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedFont(font.value);
                      setShowFontSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.fontOptionText,
                      { fontFamily: font.value === 'System' ? undefined : font.value }
                    ]}>
                      {font.name}
                    </Text>
                    {selectedFont === font.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoidingView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  fontButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  fontIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  textOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  cursorContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    transform: [{ translateX: -1 }],
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 1,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSelectorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  fontSelectorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  fontOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  fontOptionSelected: {
    backgroundColor: 'rgba(0,122,255,0.2)',
  },
  fontOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sizeSliderContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -100 }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  sizeSliderTrack: {
    width: 4,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  sizeSliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    left: -8,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    transform: [{ translateY: 10 }], // Center thumb on track
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    zIndex: 20,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    minWidth: 120,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendEnabled: {
    backgroundColor: '#007AFF',
  },
  sendDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  spacer: {
    width: 60,
    height: 60,
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  liveTextPreview: {
    position: 'absolute',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 0,
  },
  liveTextBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.75)', // Much darker background for newspaper headline contrast
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 42, // Large headline size (base, will be scaled)
    fontWeight: '900', // Extra bold for newspaper headline
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionCancel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionCancelText: {
    color: '#bbb',
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  useButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;


