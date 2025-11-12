// App.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CameraScreen from './src/screens/CameraScreen';
import TextOverlayScreen from './src/screens/TextOverlayScreen';

export default function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTextOverlayOpen, setIsTextOverlayOpen] = useState(false);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [pendingText, setPendingText] = useState<string | undefined>(undefined);
  const [pendingTextPosition, setPendingTextPosition] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [pendingTextScale, setPendingTextScale] = useState<number>(1.0);
  const [pendingCameraFacing, setPendingCameraFacing] = useState<'front' | 'back' | undefined>(undefined);
  const [pendingFontFamily, setPendingFontFamily] = useState<string>('System');

  const handlePhotoCaptured = (
    uri: string, 
    text?: string, 
    position?: { x: number; y: number }, 
    scale?: number,
    facing?: 'front' | 'back',
    fontFamily?: string
  ) => {
    setLastPhotoUri(uri);
    setPendingText(text);
    // Use the position, scale, and font from camera, or defaults if not provided
    setPendingTextPosition(position || { x: 0.5, y: 0.5 });
    setPendingTextScale(scale || 1.0);
    setPendingCameraFacing(facing);
    setPendingFontFamily(fontFamily || 'System');
    setIsCameraOpen(false);
    setIsTextOverlayOpen(true);
  };

  const handleMessageSaved = (photoUri: string, text: string, position: { x: number; y: number }, fontSize: number) => {
    setLastMessage(text);
    setIsTextOverlayOpen(false);
    // TODO: Send message to partner
    console.log('Message saved:', { photoUri, text, position, fontSize });
  };

  const handleCancelTextOverlay = () => {
    setIsTextOverlayOpen(false);
    setLastPhotoUri(null);
  };

  if (isCameraOpen) {
    return (
      <CameraScreen
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    );
  }

  if (isTextOverlayOpen && lastPhotoUri) {
    return (
      <TextOverlayScreen
        photoUri={lastPhotoUri}
        initialText={pendingText}
        initialFontSize={42}
        initialPosition={pendingTextPosition}
        initialScale={pendingTextScale}
        cameraFacing={pendingCameraFacing}
        initialFontFamily={pendingFontFamily}
        onSave={handleMessageSaved}
        onCancel={handleCancelTextOverlay}
      />
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>CoupleSnap</Text>
      <Text style={styles.subtitle}>Photo messaging for couples</Text>

      {lastPhotoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: lastPhotoUri }} style={styles.previewThumb} />
          {lastMessage && (
            <Text style={styles.messageText}>"{lastMessage}"</Text>
          )}
        </View>
      ) : null}

      <TouchableOpacity style={styles.cameraButton} onPress={() => setIsCameraOpen(true)}>
        <Text style={styles.buttonText}>📷 Open Camera</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 40,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewThumb: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});