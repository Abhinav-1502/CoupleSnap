┌─────────────────────────────────────────────────────┐
│                  APP ARCHITECTURE                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  MODE 1: ACTIVE SESSION          MODE 2: PASSIVE    │
│  (Both in app)                   (One/both away)    │
│                                                      │
│  • WebSocket active              • Push notifications│
│  • Instant delivery              • Store & forward   │
│  • Rich interactions             • Queue messages    │
│  • Screen stays on               • Battery optimized │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## **Feature Set by Mode**

### **🟢 Active Session Features (Both Partners in App)**

| Feature Category | Capabilities | User Experience |
|-----------------|--------------|-----------------|
| **Presence** | Real-time online status, "Last seen", Activity indicators | Green dot, "Sarah is here 💕" |
| **Photo Status** | "Opening camera", "Taking photo", "Adding message" | See what partner is doing |
| **Instant Delivery** | < 1 second photo appears | Photos slide in from side |
| **Auto-behaviors** | Auto-open photos, Auto-mark read, Keep screen awake | Seamless flow |
| **Quick Actions** | Double-tap reactions, Swipe to capture, Quick emoji responses | ❤️ 😍 🔥 reactions |
| **Typing Indicators** | "Adding a message..." | See when partner is typing |
| **Quality Optimization** | Low-res instant preview → HD background load | Instant gratification |
| **Session Persistence** | Maintain connection, No reconnection overhead | Smooth experience |

### **🔔 Push Notification Features (Passive Mode)**

| Feature Category | Capabilities | User Experience |
|-----------------|--------------|-----------------|
| **Rich Notifications** | Large image preview, Message overlay, Action buttons | Full photo on lockscreen |
| **Smart Delivery** | Priority based on time, Location awareness, Do not disturb respect | Right time delivery |
| **Lockscreen Experience** | Full-screen intent (Android), Expanded view (iOS) | Prominent display |
| **Privacy Controls** | Blurred preview option, Hide message content, Show only sender | User-controlled privacy |
| **Quick Actions** | Reply from notification, Send reaction, Mark as read | No app open needed |
| **Offline Handling** | Queue when offline, Batch sync on reconnect | Never lose a message |
| **Wake Behaviors** | Screen wake on important, LED notification, Custom sounds | Attention-getting |

## **State Transitions**

### **How the App Switches Between Modes:**
```
APP LIFECYCLE FLOW:
                                           
Start App → Check Partner Status → Both Online? 
                |                      |
                No                    Yes
                ↓                      ↓
         PASSIVE MODE            ACTIVE SESSION
                ↑                      ↓
                └──── Partner Goes ────┘
                        Offline
```

### **Detailed State Machine:**

| Current State | Event | Next State | Actions |
|--------------|-------|------------|---------|
| **App Closed** | Receive photo | Show notification | Display rich push, Wake screen if configured |
| **App Background** | Receive photo | Show notification | Less intrusive notification |
| **App Foreground (alone)** | Receive photo | Show in-app alert | Banner notification |
| **App Foreground (both)** | Receive photo | Instant display | Slide in animation, No notification |
| **Active Session** | Partner leaves | Passive mode | Show "Partner left", Disable live features |
| **Passive Mode** | Partner returns | Active session | Show "Partner's back!", Enable live features |

## **Technical Feature Implementation**

### **Active Session Management:**
```
FEATURE ARCHITECTURE:

Presence System:
├── Heartbeat (every 30s)
├── Activity status
├── Connection quality
└── Last interaction time

Real-time Pipeline:
├── WebSocket connection (persistent)
├── Message queue (in-memory)
├── State synchronization
└── Optimistic updates

UI State:
├── Camera always ready
├── Gesture shortcuts enabled
├── Animations enhanced
└── Haptic feedback active
```

### **Push Notification System:**
```
NOTIFICATION ARCHITECTURE:

Trigger Pipeline:
├── New message created
├── Check recipient status
├── Determine notification type
└── Send via FCM

Notification Types:
├── Critical (full screen)
├── Rich media (large image)
├── Standard (basic alert)
└── Silent (background sync)

Delivery Strategy:
├── Time-based rules
├── Location awareness
├── Battery optimization
└── Network conditions
```

## **Feature Priority Matrix**

### **What Gets Built When:**

| Priority | Feature | Mode | Complexity | User Value |
|----------|---------|------|------------|------------|
| **P0 - Core** | Send/receive photos | Both | Low | Essential |
| **P0 - Core** | Basic push notifications | Passive | Low | Essential |
| **P0 - Core** | Message overlay on photos | Both | Low | Essential |
| **P1 - MVP** | Large image notifications | Passive | Medium | High |
| **P1 - MVP** | Online presence | Active | Medium | High |
| **P1 - MVP** | Read receipts | Both | Low | High |
| **P2 - Delight** | Typing indicators | Active | Medium | Medium |
| **P2 - Delight** | Photo status | Active | Medium | Medium |
| **P2 - Delight** | Quick reactions | Active | Low | High |
| **P3 - Growth** | Full-screen lockscreen | Passive | High | Medium |
| **P3 - Growth** | Auto-photo behaviors | Active | Medium | Medium |
| **P3 - Growth** | Session persistence | Active | High | Low |

## **User Journey Flows**

### **Scenario 1: Both Partners Active (Evening Together Apart)**
```
Sarah (At Home)                    Alex (At Office)
      |                                  |
  Opens App                          Opens App
      |                                  |
  Sees "Alex is here 💕"            Sees "Sarah is here 💕"
      |                                  |
  Takes selfie                      Sees "Sarah taking photo..."
      |                                  |
  Adds "Miss you!"                  (Preparing to respond)
      |                                  |
  Sends ────────0.5sec──────────→   Photo slides in
      |                                  |
  Sees "Alex viewing"                Laughs, double-tap ❤️
      |                                  |
  Receives reaction                 Takes response selfie
      |                                  |
  [Continues real-time exchange for 10 minutes]
```

### **Scenario 2: Passive Notification Flow**
```
Sarah (In Meeting)                  Alex (Commuting)
      |                                  |
  Phone in pocket                    Opens app
      |                                  |
      |                             Takes photo
      |                                  |
      |                             "Can't wait to see you"
      |                                  |
  [BUZZ - Notification]             Sent confirmation
      |                                  |
  Sees lockscreen:                      |
  ┌─────────────────┐                   |
  │ Alex 📸         │                   |
  │ [Large photo]   │                   |
  │ "Can't wait..." │                   |
  └─────────────────┘                   |
      |                                  |
  Quick ❤️ from notification            |
      |                                  |
  Back to meeting              Receives reaction