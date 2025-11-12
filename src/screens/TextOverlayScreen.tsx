import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type TextOverlayScreenProps = {
  photoUri: string;
  initialText?: string;
  initialFontSize?: number;
  initialPosition?: { x: number; y: number };
  initialScale?: number;
  cameraFacing?: 'front' | 'back';
  initialFontFamily?: string;
  onSave: (
    photoUri: string,
    text: string,
    position: { x: number; y: number },
    fontSize: number
  ) => void;
  onCancel: () => void;
};

const TextOverlayScreen: React.FC<TextOverlayScreenProps> = ({ 
  photoUri, 
  initialText, 
  initialFontSize = 22, 
  initialPosition = { x: 0.5, y: 0.8 },
  initialScale = 1.0,
  cameraFacing = 'back',
  initialFontFamily = 'System',
  onSave, 
  onCancel 
}) => {
  const [text, setText] = useState(initialText ?? '');
  const [textPosition, setTextPosition] = useState(initialPosition);
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState<number>(initialFontSize || 42); // Match camera screen default
  const [scale, setScale] = useState<number>(initialScale);
  
  // Use shared values for gesture start positions (compatible with worklets)
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const hasGestureStart = useSharedValue(false);
  
  // Use shared values for current position to avoid ref modification issues
  const currentPositionX = useSharedValue(initialPosition.x);
  const currentPositionY = useSharedValue(initialPosition.y);
  const currentScale = useSharedValue(initialScale);
  
  // Sync shared values when state changes (including initial mount)
  useEffect(() => {
    currentPositionX.value = textPosition.x;
    currentPositionY.value = textPosition.y;
  }, [textPosition.x, textPosition.y, currentPositionX, currentPositionY]);
  
  useEffect(() => {
    currentScale.value = scale;
  }, [scale, currentScale]);
  
  // Initialize shared values on mount
  useEffect(() => {
    currentPositionX.value = initialPosition.x;
    currentPositionY.value = initialPosition.y;
    currentScale.value = initialScale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    onSave(photoUri, text, textPosition, fontSize * scale);
  };

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

  // Shared value for pinch gesture start scale
  const pinchStartScale = useSharedValue(scale);

  const pinchGesture = useMemo(() => {
    return Gesture.Pinch()
      .onBegin(() => {
        // Capture starting scale when gesture begins
        pinchStartScale.value = currentScale.value;
      })
      .onUpdate((event) => {
        // Calculate scale relative to gesture start
        const sensitivity = 0.15;
        const scaleChange = Math.log(event.scale) * sensitivity;
        const newScale = Math.max(0.5, Math.min(3.0, pinchStartScale.value + scaleChange));
        runOnJS(setScale)(newScale);
      });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Image 
        source={{ uri: photoUri }} 
        style={[
          styles.photo,
          cameraFacing === 'front' && styles.mirroredPhoto
        ]} 
        resizeMode="cover" 
      />
      
      {/* Text Overlay */}
      {text && (
        <View style={[styles.textOverlay, { 
          left: textPosition.x * screenWidth, 
          top: textPosition.y * screenHeight,
        }]}>
          <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
            <View style={styles.textContainer}>
              <View style={[styles.overlayBg, {
                left: -16 * scale,
                right: -16 * scale,
                top: -12 * scale,
                bottom: -12 * scale,
              }]} />
                <Text 
                  style={[
                    styles.overlayText, 
                    { 
                      fontSize: fontSize * scale,
                      paddingHorizontal: 20 * scale,
                      paddingVertical: 12 * scale,
                      lineHeight: 50 * scale,
                      letterSpacing: 0.5 * scale,
                      fontFamily: initialFontFamily === 'System' ? undefined : initialFontFamily,
                      maxWidth: screenWidth * 0.9 * scale - (40 * scale), // Account for padding
                    }
                  ]}
                  numberOfLines={0}
                >
                  {text}
                </Text>
            </View>
          </GestureDetector>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.editButton]} 
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Done' : 'Edit Text'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Text Input Modal */}
      {isEditing && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Add your message..."
            placeholderTextColor="#ccc"
            multiline
            maxLength={280}
          />
          <Text style={styles.characterCount}>{text.length}/280</Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  photo: {
    flex: 1,
    width: '100%',
  },
  mirroredPhoto: {
    transform: [{ scaleX: -1 }], // Flip horizontally for front camera
  },
  textOverlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
    // Center the text at the position point
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 42, // Large headline size to match camera (base, will be scaled)
    fontWeight: '900', // Extra bold for newspaper headline
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  overlayBg: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.75)', // Much darker background for newspaper headline contrast
    borderRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 0,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textInputContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 16,
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
});

export default TextOverlayScreen;
