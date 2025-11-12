#!/bin/bash

# Create Expo project
echo "Creating Expo project..."
npx create-expo-app CoupleSnap --template blank-typescript

# Navigate to project directory
cd CoupleSnap

# Install CoupleSnap dependencies
echo "Installing CoupleSnap dependencies..."

# Firebase JS SDK
npm install firebase

# Camera and image processing
npm install expo-camera expo-image-picker expo-image-manipulator expo-media-library

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI and animations
npm install react-native-reanimated react-native-gesture-handler react-native-vector-icons

# Notifications (for FCM integration)
npm install expo-notifications expo-device expo-constants expo-permissions

# Storage and encryption
npm install @react-native-async-storage/async-storage expo-secure-store expo-crypto

# State management and utilities
npm install zustand expo-constants expo-linking

# Development dependencies
npm install --save-dev @types/react @types/react-native

echo "Setup complete! Starting development server..."
npx expo start --host tunnel