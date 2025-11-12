# CoupleSnap - Complete Technical Context Document for Development

**Version 1.0 | November 2024**  
**Document Type:** Technical Specification & Development Guide  
**Target Audience:** Development Team, Technical Stakeholders

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Core Features](#core-features)
4. [Database Schema](#database-schema)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Security Implementation](#security-implementation)
7. [API Patterns](#api-patterns)
8. [Performance Optimizations](#performance-optimizations)
9. [Development Patterns](#development-patterns)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Configuration](#deployment-configuration)
12. [Monitoring & Analytics](#monitoring--analytics)
13. [Known Limitations & Constraints](#known-limitations--constraints)
14. [Future Roadmap](#future-roadmap)

---

## Project Overview

### Executive Summary

**CoupleSnap** is a photo-first messaging application designed exclusively for couples to share intimate visual moments. Every message must include a photo (primarily selfies) with optional text overlay. The app operates in dual modes: real-time when both partners are active, and asynchronous push notifications when apart.

### Core Value Proposition

Transform everyday moments into visual memories by requiring photos for all communication, creating more intentional and meaningful exchanges between partners.

### Target Users

- Couples in committed relationships
- Long-distance relationships
- Partners who prefer visual over text communication
- Age range: 18-45 years old
- Tech-savvy users comfortable with photo sharing

### Key Differentiators

1. **Photo-Only Messaging:** Every message requires a photo, no text-only messages
2. **Couple-Exclusive:** Private space for two people only, no group features
3. **Dual-Mode Operation:** Smart switching between real-time and asynchronous
4. **Privacy-First:** End-to-end encryption, no public feeds, no discovery

---

## Technical Architecture

### Technology Stack

#### Frontend
- **Framework:** React Native 0.72+ with TypeScript 5.0+
- **State Management:** Zustand (lightweight alternative to Redux)
- **Navigation:** React Navigation 6
- **Camera:** react-native-vision-camera 3.6+
- **Image Processing:** react-native-image-resizer
- **Notifications:** @notifee/react-native + Firebase Cloud Messaging
- **Encryption:** react-native-crypto-js
- **Storage:** @react-native-async-storage/async-storage

#### Backend
- **Authentication:** Firebase Auth (Phone verification)
- **Database:** Cloud Firestore (NoSQL, real-time)
- **File Storage:** Firebase Storage (with CDN)
- **Serverless Functions:** Firebase Cloud Functions
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Analytics:** Firebase Analytics + Custom Events
- **Crash Reporting:** Firebase Crashlytics

### Architecture Pattern

```
┌─────────────────────────────────────────┐
│           CLIENT LAYER                   │
│  ┌────────────────────────────────┐     │
│  │    React Native Application    │     │
│  │  - MVVM Pattern               │     │
│  │  - TypeScript                 │     │
│  │  - Unidirectional Data Flow   │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         NETWORK LAYER                    │
│  - HTTPS for REST                       │
│  - WebSocket for real-time              │
│  - HTTP/2 for push notifications        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         BACKEND SERVICES                 │
│  ┌────────────────────────────────┐     │
│  │    Firebase Services           │     │
│  │  - Serverless Architecture     │     │
│  │  - Auto-scaling               │     │
│  │  - Multi-region               │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### System Components

1. **Client Applications**
   - iOS App (React Native)
   - Android App (React Native)
   - Shared codebase: 95%

2. **Backend Services**
   - Authentication Service
   - Messaging Service
   - Media Storage Service
   - Notification Service
   - Presence Service

3. **Infrastructure**
   - CDN for media delivery
   - Cloud Functions for server logic
   - Firestore for data persistence
   - FCM for push notifications

---

## Core Features

### Phase 1: MVP Features (Weeks 1-2)

#### 1. Camera-First Interface
- **Description:** App opens directly to camera view
- **Technical Details:**
  - Front-facing camera by default
  - Quick flip between cameras
  - Instant capture capability
  - Flash support
  - Timer mode (3s, 10s)
- **Performance Target:** < 2 seconds to camera ready

#### 2. Photo Messaging System
- **Description:** Complete photo message workflow
- **Technical Details:**
  - Image compression (70% JPEG quality)
  - Client-side encryption (AES-256)
  - Resumable uploads
  - Multiple resolution generation
  - Automatic retry on failure
- **Performance Target:** < 3 seconds end-to-end

#### 3. Text Overlay Feature
- **Description:** Add text messages on photos
- **Technical Details:**
  - Draggable positioning
  - Multiple font options
  - Adjustable size and color
  - Background/outline for readability
  - 280 character limit
  - Emoji support

#### 4. Push Notification System
- **Description:** Rich media notifications
- **Technical Details:**
  - Large image previews
  - Custom sounds
  - Quick actions (reply, react)
  - Privacy controls
  - Delivery optimization

#### 5. Partner Pairing
- **Description:** Couple connection system
- **Technical Details:**
  - Phone number verification
  - 6-digit invite codes
  - QR code option
  - One couple per account

### Phase 2: Enhanced Features (Weeks 3-4)

#### 6. Presence System
- **Features:**
  - Online/offline status
  - Last seen timestamp
  - "Taking photo" indicator
  - "Typing" indicator
  - Activity status

#### 7. Read Receipt System
- **Status Tracking:**
  - Sent (server received)
  - Delivered (device received)
  - Read (user viewed)
  - Saved (added to album)

#### 8. Shared Album
- **Features:**
  - Save special photos
  - Organized by date
  - Unlimited storage
  - Export options

#### 9. Quick Reactions
- **Emoji Reactions:**
  - Double-tap to react
  - 6 default emojis
  - Animation effects
  - Real-time sync

### Phase 3: Engagement Features (Month 2)

#### 10. Streak Tracking
- **Gamification:**
  - Daily exchange tracking
  - Current streak display
  - Longest streak record
  - Achievement badges

#### 11. Daily Reminders
- **Notification Prompts:**
  - Customizable times
  - Creative prompts
  - "Good morning" reminders
  - Time zone aware

#### 12. Ephemeral Mode
- **Self-Destructing Messages:**
  - 24-hour default
  - Custom durations
  - View once option
  - Screenshot detection (iOS)

---

## Database Schema

### Firestore Collections Structure

#### Users Collection
```javascript
// Path: /users/{userId}
{
  // Identity
  userId: "uuid-v4",
  phoneNumber: "+1234567890", // E164 format
  name: "Alex Smith",
  avatar: "https://storage.url/avatar.jpg",
  
  // Relationship
  partnerId: "partner-uuid",
  coupleId: "couple-uuid",
  
  // Authentication
  fcmToken: "firebase-cloud-messaging-token",
  publicKey: "encryption-public-key",
  
  // Settings
  settings: {
    notifications: {
      enabled: true,
      sound: "default",
      preview: "show_all", // show_all | hide_content | hide_all
      doNotDisturb: {
        enabled: false,
        startTime: "22:00",
        endTime: "07:00"
      }
    },
    privacy: {
      readReceipts: true,
      lastSeen: true,
      activityStatus: true
    },
    media: {
      autoSave: false,
      uploadQuality: "high", // low | medium | high
      autoDownload: "wifi_only" // always | wifi_only | never
    },
    messages: {
      messageExpiry: "never", // 24h | 7d | 30d | never
      fontSize: "medium"
    }
  },
  
  // Presence
  presence: {
    status: "online", // online | offline | away
    lastSeen: "2024-01-15T10:30:00Z",
    currentActivity: "camera_open", // camera_open | typing | viewing_photo | null
    deviceInfo: {
      platform: "ios",
      appVersion: "1.0.0",
      osVersion: "17.0"
    }
  },
  
  // Metadata
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  lastActiveAt: "2024-01-15T10:30:00Z"
}
```

#### Couples Collection
```javascript
// Path: /couples/{coupleId}
{
  coupleId: "uuid-v4",
  users: ["userId1", "userId2"],
  
  // Pairing
  inviteCode: "ABC123", // 6-character unique code
  pairedAt: "2024-01-01T00:00:00Z",
  
  // Shared Album
  sharedAlbum: [
    {
      messageId: "message-uuid",
      savedBy: "userId",
      savedAt: "2024-01-10T00:00:00Z",
      note: "Our first photo!"
    }
  ],
  
  // Statistics
  statistics: {
    totalMessages: 1543,
    totalPhotos: 1543,
    currentStreak: 15,
    longestStreak: 45,
    lastMessageAt: "2024-01-15T10:00:00Z",
    dailyAverage: 12,
    favoriteTime: "20:00",
    milestones: {
      firstMessage: "2024-01-01T00:00:00Z",
      hundredthMessage: "2024-01-10T00:00:00Z",
      thousandthMessage: "2024-02-15T00:00:00Z"
    }
  },
  
  // Settings
  settings: {
    privateMode: false,
    sharedAlbumEnabled: true,
    streakNotifications: true,
    anniversaryReminders: true
  },
  
  // Metadata
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z"
}
```

#### Messages Collection
```javascript
// Path: /messages/{messageId}
{
  messageId: "uuid-v4",
  coupleId: "couple-uuid", // For query optimization
  
  // Participants
  senderId: "sender-uuid",
  recipientId: "recipient-uuid",
  
  // Photo Data
  photoData: {
    thumbnailUrl: "https://cdn.url/thumb_150.jpg", // 150x150, ~10KB
    displayUrl: "https://cdn.url/display_720.jpg", // 720p, ~100KB
    fullUrl: "https://cdn.url/full_1080.jpg", // 1080p, ~500KB
    originalUrl: "https://storage.url/encrypted.dat", // Encrypted original
    
    metadata: {
      width: 1920,
      height: 1080,
      size: 524288, // bytes
      mimeType: "image/jpeg",
      duration: null, // For future video support
      location: null, // Optional GPS
      device: "iPhone 14 Pro",
      encrypted: true,
      compressionRatio: 0.7
    }
  },
  
  // Message Content
  message: {
    text: "Missing you! 💕",
    position: { x: 0.5, y: 0.8 }, // Relative positioning (0-1)
    style: {
      fontSize: 24,
      color: "#FFFFFF",
      fontFamily: "default",
      backgroundColor: "rgba(0,0,0,0.5)",
      textAlign: "center"
    }
  },
  
  // Reactions
  reactions: [
    {
      emoji: "❤️",
      userId: "partner-uuid",
      timestamp: "2024-01-15T10:31:00Z"
    }
  ],
  
  // Status Tracking
  status: {
    sent: "2024-01-15T10:30:00Z",
    delivered: "2024-01-15T10:30:05Z",
    read: "2024-01-15T10:31:00Z",
    saved: false
  },
  
  // Settings
  ephemeral: {
    enabled: false,
    expiresAt: null,
    viewOnce: false
  },
  
  // Metadata
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:31:00Z"
}
```

#### Presence Sub-collection
```javascript
// Path: /couples/{coupleId}/presence/{userId}
{
  status: "online",
  lastSeen: "2024-01-15T10:30:00Z",
  activity: "typing", // camera_open | typing | viewing_photo | null
  activeDevice: {
    deviceId: "device-uuid",
    platform: "ios",
    appVersion: "1.0.0"
  },
  heartbeat: "2024-01-15T10:30:00Z"
}
```

### Firebase Storage Structure
```
/storage-bucket/
├── /photos/
│   └── /{userId}/
│       └── /{timestamp}_{messageId}/
│           ├── original.enc       # Encrypted original
│           ├── display_720p.jpg   # Display version
│           ├── thumb_150px.jpg    # Thumbnail
│           └── metadata.json      # Photo metadata
│
├── /avatars/
│   └── /{userId}/
│       ├── avatar_current.jpg
│       └── avatar_history/
│           └── {timestamp}.jpg
│
├── /shared_album/
│   └── /{coupleId}/
│       └── /{messageId}/
│           └── full_quality.jpg
│
└── /temp/
    └── /{sessionId}/
        └── pending_upload.jpg     # Temporary upload storage
```

---

## Data Flow Patterns

### 1. Message Send Flow

```
User Journey:
1. User opens camera
2. Takes photo
3. Adds text message
4. Hits send button
5. Sees "sent" confirmation

Technical Flow:
┌──────────────┐
│ Take Photo   │
└──────┬───────┘
       ↓
┌──────────────┐
│  Compress    │ → JPEG 70% quality
│  (Client)    │ → Reduce to ~500KB
└──────┬───────┘
       ↓
┌──────────────┐
│   Encrypt    │ → AES-256-GCM
│  (Client)    │ → Using recipient's public key
└──────┬───────┘
       ↓
┌──────────────┐
│Upload Storage│ → Firebase Storage
│   (HTTPS)    │ → Resumable upload
└──────┬───────┘ → Return URLs
       ↓
┌──────────────┐
│Create Message│ → Firestore document
│  Document    │ → Include metadata
└──────┬───────┘ → Trigger Cloud Function
       ↓
┌──────────────┐
│Send Push     │ → FCM
│ Notification │ → To recipient device
└──────────────┘
```

### 2. Message Receive Flow

#### Active Mode (App in Foreground)
```
Technical Flow:
┌──────────────┐
│  Firestore   │
│   Listener   │ → Real-time WebSocket
└──────┬───────┘
       ↓
┌──────────────┐
│New Document  │
│  Detected    │ → Message metadata
└──────┬───────┘
       ↓
┌──────────────┐
│Download Photo│ → From Storage URL
│   (HTTPS)    │ → Progressive loading
└──────┬───────┘
       ↓
┌──────────────┐
│   Decrypt    │ → Using private key
│  (Client)    │ → AES-256-GCM
└──────┬───────┘
       ↓
┌──────────────┐
│Display in UI │ → Slide animation
│              │ → Auto-mark read
└──────────────┘
```

#### Passive Mode (App in Background/Closed)
```
Technical Flow:
┌──────────────┐
│FCM Receives  │
│Push Trigger  │ → From Cloud Function
└──────┬───────┘
       ↓
┌──────────────┐
│Process Push  │ → Download thumbnail
│  Payload     │ → Prepare notification
└──────┬───────┘
       ↓
┌──────────────┐
│Show Rich     │ → Large image preview
│ Notification │ → Action buttons
└──────┬───────┘
       ↓
┌──────────────┐
│ User Taps    │ → Open app
│              │ → Navigate to message
└──────┬───────┘
       ↓
┌──────────────┐
│Sync Messages │ → Fetch from Firestore
│              │ → Download full images
└──────────────┘
```

### 3. Real-time Presence Flow

```
Presence State Machine:
┌──────────────┐
│   App Open   │
└──────┬───────┘
       ↓
┌──────────────┐
│ Set Online   │ → Update Firestore
│              │ → Start heartbeat
└──────┬───────┘
       ↓
┌──────────────┐
│Monitor Partner│ → Subscribe to changes
│   Presence   │ → Update UI
└──────┬───────┘
       ↓
┌──────────────┐
│App Background│ → Set "away"
│              │ → Maintain connection
└──────┬───────┘
       ↓
┌──────────────┐
│App Terminated│ → onDisconnect trigger
│              │ → Set "offline"
└──────────────┘
```

---

## Security Implementation

### End-to-End Encryption Architecture

#### Key Exchange Protocol
```
1. Initial Pairing:
   - Each user generates RSA-2048 key pair
   - Public keys exchanged during pairing
   - Keys stored securely in device keychain

2. Session Keys:
   - ECDH for session key derivation
   - AES-256-GCM for message encryption
   - New session key every 100 messages

3. Forward Secrecy:
   - Ephemeral keys per session
   - Old keys deleted after use
   - Cannot decrypt past messages if compromised
```

#### Encryption Flow
```javascript
// Encryption Process
function encryptPhoto(photoData, recipientPublicKey) {
  // 1. Generate ephemeral key pair
  const ephemeralKeyPair = generateECDHKeyPair();
  
  // 2. Derive shared secret
  const sharedSecret = deriveSharedSecret(
    ephemeralKeyPair.private,
    recipientPublicKey
  );
  
  // 3. Generate AES key from shared secret
  const aesKey = HKDF(sharedSecret, salt, info);
  
  // 4. Encrypt photo data
  const iv = generateRandomIV();
  const encryptedData = AES_GCM_Encrypt(photoData, aesKey, iv);
  
  // 5. Package encrypted payload
  return {
    ephemeralPublicKey: ephemeralKeyPair.public,
    iv: iv,
    ciphertext: encryptedData,
    mac: generateHMAC(encryptedData, aesKey)
  };
}
```

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isInCouple(coupleId) {
      return isAuthenticated() && 
        request.auth.uid in get(/databases/$(database)/documents/couples/$(coupleId)).data.users;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isUser(userId) || 
                     (isAuthenticated() && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.partnerId == userId);
      allow write: if isUser(userId);
    }
    
    // Couples collection
    match /couples/{coupleId} {
      allow read: if isInCouple(coupleId);
      allow update: if isInCouple(coupleId);
      allow create: if isAuthenticated() && 
                       request.auth.uid in request.resource.data.users;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated() && 
                    (request.auth.uid == resource.data.senderId || 
                     request.auth.uid == resource.data.recipientId);
      allow create: if isAuthenticated() && 
                       request.auth.uid == request.resource.data.senderId && 
                       isInCouple(request.resource.data.coupleId);
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.recipientId && 
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['status', 'reactions']);
    }
    
    // Presence sub-collection
    match /couples/{coupleId}/presence/{userId} {
      allow read: if isInCouple(coupleId);
      allow write: if isUser(userId) && isInCouple(coupleId);
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidImage() {
      return request.resource.size < 10 * 1024 * 1024 && // Max 10MB
             request.resource.contentType.matches('image/.*');
    }
    
    // Photos storage
    match /photos/{userId}/{allPaths=**} {
      allow read: if isUser(userId) || 
                    (isAuthenticated() && 
                     resource.metadata['recipientId'] == request.auth.uid);
      allow write: if isUser(userId) && isValidImage();
      allow delete: if isUser(userId);
    }
    
    // Avatars storage
    match /avatars/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isUser(userId) && isValidImage();
    }
    
    // Shared album
    match /shared_album/{coupleId}/{allPaths=**} {
      allow read, write: if isAuthenticated() && 
                           request.auth.uid in get(/databases/$(database)/documents/couples/$(coupleId)).data.users;
    }
  }
}
```

### Additional Security Measures

1. **Certificate Pinning**: Prevent MITM attacks
2. **Biometric Authentication**: FaceID/TouchID/Fingerprint
3. **Secure Storage**: iOS Keychain, Android Keystore
4. **Obfuscation**: ProGuard (Android), Swift obfuscation (iOS)
5. **Rate Limiting**: Cloud Functions throttling
6. **Input Validation**: Client and server-side
7. **XSS Prevention**: Sanitize all text inputs
8. **CSRF Protection**: Token validation

---

## API Patterns

### Service Layer Architecture

#### Message Service Interface
```typescript
interface IMessageService {
  // Create
  sendMessage(photo: Photo, text: string, options?: MessageOptions): Promise<Message>;
  
  // Read
  getMessages(coupleId: string, pagination: Pagination): Promise<Message[]>;
  getMessage(messageId: string): Promise<Message>;
  
  // Update
  markAsRead(messageId: string): Promise<void>;
  markAsDelivered(messageId: string): Promise<void>;
  addReaction(messageId: string, emoji: string): Promise<void>;
  removeReaction(messageId: string, emoji: string): Promise<void>;
  saveToAlbum(messageId: string): Promise<void>;
  
  // Delete
  deleteMessage(messageId: string): Promise<void>;
  deleteExpiredMessages(): Promise<number>;
  
  // Real-time
  subscribeToMessages(coupleId: string, callback: MessageCallback): Unsubscribe;
  subscribeToTyping(coupleId: string, callback: TypingCallback): Unsubscribe;
}
```

#### Photo Service Interface
```typescript
interface IPhotoService {
  // Capture
  capturePhoto(options: CameraOptions): Promise<PhotoAsset>;
  selectFromGallery(): Promise<PhotoAsset>;
  
  // Process
  compressPhoto(uri: string, quality: number): Promise<CompressedPhoto>;
  generateThumbnail(uri: string, size: Size): Promise<Thumbnail>;
  addTextOverlay(photo: PhotoAsset, text: TextOverlay): Promise<PhotoAsset>;
  
  // Encrypt
  encryptPhoto(photo: CompressedPhoto, publicKey: string): Promise<EncryptedPhoto>;
  decryptPhoto(encrypted: EncryptedPhoto, privateKey: string): Promise<PhotoAsset>;
  
  // Upload/Download
  uploadPhoto(photo: EncryptedPhoto): Promise<PhotoUrls>;
  downloadPhoto(url: string, options?: DownloadOptions): Promise<PhotoAsset>;
  
  // Cache
  cachePhoto(messageId: string, photo: PhotoAsset): Promise<void>;
  getCachedPhoto(messageId: string): Promise<PhotoAsset | null>;
  clearCache(): Promise<void>;
}
```

#### Notification Service Interface
```typescript
interface INotificationService {
  // Permissions
  requestPermission(): Promise<PermissionStatus>;
  checkPermission(): Promise<PermissionStatus>;
  
  // Token Management
  getToken(): Promise<string>;
  refreshToken(): Promise<string>;
  deleteToken(): Promise<void>;
  
  // Handlers
  onMessage(handler: (message: RemoteMessage) => void): Unsubscribe;
  onNotificationOpenedApp(handler: (message: RemoteMessage) => void): Unsubscribe;
  getInitialNotification(): Promise<RemoteMessage | null>;
  
  // Local Notifications
  displayLocalNotification(notification: LocalNotification): Promise<void>;
  scheduleNotification(notification: ScheduledNotification): Promise<string>;
  cancelScheduledNotification(notificationId: string): Promise<void>;
  
  // Badge Management
  setBadgeCount(count: number): Promise<void>;
  getBadgeCount(): Promise<number>;
  clearBadge(): Promise<void>;
}
```

#### Presence Service Interface
```typescript
interface IPresenceService {
  // Status Management
  setOnline(): Promise<void>;
  setOffline(): Promise<void>;
  setAway(): Promise<void>;
  
  // Activity
  setActivity(activity: UserActivity): Promise<void>;
  clearActivity(): Promise<void>;
  
  // Partner Monitoring
  watchPartnerPresence(callback: (presence: Presence) => void): Unsubscribe;
  getPartnerPresence(): Promise<Presence>;
  
  // Heartbeat
  startHeartbeat(intervalMs: number): void;
  stopHeartbeat(): void;
  
  // Typing Indicators
  setTyping(isTyping: boolean): Promise<void>;
  watchPartnerTyping(callback: (isTyping: boolean) => void): Unsubscribe;
}
```

#### Authentication Service Interface
```typescript
interface IAuthService {
  // Phone Auth
  sendVerificationCode(phoneNumber: string): Promise<ConfirmationResult>;
  verifyCode(confirmationResult: ConfirmationResult, code: string): Promise<User>;
  
  // User Management
  getCurrentUser(): User | null;
  updateProfile(updates: ProfileUpdates): Promise<void>;
  deleteAccount(): Promise<void>;
  
  // Partner Pairing
  generateInviteCode(): Promise<string>;
  acceptInvite(inviteCode: string): Promise<Couple>;
  unpair(): Promise<void>;
  
  // Session
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
  
  // Security
  enableBiometric(): Promise<void>;
  disableBiometric(): Promise<void>;
  verifyBiometric(): Promise<boolean>;
}
```

### API Error Handling

```typescript
// Custom Error Classes
class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public recoverable: boolean = true,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error Codes
enum ErrorCode {
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  
  // Business Logic
  COUPLE_NOT_FOUND = 'COUPLE_NOT_FOUND',
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  ALREADY_PAIRED = 'ALREADY_PAIRED',
  
  // Server
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Storage
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}

// Error Handler
class ErrorHandler {
  static handle(error: APIError): void {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        if (error.recoverable) {
          this.retry();
        } else {
          this.showOfflineMessage();
        }
        break;
        
      case ErrorCode.SESSION_EXPIRED:
        this.redirectToLogin();
        break;
        
      case ErrorCode.FILE_TOO_LARGE:
        this.showError('Photo must be less than 10MB');
        break;
        
      default:
        this.showGenericError(error.message);
    }
  }
}
```

---

## Performance Optimizations

### Image Optimization Pipeline

#### Compression Strategy
```
Original Photo (8-12MB)
         ↓
Quality Assessment
         ↓
Dynamic Compression (JPEG 60-80%)
         ↓
Target: 300KB-800KB
         ↓
Generate Variants:
├── Thumbnail: 150x150, ~10KB (WebP where supported)
├── Display: 720p, ~80KB (JPEG)
├── Full: 1080p, ~300KB (JPEG)
└── Original: Encrypted, stored separately
```

#### Progressive Loading
```typescript
class ProgressiveImageLoader {
  async loadImage(messageId: string): Promise<void> {
    // 1. Show placeholder
    this.showPlaceholder();
    
    // 2. Load from memory cache (instant)
    const cached = await this.memoryCache.get(messageId);
    if (cached) {
      this.displayImage(cached);
      return;
    }
    
    // 3. Load thumbnail (fast)
    const thumbnail = await this.loadThumbnail(messageId);
    this.displayImage(thumbnail);
    
    // 4. Load from disk cache
    const diskCached = await this.diskCache.get(messageId);
    if (diskCached) {
      this.displayImage(diskCached);
      this.memoryCache.set(messageId, diskCached);
      return;
    }
    
    // 5. Load display quality (background)
    const display = await this.loadDisplay(messageId);
    this.displayImage(display);
    
    // 6. Preload full quality (optional)
    this.preloadFull(messageId);
  }
}
```

### Network Optimization

#### Connection Pooling
```typescript
class ConnectionManager {
  private pools: Map<string, ConnectionPool> = new Map();
  
  constructor() {
    // Initialize connection pools
    this.pools.set('firestore', new ConnectionPool({
      maxConnections: 5,
      keepAlive: true,
      timeout: 30000
    }));
    
    this.pools.set('storage', new ConnectionPool({
      maxConnections: 10,
      keepAlive: true,
      timeout: 60000
    }));
  }
  
  async request(service: string, request: Request): Promise<Response> {
    const pool = this.pools.get(service);
    const connection = await pool.acquire();
    
    try {
      return await connection.send(request);
    } finally {
      pool.release(connection);
    }
  }
}
```

#### Predictive Upload
```typescript
class PredictiveUploadManager {
  private uploadQueue: Map<string, Promise<string>> = new Map();
  
  // Start upload immediately after capture
  onPhotoCaptured(photoUri: string): string {
    const uploadId = generateId();
    
    // Start upload in background
    this.uploadQueue.set(uploadId, this.uploadPhoto(photoUri));
    
    return uploadId;
  }
  
  // Complete send when user adds message
  async sendMessage(uploadId: string, message: string): Promise<void> {
    // Upload often already complete!
    const photoUrl = await this.uploadQueue.get(uploadId);
    
    // Just save reference now
    await this.saveMessage({
      photoUrl,
      message,
      timestamp: now()
    });
  }
}
```

### Caching Strategy

#### Multi-Level Cache
```typescript
class CacheManager {
  private memoryCache: LRUCache<string, any>;
  private diskCache: DiskCache;
  
  constructor() {
    // Memory cache: 50MB limit
    this.memoryCache = new LRUCache({
      max: 50 * 1024 * 1024,
      ttl: 1000 * 60 * 60 // 1 hour
    });
    
    // Disk cache: 500MB limit
    this.diskCache = new DiskCache({
      maxSize: 500 * 1024 * 1024,
      directory: 'cache/photos'
    });
  }
  
  async get(key: string): Promise<any> {
    // Check memory first (fastest)
    const memoryHit = this.memoryCache.get(key);
    if (memoryHit) return memoryHit;
    
    // Check disk (fast)
    const diskHit = await this.diskCache.get(key);
    if (diskHit) {
      // Promote to memory
      this.memoryCache.set(key, diskHit);
      return diskHit;
    }
    
    // Cache miss
    return null;
  }
  
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    // Save to memory
    this.memoryCache.set(key, value);
    
    // Save to disk (async)
    if (options?.persistent) {
      await this.diskCache.set(key, value);
    }
  }
}
```

### Real-time Optimization

#### Debounced Operations
```typescript
class OptimizedPresenceManager {
  private typingTimeout: NodeJS.Timeout;
  private activityTimeout: NodeJS.Timeout;
  private batchedUpdates: Map<string, any> = new Map();
  
  // Debounced typing indicator
  setTyping(isTyping: boolean): void {
    clearTimeout(this.typingTimeout);
    
    if (isTyping) {
      this.updateTypingStatus(true);
      
      // Auto-clear after 3 seconds
      this.typingTimeout = setTimeout(() => {
        this.updateTypingStatus(false);
      }, 3000);
    } else {
      this.updateTypingStatus(false);
    }
  }
  
  // Throttled activity updates
  setActivity(activity: string): void {
    clearTimeout(this.activityTimeout);
    
    this.activityTimeout = setTimeout(() => {
      this.updateActivity(activity);
    }, 500); // Throttle to max once per 500ms
  }
  
  // Batched read receipts
  markAsRead(messageId: string): void {
    this.batchedUpdates.set(messageId, { read: true });
    this.scheduleBatchUpdate();
  }
  
  private scheduleBatchUpdate(): void {
    setTimeout(() => {
      if (this.batchedUpdates.size > 0) {
        this.sendBatchUpdate(this.batchedUpdates);
        this.batchedUpdates.clear();
      }
    }, 1000); // Batch updates every second
  }
}
```

---

## Development Patterns

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── camera/
│   │   ├── CameraView/
│   │   ├── CameraControls/
│   │   └── PhotoPreview/
│   └── messaging/
│       ├── MessageBubble/
│       ├── MessageList/
│       └── TextOverlay/
│
├── screens/             # Screen components
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── VerificationScreen.tsx
│   │   └── PairingScreen.tsx
│   ├── main/
│   │   ├── CameraScreen.tsx
│   │   ├── GalleryScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── onboarding/
│       └── OnboardingScreen.tsx
│
├── services/            # Business logic
│   ├── api/
│   │   ├── messageService.ts
│   │   ├── photoService.ts
│   │   └── authService.ts
│   ├── firebase/
│   │   ├── firestore.ts
│   │   ├── storage.ts
│   │   └── functions.ts
│   └── encryption/
│       └── cryptoService.ts
│
├── hooks/               # Custom React hooks
│   ├── useMessages.ts
│   ├── usePresence.ts
│   ├── useCamera.ts
│   └── useNotifications.ts
│
├── utils/               # Utility functions
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validators.ts
│   └── formatters.ts
│
├── types/               # TypeScript definitions
│   ├── models.ts
│   ├── api.ts
│   └── navigation.ts
│
├── store/               # State management
│   ├── userStore.ts
│   ├── messageStore.ts
│   └── uiStore.ts
│
├── navigation/          # Navigation configuration
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
│
└── assets/              # Static assets
    ├── images/
    ├── fonts/
    └── sounds/
```

### Code Style Guidelines

#### TypeScript Best Practices
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  avatar?: string; // Optional properties
}

// Use type for unions and primitives
type Status = 'online' | 'offline' | 'away';
type UserId = string;

// Use enums for constants
enum MessageType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO', // Future
  VOICE = 'VOICE'  // Future
}

// Use generics for reusable components
interface ApiResponse<T> {
  data: T;
  error?: Error;
  loading: boolean;
}

// Prefer const assertions
const ROUTES = {
  HOME: '/',
  CAMERA: '/camera',
  GALLERY: '/gallery'
} as const;

// Use discriminated unions for complex states
type LoadingState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

#### React Patterns
```typescript
// Custom Hook Pattern
function useMessages(coupleId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let unsubscribe: Unsubscribe;
    
    const loadMessages = async () => {
      try {
        setLoading(true);
        unsubscribe = await subscribeToMessages(coupleId, (msgs) => {
          setMessages(msgs);
          setLoading(false);
        });
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
    
    loadMessages();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [coupleId]);
  
  return { messages, loading, error };
}

// Component Composition Pattern
const MessageScreen: React.FC = () => {
  return (
    <Screen>
      <Header />
      <MessageList>
        <MessageProvider>
          <Messages />
        </MessageProvider>
      </MessageList>
      <MessageInput />
    </Screen>
  );
};

// Render Props Pattern
const WithCamera: React.FC<{
  children: (camera: CameraAPI) => React.ReactNode;
}> = ({ children }) => {
  const camera = useCamera();
  return <>{children(camera)}</>;
};

// HOC Pattern (less common with hooks)
const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <Component {...props} />;
  };
};
```

### Testing Patterns

```typescript
// Unit Test Example
describe('MessageService', () => {
  it('should encrypt message before sending', async () => {
    const mockPhoto = createMockPhoto();
    const mockText = 'Test message';
    
    const result = await messageService.sendMessage(mockPhoto, mockText);
    
    expect(result.photoData.encrypted).toBe(true);
    expect(result.message.text).toBe(mockText);
    expect(mockEncrypt).toHaveBeenCalledWith(mockPhoto);
  });
});

// Integration Test Example
describe('Photo Message Flow', () => {
  it('should complete full send/receive cycle', async () => {
    // Setup
    const { sender, receiver } = await createTestCouple();
    
    // Send message
    const sentMessage = await sender.sendPhotoMessage(
      testPhoto,
      'Hello!'
    );
    
    // Verify receiver gets it
    await waitFor(() => {
      expect(receiver.messages).toContainEqual(
        expect.objectContaining({
          id: sentMessage.id,
          text: 'Hello!'
        })
      );
    });
  });
});

// Component Test Example
describe('CameraScreen', () => {
  it('should capture and preview photo', async () => {
    const { getByTestId, getByText } = render(<CameraScreen />);
    
    // Take photo
    fireEvent.press(getByTestId('capture-button'));
    
    // Wait for preview
    await waitFor(() => {
      expect(getByTestId('photo-preview')).toBeTruthy();
    });
    
    // Add message
    fireEvent.changeText(
      getByTestId('message-input'),
      'Test message'
    );
    
    // Send
    fireEvent.press(getByText('Send'));
    
    // Verify sent
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Object),
      'Test message'
    );
  });
});
```

---

## Testing Strategy

### Test Coverage Requirements

| Component | Unit Tests | Integration Tests | E2E Tests | Target Coverage |
|-----------|-----------|-------------------|-----------|-----------------|
| Services | ✅ Required | ✅ Required | - | 90% |
| Hooks | ✅ Required | ⚠️ Optional | - | 85% |
| Utils | ✅ Required | - | - | 100% |
| Components | ✅ Required | ⚠️ Optional | - | 80% |
| Screens | ⚠️ Optional | ✅ Required | ✅ Required | 75% |
| Navigation | - | ✅ Required | ✅ Required | 70% |

### Testing Tools

1. **Unit Testing**: Jest + React Testing Library
2. **Integration Testing**: Jest + Firebase Emulators
3. **E2E Testing**: Detox (React Native)
4. **Performance Testing**: React Native Performance Monitor
5. **Security Testing**: OWASP ZAP, MobSF

### Critical User Flows to Test

1. **Onboarding Flow**
   - Phone verification
   - Partner pairing
   - Permissions setup

2. **Photo Message Flow**
   - Capture photo
   - Add text overlay
   - Send message
   - Receive notification
   - View message

3. **Active Session Flow**
   - Both users online
   - Real-time delivery
   - Presence indicators

4. **Offline Flow**
   - Send while offline
   - Queue messages
   - Sync when online

---

## Deployment Configuration

### Environment Configurations

#### Development Environment
```env
# .env.development
API_ENV=development
FIREBASE_API_KEY=AIzaSyDevelopment...
FIREBASE_AUTH_DOMAIN=couplesnap-dev.firebaseapp.com
FIREBASE_PROJECT_ID=couplesnap-dev
FIREBASE_STORAGE_BUCKET=couplesnap-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:ios:abc123

# Feature Flags
ENABLE_ENCRYPTION=false
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
DEBUG_MODE=true
LOG_LEVEL=debug
```

#### Staging Environment
```env
# .env.staging
API_ENV=staging
FIREBASE_API_KEY=AIzaSyStaging...
FIREBASE_AUTH_DOMAIN=couplesnap-staging.firebaseapp.com
FIREBASE_PROJECT_ID=couplesnap-staging
FIREBASE_STORAGE_BUCKET=couplesnap-staging.appspot.com

ENABLE_ENCRYPTION=true
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
DEBUG_MODE=false
LOG_LEVEL=info
```

#### Production Environment
```env
# .env.production
API_ENV=production
FIREBASE_API_KEY=AIzaSyProduction...
FIREBASE_AUTH_DOMAIN=couplesnap.firebaseapp.com
FIREBASE_PROJECT_ID=couplesnap
FIREBASE_STORAGE_BUCKET=couplesnap.appspot.com

ENABLE_ENCRYPTION=true
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
DEBUG_MODE=false
LOG_LEVEL=error
```

### Build Configuration

#### iOS Build (Xcode)
```bash
# Development build
xcodebuild -workspace ios/CoupleSnap.xcworkspace \
  -scheme CoupleSnap \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 14'

# Production build
xcodebuild -workspace ios/CoupleSnap.xcworkspace \
  -scheme CoupleSnap \
  -configuration Release \
  -sdk iphoneos \
  archive -archivePath build/CoupleSnap.xcarchive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/CoupleSnap.xcarchive \
  -exportPath build \
  -exportOptionsPlist ios/exportOptions.plist
```

#### Android Build (Gradle)
```bash
# Development build
cd android
./gradlew assembleDebug

# Production build
./gradlew bundleRelease

# Generate signed APK
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=$KEYSTORE_FILE \
  -Pandroid.injected.signing.store.password=$KEYSTORE_PASSWORD \
  -Pandroid.injected.signing.key.alias=$KEY_ALIAS \
  -Pandroid.injected.signing.key.password=$KEY_PASSWORD
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run type-check

  build-ios:
    runs-on: macos-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: cd ios && pod install
      - run: npm run build:ios
      - uses: actions/upload-artifact@v2
        with:
          name: ios-build
          path: ios/build

  build-android:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build:android
      - uses: actions/upload-artifact@v2
        with:
          name: android-build
          path: android/app/build/outputs

  deploy:
    runs-on: ubuntu-latest
    needs: [build-ios, build-android]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Firebase
        run: firebase deploy --only hosting,functions,firestore:rules
      
      - name: Upload to App Store Connect
        run: xcrun altool --upload-app
      
      - name: Upload to Google Play Console
        run: fastlane supply
```

---

## Monitoring & Analytics

### Key Performance Indicators (KPIs)

#### Technical Metrics
| Metric | Target | Alert Threshold | Measurement |
|--------|--------|-----------------|-------------|
| App Launch Time | < 2s | > 3s | Cold start to camera ready |
| Photo Send Time | < 3s | > 5s | Capture to delivered |
| Crash Rate | < 0.5% | > 1% | Crashes per session |
| ANR Rate | < 0.1% | > 0.5% | Android not responding |
| API Success Rate | > 99% | < 95% | Successful API calls |
| Image Load Time | < 1s | > 2s | Thumbnail display |
| Memory Usage | < 150MB | > 200MB | Peak usage |
| Battery Drain | < 15%/hr | > 20%/hr | Active usage |

#### User Engagement Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users | > 80% | Unique users per day |
| Messages Per Day | > 10 | Average per couple |
| Session Duration | > 5 min | Average per session |
| Retention (D1) | > 80% | Next day return |
| Retention (D7) | > 60% | Week return |
| Retention (D30) | > 40% | Month return |
| Streak Retention | > 30% | 7+ day streaks |
| Feature Adoption | > 50% | Using key features |

### Analytics Implementation

```typescript
// Analytics Service
class AnalyticsService {
  // User Events
  trackUserSignUp(method: 'phone'): void {
    analytics().logSignUp({ method });
  }
  
  trackUserPaired(inviteMethod: 'code' | 'qr'): void {
    analytics().logEvent('user_paired', { inviteMethod });
  }
  
  // Message Events
  trackMessageSent(properties: {
    hasText: boolean;
    photoSize: number;
    compressionRatio: number;
    sendDuration: number;
  }): void {
    analytics().logEvent('message_sent', properties);
  }
  
  trackMessageReceived(properties: {
    deliveryTime: number;
    notificationType: 'push' | 'inApp';
  }): void {
    analytics().logEvent('message_received', properties);
  }
  
  // Performance Events
  trackAppLaunch(duration: number): void {
    performance().newTrace('app_launch').record(duration);
  }
  
  trackPhotoUpload(duration: number, size: number): void {
    const trace = performance().newTrace('photo_upload');
    trace.putAttribute('size', size.toString());
    trace.record(duration);
  }
}
```

### Error Monitoring

```typescript
// Crash Reporting
class CrashReporter {
  initialize(): void {
    crashlytics().setCrashlyticsCollectionEnabled(true);
    
    // Set user context
    const user = auth().currentUser;
    if (user) {
      crashlytics().setUserId(user.uid);
      crashlytics().setAttributes({
        coupleId: user.coupleId,
        appVersion: Config.VERSION
      });
    }
  }
  
  logError(error: Error, context?: any): void {
    crashlytics().recordError(error, context);
  }
  
  logWarning(message: string, context?: any): void {
    crashlytics().log(message);
    if (context) {
      crashlytics().setAttributes(context);
    }
  }
}
```

---

## Known Limitations & Constraints

### Technical Limitations

1. **File Size Limits**
   - Maximum photo size: 10MB
   - Maximum text length: 280 characters
   - Maximum reactions: 5 per message

2. **Performance Constraints**
   - Maximum 100 messages cached locally
   - Maximum 50 photos in memory
   - WebSocket timeout: 30 seconds
   - Upload timeout: 60 seconds

3. **Platform Limitations**
   - iOS: Screenshot detection only
   - Android: No screenshot prevention
   - Web: Not supported in MVP

4. **Feature Limitations**
   - No group chats
   - No video messages (MVP)
   - No voice messages (MVP)
   - No message editing
   - No message forwarding

### Business Constraints

1. **User Limitations**
   - One partner per account
   - Cannot change partner without deleting account
   - Cannot recover deleted messages

2. **Storage Limitations**
   - 30-day message history (free tier)
   - 100 photos in shared album (free tier)

3. **Regional Limitations**
   - Phone verification not available in all countries
   - Some features may be restricted by local laws

---

## Future Roadmap

### Version 1.1 (Month 2-3)
- **Video Messages**: 5-second video clips
- **Voice Notes**: Audio messages on photos
- **AR Filters**: Face filters and effects
- **Scheduled Messages**: Send photos at specific times
- **Message Reactions**: Expanded emoji set

### Version 1.2 (Month 4-6)
- **Web App**: Desktop browser support
- **Apple Watch App**: Quick photo responses
- **Android Widget**: Home screen widget
- **iOS Widget**: Lock screen widget
- **iPad App**: Optimized tablet experience

### Version 2.0 (Month 7-12)
- **AI Features**:
  - Auto-caption generation
  - Smart photo suggestions
  - Memory creation
  - Relationship insights
  
- **Premium Features**:
  - Unlimited storage
  - High-quality uploads
  - Custom themes
  - Priority support
  
- **Social Features**:
  - Shared stories (optional)
  - Double dates (4-person groups)
  - Anniversary celebrations

### Long-term Vision (Year 2+)
- **Physical Products**: Printed photo books
- **Integration**: Calendar, social media
- **Expansion**: Family mode, friends mode
- **Platform**: Relationship wellness tools
- **Monetization**: Premium subscriptions, prints

---

## Appendices

### A. Dependencies List

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-native-firebase/app": "^18.6.1",
    "@react-native-firebase/auth": "^18.6.1",
    "@react-native-firebase/firestore": "^18.6.1",
    "@react-native-firebase/storage": "^18.6.1",
    "@react-native-firebase/messaging": "^18.6.1",
    "@react-native-firebase/functions": "^18.6.1",
    "@react-native-firebase/crashlytics": "^18.6.1",
    "@react-native-firebase/analytics": "^18.6.1",
    "@react-native-firebase/perf": "^18.6.1",
    "react-native-vision-camera": "^3.6.4",
    "react-native-image-resizer": "^3.0.7",
    "react-native-fast-image": "^8.6.3",
    "react-native-permissions": "^3.10.1",
    "react-native-reanimated": "^3.5.4",
    "react-native-gesture-handler": "^2.13.4",
    "react-native-safe-area-context": "^4.7.4",
    "react-native-screens": "^3.27.0",
    "react-native-vector-icons": "^10.0.2",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-modal": "^13.0.1",
    "@notifee/react-native": "^7.8.0",
    "react-native-uuid": "^2.0.1",
    "react-native-async-storage": "^1.19.5",
    "react-native-keychain": "^8.1.2",
    "react-native-crypto-js": "^1.0.0",
    "react-native-haptic-feedback": "^2.2.0",
    "zustand": "^4.4.6"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/react": "^18.2.38",
    "@types/react-native": "^0.72.5",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.3.2",
    "detox": "^20.13.0",
    "eslint": "^8.51.0",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "prettier": "^3.0.3",
    "react-native-flipper": "^0.212.0",
    "reactotron-react-native": "^5.0.4"
  }
}
```

### B. Glossary

| Term | Definition |
|------|------------|
| **Active Session** | When both partners have the app open simultaneously |
| **Couple** | Two users linked together in the app |
| **E2E** | End-to-end encryption |
| **Ephemeral** | Messages that disappear after viewing |
| **FCM** | Firebase Cloud Messaging |
| **Passive Mode** | When one or both partners don't have app open |
| **Presence** | Online/offline status of users |
| **Read Receipt** | Confirmation that message was viewed |
| **Shared Album** | Collection of saved photos for the couple |
| **Streak** | Consecutive days of photo exchange |

### C. Support Contacts

- **Technical Issues**: tech-support@couplesnap.com
- **Bug Reports**: bugs@couplesnap.com
- **Security Issues**: security@couplesnap.com
- **Business Inquiries**: business@couplesnap.com

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Classification:** Internal - Development Team  
**Next Review:** December 2024

---

*End of Document*