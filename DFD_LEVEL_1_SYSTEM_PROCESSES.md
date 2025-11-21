# Level 1 DFD - System Processes
## MindMate Platform

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** MindMate - Full Stack Mental Wellness Platform

---

## Table of Contents

1. [Introduction](#introduction)
2. [DFD Notation](#dfd-notation)
3. [Major Processes](#major-processes)
4. [Data Stores](#data-stores)
5. [Level 1 Diagram](#level-1-diagram)
6. [Process Descriptions](#process-descriptions)
7. [Data Store Specifications](#data-store-specifications)
8. [Data Flow Details](#data-flow-details)

---

## 1. Introduction

### 1.1 Purpose
This document presents the Level 1 Data Flow Diagram for the MindMate platform. Level 1 DFD decomposes the single Process 0.0 (MindMate System) from Level 0 into major functional processes, showing how data flows between processes, external entities, and data stores.

### 1.2 Scope
The Level 1 DFD shows:
- 7 major functional processes
- 6 data stores
- Data flows between external entities and processes
- Data flows between processes and data stores
- Inter-process communication

### 1.3 Relationship to Other Levels
- **From Level 0:** Expands the single MindMate System process
- **To Level 2:** Each process will be further decomposed into sub-processes

---

## 2. DFD Notation

### 2.1 Standard Symbols

| Symbol | Name | Representation | Description |
|--------|------|----------------|-------------|
| ⬭ | External Entity | Rectangle | Person or system outside the system boundary |
| ⭕ | Process | Numbered Circle | Major functional activity (1.0, 2.0, etc.) |
| ═══ | Data Store | Parallel lines with ID | Repository for data (D1, D2, etc.) |
| → | Data Flow | Arrow | Movement of data |

### 2.2 Numbering Convention
- **Processes:** 1.0, 2.0, 3.0, etc. (major processes)
- **Data Stores:** D1, D2, D3, etc.
- **Data Flows:** Descriptive names

---

## 3. Major Processes

### 3.1 Process Overview

| Process ID | Process Name | Primary Function | External Entities |
|------------|--------------|------------------|-------------------|
| **1.0** | User Management | Registration, authentication, profile management | User, Admin, Firebase Auth |
| **2.0** | Mood Tracking | Mood entry, analytics, insights | User, Google Gemini AI |
| **3.0** | AI Chat System | Chat processing, crisis detection | User, Google Gemini AI |
| **4.0** | Community Forum | Posts, comments, reactions | User, Admin |
| **5.0** | Peer Matching | Match discovery, connections | User |
| **6.0** | Notification System | Notification delivery | User |
| **7.0** | Admin Management | User management, moderation, analytics | Admin |

### 3.2 Process Relationships

```
User ←→ 1.0 User Management ←→ D1: Users
User ←→ 2.0 Mood Tracking ←→ D2: Mood Entries
User ←→ 3.0 AI Chat System ←→ D3: Conversations
User ←→ 4.0 Community Forum ←→ D4: Forum Posts
User ←→ 5.0 Peer Matching ←→ D5: Matches
User ←→ 6.0 Notification System ←→ D6: Notifications
Admin ←→ 7.0 Admin Management ←→ All Data Stores
```

---

## 4. Data Stores

### 4.1 Data Store Overview

| Store ID | Store Name | Contents | Primary Access | Size Estimate |
|----------|------------|----------|----------------|---------------|
| **D1** | Users | User accounts, profiles, settings | 1.0, 5.0, 7.0 | ~10KB per user |
| **D2** | Mood Entries | Mood data, encrypted journals | 2.0, 5.0, 7.0 | ~5KB per entry |
| **D3** | Conversations | Chat history with AI | 3.0, 7.0 | ~50KB per conversation |
| **D4** | Forum Posts | Community posts, comments, reactions | 4.0, 7.0 | ~10KB per post |
| **D5** | Matches | Peer connections, requests | 5.0, 7.0 | ~1KB per match |
| **D6** | Notifications | System notifications | 6.0 | ~500B per notification |

### 4.2 Data Store Relationships

```
D1: Users ←→ D2: Mood Entries (user_id foreign key)
D1: Users ←→ D3: Conversations (user_id foreign key)
D1: Users ←→ D4: Forum Posts (user_id foreign key)
D1: Users ←→ D5: Matches (requester_id, target_id foreign keys)
D1: Users ←→ D6: Notifications (user_id foreign key)
```

---

## 5. Level 1 Diagram

### 5.1 Complete Level 1 DFD

```
                                    ┌──────────────────┐
                                    │  Google Gemini   │
                                    │       AI         │
                                    └────────┬─────────┘
                                             │
                                             │ AI Responses
                                             │
┌──────────┐                                 │
│   User   │                                 │
│(Student) │                                 ▼
└────┬─────┘                    Chat ┌─────────────┐
     │                          Msg  │     3.0     │      D3: Conversations
     │                         ┌────►│  AI Chat    │◄────►═══════════════════
     │                         │     │   System    │      (Read/Write)
     │                         │     └─────────────┘
     │                         │            │
     │                         │            │ Crisis Alert
     │                         │            ▼
     │                         │      (Back to User)
     │                         │
     │ Registration      ┌─────────────┐
     │ Login            │     1.0     │      D1: Users
     ├─────────────────►│    User     │◄────►═══════════
     │                  │ Management  │      (Read/Write)
     │◄─────────────────│             │
     │  Auth Token      └─────────────┘
     │  Profile              │    ▲
     │                       │    │
     │                       │    │ User Data
     │                       │    │
     │                       ▼    │
     │                  ┌──────────────┐
     │                  │   Firebase   │
     │                  │     Auth     │
     │                  └──────────────┘
     │
     │ Mood Entry       ┌─────────────┐
     ├─────────────────►│     2.0     │      D2: Mood Entries
     │                  │    Mood     │◄────►═══════════════════
     │◄─────────────────│  Tracking   │      (Read/Write)
     │  Statistics      └─────────────┘
     │  Insights              │    ▲
     │                        │    │
     │                        │    │ Mood Data
     │                        │    │ (for insights)
     │                        ▼    │
     │                  ┌──────────────┐
     │                  │Google Gemini │
     │                  │      AI      │
     │                  └──────────────┘
     │
     │ Forum Post       ┌─────────────┐
     │ Reactions        │     4.0     │      D4: Forum Posts
     ├─────────────────►│  Community  │◄────►═══════════════════
     │                  │   Forum     │      (Read/Write)
     │◄─────────────────│             │
     │  Posts           └─────────────┘
     │  Comments
     │
     │ Match Request    ┌─────────────┐
     ├─────────────────►│     5.0     │      D5: Matches
     │                  │    Peer     │◄────►═══════════
     │◄─────────────────│  Matching   │      (Read/Write)
     │  Suggestions     └──────┬──────┘
     │                         │
     │                         │ Match Events
     │                         │
     │                         ▼
     │                  ┌─────────────┐
     │                  │     6.0     │      D6: Notifications
     │◄─────────────────│Notification │◄────►═══════════════════
     │  Notifications   │   System    │      (Read/Write)
     │                  └──────▲──────┘
     │                         │
     │                         │ Notification Events
     │                         │
     │                         │ (from other processes)
     │
     │
     │
┌────┴─────┐
│  Admin   │
└────┬─────┘
     │
     │ Admin Commands   ┌─────────────┐
     ├─────────────────►│     7.0     │
     │                  │    Admin    │◄────► D1: Users
     │◄─────────────────│ Management  │       (Read/Write/Delete)
     │  Reports         │             │◄────► D2: Mood Entries
     │  Analytics       │             │       (Read/Delete)
     │  Alerts          │             │◄────► D3: Conversations
     │                  │             │       (Read)
     │                  │             │◄────► D4: Forum Posts
     │                  │             │       (Read/Delete)
     │                  │             │◄────► D5: Matches
     │                  └─────────────┘       (Read/Delete)
```

### 5.2 Simplified Process Flow

```
External Entities → Processes → Data Stores

User → 1.0 User Management → D1: Users
User → 2.0 Mood Tracking → D2: Mood Entries
User → 3.0 AI Chat System → D3: Conversations
User → 4.0 Community Forum → D4: Forum Posts
User → 5.0 Peer Matching → D5: Matches
User → 6.0 Notification System → D6: Notifications
Admin → 7.0 Admin Management → All Data Stores
```

---

## 6. Process Descriptions

### 6.1 Process 1.0: User Management

**Purpose:** Handle user registration, authentication, and profile management

**Inputs:**
- Registration data from User
- Login credentials from User
- Profile updates from User
- Auth requests to Firebase Auth

**Processing:**
- Validate user input
- Create new user accounts
- Authenticate users via Firebase
- Generate JWT tokens
- Update user profiles
- Manage user settings

**Outputs:**
- Auth tokens to User
- User profile data to User
- User data to D1: Users
- Success/error messages to User

**Data Store Access:**
- **D1: Users** - Read/Write

**External Systems:**
- **Firebase Auth** - Authentication service

**Key Features:**
- Email/password authentication
- Google OAuth integration
- Profile customization
- Privacy settings
- Account management

---

### 6.2 Process 2.0: Mood Tracking

**Purpose:** Record and analyze user mood entries with AI insights

**Inputs:**
- Mood entry data from User (level, journal, triggers, activities, sleep)
- View requests from User

**Processing:**
- Validate mood entry data
- Encrypt journal entries (AES-256-GCM)
- Store mood data
- Retrieve mood history
- Decrypt journal entries
- Calculate mood statistics (average, trends, patterns)
- Generate AI insights (optional, via Gemini AI)

**Outputs:**
- Success confirmation to User
- Mood statistics to User
- AI-generated insights to User
- Encrypted mood data to D2: Mood Entries

**Data Store Access:**
- **D2: Mood Entries** - Read/Write

**External Systems:**
- **Google Gemini AI** - For generating personalized insights

**Key Features:**
- 1-10 mood scale
- Encrypted journal entries
- Trigger tracking
- Activity correlation
- Sleep pattern analysis
- Trend visualization
- AI-powered insights

---

### 6.3 Process 3.0: AI Chat System

**Purpose:** Provide AI-powered conversational support with crisis detection

**Inputs:**
- Chat messages from User
- Conversation history from D3: Conversations

**Processing:**
- Receive user message
- Detect crisis keywords (suicide, self-harm, etc.)
- Format message with conversation context
- Send to Google Gemini AI
- Receive AI response
- Store conversation
- Trigger crisis alert if needed

**Outputs:**
- AI responses to User
- Crisis alerts to User (if detected)
- Conversation data to D3: Conversations

**Data Store Access:**
- **D3: Conversations** - Read/Write

**External Systems:**
- **Google Gemini AI** - Conversation processing

**Key Features:**
- Real-time chat interface
- Context-aware responses
- Crisis keyword detection
- Emergency resource display
- Conversation history
- Supportive AI personality

**Crisis Keywords Monitored:**
- suicide, kill myself, end it all
- self-harm, cutting, hurt myself
- no reason to live, give up
- overdose, pills, die

---

### 6.4 Process 4.0: Community Forum

**Purpose:** Enable peer-to-peer support through community discussions

**Inputs:**
- Forum posts from User (title, content, tags, anonymous flag)
- Reactions from User (supportive, helpful, relatable)
- Comments from User
- View/filter requests from User

**Processing:**
- Validate post content
- Check anonymous flag
- Create forum posts
- Retrieve posts with filters
- Add reactions to posts
- Add comments to posts
- Sort and rank posts

**Outputs:**
- Post confirmation to User
- Forum posts to User
- Filtered/sorted posts to User
- Post data to D4: Forum Posts

**Data Store Access:**
- **D4: Forum Posts** - Read/Write

**Key Features:**
- Anonymous posting option
- Tag-based filtering
- Three reaction types
- Nested comments
- Post sorting (recent, popular, trending)
- Search functionality

**Content Guidelines:**
- Supportive and respectful
- No personal attacks
- No spam or advertising
- Mental health focus

---

### 6.5 Process 5.0: Peer Matching

**Purpose:** Connect users with compatible peers for mutual support

**Inputs:**
- Find matches request from User
- Match requests from User
- Match responses from User (accept/reject)
- View matches request from User

**Processing:**
- Retrieve user profile from D1: Users
- Retrieve mood patterns from D2: Mood Entries
- Calculate match scores using algorithm:
  - University match: 30%
  - Year/level match: 20%
  - Mood pattern similarity: 30%
  - Activity overlap: 20%
- Rank matches by score
- Create match requests
- Update match status
- Trigger notifications via Process 6.0

**Outputs:**
- Match suggestions to User
- Match request confirmation to User
- Match status updates to User
- Match data to D5: Matches
- Notification events to Process 6.0

**Data Store Access:**
- **D1: Users** - Read (for profiles)
- **D2: Mood Entries** - Read (for patterns)
- **D5: Matches** - Read/Write

**Key Features:**
- Compatibility algorithm
- Match score display
- Connection requests
- Accept/reject functionality
- Match management
- Privacy protection

---

### 6.6 Process 6.0: Notification System

**Purpose:** Deliver real-time notifications to users

**Inputs:**
- Notification events from Process 5.0 (match requests)
- Notification events from Process 4.0 (post comments)
- Notification events from Process 3.0 (crisis alerts)
- View requests from User
- Mark as read requests from User
- Delete requests from User

**Processing:**
- Create notifications from events
- Format notifications by type:
  - Match notifications
  - Comment notifications
  - Post reaction notifications
  - System notifications
- Store notifications
- Retrieve user notifications
- Update read status
- Delete notifications

**Outputs:**
- Notifications to User
- Read status updates to User
- Notification data to D6: Notifications

**Data Store Access:**
- **D6: Notifications** - Read/Write/Delete

**Notification Types:**
1. **Match Notifications:** New match request, match accepted
2. **Forum Notifications:** Comment on post, reaction to post
3. **System Notifications:** Welcome message, feature updates
4. **Crisis Notifications:** Emergency resources triggered

**Key Features:**
- Real-time delivery
- Unread count badge
- Mark as read/unread
- Delete functionality
- Notification preferences
- Type-based filtering

---

### 6.7 Process 7.0: Admin Management

**Purpose:** Provide administrative tools for platform oversight

**Inputs:**
- Admin commands from Admin
- View users request from Admin
- Moderation actions from Admin
- Analytics requests from Admin
- Crisis monitoring requests from Admin

**Processing:**
- Authenticate admin access
- Retrieve all users
- Update user status (suspend/activate)
- Delete user accounts (cascade delete)
- Review forum posts
- Remove inappropriate content
- Generate system analytics:
  - User count and growth
  - Engagement metrics
  - Feature usage statistics
  - Crisis detection count
- Monitor crisis events
- Generate reports

**Outputs:**
- User list to Admin
- System reports to Admin
- Analytics data to Admin
- Crisis event logs to Admin
- Moderation queue to Admin

**Data Store Access:**
- **D1: Users** - Read/Write/Delete
- **D2: Mood Entries** - Read/Delete
- **D3: Conversations** - Read
- **D4: Forum Posts** - Read/Delete
- **D5: Matches** - Read/Delete
- **D6: Notifications** - Read

**Key Features:**
- User management dashboard
- Content moderation tools
- System analytics
- Crisis monitoring
- Report generation
- Admin account management

**Admin Capabilities:**
1. **User Management:** View, suspend, delete users
2. **Content Moderation:** Review and remove posts
3. **Analytics:** Platform metrics and insights
4. **Crisis Monitoring:** Track crisis detections
5. **System Health:** Performance monitoring

---

## 7. Data Store Specifications

### 7.1 D1: Users

**Purpose:** Store user account information and profiles

**Schema:**
```javascript
{
  _id: ObjectId,
  uid: String,              // Firebase UID
  email: String,
  name: String,
  university: String,
  year: String,
  bio: String,
  profilePicture: String,
  settings: {
    theme: String,
    notifications: Boolean,
    privacy: String
  },
  createdAt: Date,
  lastActive: Date,
  status: String            // active, suspended
}
```

**Primary Key:** `_id` (MongoDB ObjectId)  
**Unique Keys:** `uid`, `email`  
**Indexes:** `uid`, `email`, `university`, `year`

**Access Patterns:**
- **Process 1.0:** Create, read, update user accounts
- **Process 5.0:** Read user profiles for matching
- **Process 7.0:** Read all users, update status, delete users

**Estimated Size:** ~10KB per user  
**Growth Rate:** ~100 users per month (estimated)

---

### 7.2 D2: Mood Entries

**Purpose:** Store mood tracking data with encrypted journals

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Foreign key to D1: Users
  moodLevel: Number,        // 1-10
  encryptedJournal: {
    iv: String,
    encryptedData: String,
    authTag: String
  },
  triggers: [String],
  activities: [String],
  sleepHours: Number,
  timestamp: Date,
  createdAt: Date
}
```

**Primary Key:** `_id`  
**Foreign Key:** `userId` → D1.Users._id  
**Indexes:** `userId`, `timestamp`, `moodLevel`

**Access Patterns:**
- **Process 2.0:** Create mood entries, read mood history, calculate statistics
- **Process 5.0:** Read mood patterns for matching algorithm
- **Process 7.0:** Read for analytics, delete user data

**Encryption:** AES-256-GCM for journal entries  
**Estimated Size:** ~5KB per entry  
**Growth Rate:** ~1-7 entries per user per week

---

### 7.3 D3: Conversations

**Purpose:** Store AI chat conversation history

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Foreign key to D1: Users
  messages: [
    {
      role: String,         // user or assistant
      content: String,
      timestamp: Date
    }
  ],
  crisisDetected: Boolean,
  crisisKeywords: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Primary Key:** `_id`  
**Foreign Key:** `userId` → D1.Users._id  
**Indexes:** `userId`, `crisisDetected`, `createdAt`

**Access Patterns:**
- **Process 3.0:** Create conversations, append messages, read history
- **Process 7.0:** Read for crisis monitoring

**Estimated Size:** ~50KB per conversation  
**Growth Rate:** ~10-50 messages per user per week

---

### 7.4 D4: Forum Posts

**Purpose:** Store community forum posts, comments, and reactions

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Foreign key to D1: Users
  title: String,
  content: String,
  tags: [String],
  anonymous: Boolean,
  reactions: {
    supportive: Number,
    helpful: Number,
    relatable: Number
  },
  comments: [
    {
      userId: ObjectId,
      content: String,
      anonymous: Boolean,
      timestamp: Date
    }
  ],
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Primary Key:** `_id`  
**Foreign Key:** `userId` → D1.Users._id  
**Indexes:** `userId`, `tags`, `createdAt`, `reactions`

**Access Patterns:**
- **Process 4.0:** Create posts, read posts, add reactions, add comments
- **Process 7.0:** Read for moderation, delete inappropriate posts

**Estimated Size:** ~10KB per post  
**Growth Rate:** ~50-100 posts per week (estimated)

---

### 7.5 D5: Matches

**Purpose:** Store peer matching requests and connections

**Schema:**
```javascript
{
  _id: ObjectId,
  requesterId: ObjectId,    // Foreign key to D1: Users
  targetId: ObjectId,       // Foreign key to D1: Users
  status: String,           // pending, accepted, rejected
  matchScore: Number,       // 0-100
  message: String,
  createdAt: Date,
  respondedAt: Date
}
```

**Primary Key:** `_id`  
**Foreign Keys:** `requesterId` → D1.Users._id, `targetId` → D1.Users._id  
**Indexes:** `requesterId`, `targetId`, `status`, `matchScore`

**Access Patterns:**
- **Process 5.0:** Create match requests, read matches, update status
- **Process 7.0:** Read for analytics, delete user data

**Estimated Size:** ~1KB per match  
**Growth Rate:** ~20-50 matches per week (estimated)

---

### 7.6 D6: Notifications

**Purpose:** Store user notifications

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Foreign key to D1: Users
  type: String,             // match, comment, reaction, system, crisis
  content: String,
  relatedId: ObjectId,      // ID of related entity (post, match, etc.)
  read: Boolean,
  createdAt: Date
}
```

**Primary Key:** `_id`  
**Foreign Key:** `userId` → D1.Users._id  
**Indexes:** `userId`, `read`, `type`, `createdAt`

**Access Patterns:**
- **Process 6.0:** Create notifications, read notifications, update read status, delete
- **All Processes:** Trigger notification creation

**Estimated Size:** ~500B per notification  
**Growth Rate:** ~10-30 notifications per user per week

---

## 8. Data Flow Details

### 8.1 Inter-Process Communication

#### 8.1.1 Process 5.0 → Process 6.0
**Data Flow:** Match notification events  
**Trigger:** When match request created or responded to  
**Data:** `{ type: 'match', userId, content, relatedId }`

#### 8.1.2 Process 4.0 → Process 6.0
**Data Flow:** Forum notification events  
**Trigger:** When post receives comment or reaction  
**Data:** `{ type: 'comment', userId, content, relatedId }`

#### 8.1.3 Process 3.0 → Process 6.0
**Data Flow:** Crisis notification events  
**Trigger:** When crisis keywords detected  
**Data:** `{ type: 'crisis', userId, content, resources }`

### 8.2 Data Flow Characteristics

#### 8.2.1 Synchronous Flows
- User → Process 1.0 → D1: Users → User (Login)
- User → Process 2.0 → D2: Mood Entries (Mood entry)
- User → Process 4.0 → D4: Forum Posts (Post creation)

#### 8.2.2 Asynchronous Flows
- Process 5.0 → Process 6.0 (Notification creation)
- Process 2.0 → Google Gemini AI (Insight generation)
- Process 3.0 → Google Gemini AI (Chat response)

#### 8.2.3 Real-time Flows
- Process 6.0 → User (Notification delivery)
- Process 3.0 → User (Crisis alerts)

### 8.3 Data Volume Estimates

| Data Flow | Volume | Frequency |
|-----------|--------|-----------|
| User → 1.0 (Login) | ~1KB | Per session |
| User → 2.0 (Mood Entry) | ~5KB | Daily |
| User → 3.0 (Chat Message) | ~500B | Multiple per session |
| User → 4.0 (Forum Post) | ~10KB | Weekly |
| User → 5.0 (Match Request) | ~1KB | As needed |
| 6.0 → User (Notifications) | ~500B | Real-time |

---

## 9. Process Integration Summary

### 9.1 Process Dependencies

```
1.0 User Management (Core) → All other processes depend on user authentication
2.0 Mood Tracking → 5.0 Peer Matching (mood data for matching)
3.0 AI Chat System → 6.0 Notification System (crisis alerts)
4.0 Community Forum → 6.0 Notification System (post notifications)
5.0 Peer Matching → 6.0 Notification System (match notifications)
6.0 Notification System → User (delivery)
7.0 Admin Management → All data stores (oversight)
```

### 9.2 Critical Paths

**User Registration Flow:**
```
User → 1.0 User Management → Firebase Auth → D1: Users → User
```

**Mood Entry Flow:**
```
User → 2.0 Mood Tracking → D2: Mood Entries → User (Statistics)
```

**AI Chat Flow:**
```
User → 3.0 AI Chat → Google Gemini AI → D3: Conversations → User
```

**Peer Matching Flow:**
```
User → 5.0 Peer Matching → D1, D2 (Read) → D5: Matches → 6.0 Notifications → User
```

---

## 10. Next Steps

### 10.1 Level 2 DFD
Each of the 7 processes will be further decomposed into sub-processes:
- **1.0 User Management** → 1.1, 1.2, 1.3, 1.4, 1.5
- **2.0 Mood Tracking** → 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
- **3.0 AI Chat System** → 3.1, 3.2, 3.3, 3.4
- **4.0 Community Forum** → 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
- **5.0 Peer Matching** → 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
- **6.0 Notification System** → 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
- **7.0 Admin Management** → 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

---

**Document Control:**
- **Created by:** MindMate Development Team
- **Approved by:** Project Stakeholders
- **Next Review Date:** December 21, 2025
- **Version History:**
  - v1.0 (Nov 21, 2025): Initial Level 1 DFD - System Processes

---

**End of Level 1 DFD - System Processes**
