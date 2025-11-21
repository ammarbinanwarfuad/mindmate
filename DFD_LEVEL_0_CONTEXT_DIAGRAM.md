# Level 0 DFD - Context Diagram
## MindMate Platform

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** MindMate - Full Stack Mental Wellness Platform

---

## Table of Contents

1. [Introduction](#introduction)
2. [DFD Notation](#dfd-notation)
3. [External Entities](#external-entities)
4. [Main Process](#main-process)
5. [Context Diagram](#context-diagram)
6. [Data Flows](#data-flows)
7. [System Boundary](#system-boundary)

---

## 1. Introduction

### 1.1 Purpose
This document presents the Level 0 Data Flow Diagram (Context Diagram) for the MindMate platform. The context diagram provides a high-level view of the entire system, showing how it interacts with external entities without revealing internal processes.

### 1.2 Scope
The Level 0 DFD shows:
- The MindMate system as a single process (0.0)
- All external entities that interact with the system
- Major data flows between external entities and the system
- System boundary

### 1.3 Document Overview
This context diagram serves as the foundation for understanding the system's external interactions before diving into internal processes in Level 1 and Level 2 DFDs.

---

## 2. DFD Notation

### 2.1 Standard Symbols

| Symbol | Name | Representation | Description |
|--------|------|----------------|-------------|
| ⬭ | External Entity | Rectangle | Person, organization, or system outside the system boundary |
| ⭕ | Process | Circle/Oval | Activity that transforms data (entire system at Level 0) |
| → | Data Flow | Arrow | Movement of data between entities and processes |
| ═══ | Data Store | Parallel lines | Not shown at Level 0 (internal to system) |

### 2.2 Naming Conventions
- **External Entities:** Nouns (User, Admin, Google Gemini AI)
- **Process:** Verb phrase (MindMate System)
- **Data Flows:** Descriptive names (Registration Data, Mood Entries)

---

## 3. External Entities

### 3.1 Primary External Entities

#### 3.1.1 User (Student)
**Type:** Human Actor  
**Role:** Primary user of the platform  
**Description:** University students seeking mental wellness support

**Interactions with System:**
- **Inputs to System:**
  - Registration data (account creation)
  - Login credentials (authentication)
  - Mood entries (daily tracking)
  - Chat messages (AI interaction)
  - Forum posts (community engagement)
  - Match requests (peer connections)
  - Profile updates
  - Settings preferences

- **Outputs from System:**
  - Dashboard (personalized overview)
  - Mood statistics (analytics and insights)
  - AI responses (chat support)
  - Forum content (community posts)
  - Match suggestions (peer recommendations)
  - Notifications (system alerts)
  - Crisis alerts (emergency resources)

**Characteristics:**
- Age: 18+ university students
- Technical proficiency: Basic to intermediate
- Primary device: Mobile and desktop
- Usage frequency: Daily to weekly

---

#### 3.1.2 Admin (System Administrator)
**Type:** Human Actor  
**Role:** Platform administrator and moderator  
**Description:** Responsible for user management, content moderation, and system monitoring

**Interactions with System:**
- **Inputs to System:**
  - Admin commands (user management actions)
  - Moderation actions (content review)
  - System configuration (settings updates)
  - Report requests (analytics queries)
  - Crisis intervention (emergency response)

- **Outputs from System:**
  - System reports (platform analytics)
  - User analytics (engagement metrics)
  - Crisis event logs (emergency alerts)
  - Content moderation queue (flagged posts)
  - System health metrics (performance data)

**Characteristics:**
- Role: System administrator or mental health professional
- Access level: Elevated privileges
- Responsibilities: Safety, moderation, monitoring
- Usage frequency: Daily monitoring

---

### 3.2 Secondary External Entities (External Systems)

#### 3.2.1 Google Gemini AI
**Type:** External Service  
**Role:** AI-powered chat companion  
**Description:** Third-party AI service providing conversational support

**Interactions with System:**
- **Inputs from System:**
  - Chat messages (user queries with context)
  - Conversation history (for context awareness)
  - System prompts (behavior guidelines)

- **Outputs to System:**
  - AI responses (supportive messages)
  - Generated insights (mood analysis)
  - Conversation continuity (contextual replies)

**Technical Details:**
- API: Google Gemini API
- Model: Gemini 1.5 Flash
- Integration: RESTful API calls
- Response time: < 2 seconds

---

#### 3.2.2 Firebase Authentication
**Type:** External Service  
**Role:** Authentication and authorization provider  
**Description:** Third-party service managing user authentication

**Interactions with System:**
- **Inputs from System:**
  - Authentication requests (login attempts)
  - Registration data (new accounts)
  - Token validation requests (session verification)
  - OAuth requests (Google sign-in)

- **Outputs to System:**
  - Authentication tokens (JWT tokens)
  - User credentials (verified identity)
  - OAuth tokens (Google authentication)
  - Session status (active/expired)

**Technical Details:**
- Provider: Google Firebase
- Methods: Email/Password, Google OAuth
- Token type: JWT (JSON Web Tokens)
- Session duration: Configurable

---

## 4. Main Process

### 4.1 Process 0.0: MindMate System

**Name:** MindMate System  
**Type:** Main Process (entire system)  
**Description:** Complete mental wellness platform for university students

**Core Functions:**
1. User account management and authentication
2. Mood tracking with encrypted journal entries
3. AI-powered chat support with crisis detection
4. Community forum for peer support
5. Peer matching based on compatibility
6. Real-time notification system
7. Administrative tools for moderation and monitoring

**Technology Stack:**
- **Frontend:** React 18, TailwindCSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** Firebase Auth
- **AI Integration:** Google Gemini API
- **Encryption:** AES-256-GCM

**System Characteristics:**
- **Architecture:** MERN Stack (MongoDB, Express, React, Node.js)
- **Deployment:** Cloud-based (Vercel frontend, Railway backend)
- **Security:** End-to-end encryption, JWT authentication
- **Scalability:** Horizontal scaling capability
- **Availability:** 99.9% uptime target

---

## 5. Context Diagram

### 5.1 Visual Representation

```
                    Registration Data
                   ──────────────────►
                    Login Credentials
                   ──────────────────►
                    Mood Entries
                   ──────────────────►
                    Chat Messages
                   ──────────────────►
                    Forum Posts
                   ──────────────────►
    ┌──────────┐   Match Requests                    ┌──────────────────┐
    │          │   Profile Updates                    │                  │
    │   User   │──────────────────►                  │  Google Gemini   │
    │ (Student)│   Settings                           │       AI         │
    │          │                     ┌──────────┐    │                  │
    │          │                     │          │◄───│                  │
    │          │                     │   0.0    │    │  Chat Messages   │
    │          │◄────────────────────│ MindMate │───►│                  │
    │          │  Dashboard          │  System  │    └──────────────────┘
    │          │◄────────────────────│          │
    │          │  Mood Statistics    │          │◄───┐
    │          │◄────────────────────│          │    │
    │          │  AI Responses       │          │    │ Auth Tokens
    │          │◄────────────────────│          │───►│
    │          │  Forum Content      │          │    │ Auth Requests
    │          │◄────────────────────│          │    │
    │          │  Match Suggestions  └──────────┘    │
    │          │◄────────────────────     │          │
    │          │  Notifications           │          │
    │          │◄────────────────────     │          │
    │          │  Crisis Alerts           ▼          │
    └──────────┘◄────────────────────                │
                                      ┌──────────┐   │
    ┌──────────┐   Admin Commands    │ Firebase │   │
    │          │──────────────────►   │   Auth   │───┘
    │  Admin   │                      │          │
    │          │◄─────────────────────│          │
    │          │  System Reports      └──────────┘
    │          │◄─────────────────────
    │          │  User Analytics
    │          │◄─────────────────────
    │          │  Crisis Event Logs
    │          │◄─────────────────────
    │          │  Content Queue
    └──────────┘◄─────────────────────
```

### 5.2 Diagram Legend

```
┌──────────┐
│ External │  = External Entity (Person or System)
│  Entity  │
└──────────┘

┌──────────┐
│   0.0    │  = Main Process (Entire System)
│  Process │
└──────────┘

──────────►  = Data Flow (Direction of data movement)
```

---

## 6. Data Flows

### 6.1 User to MindMate System

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **Registration Data** | New user account information | email, password, name, university, year, bio | One-time |
| **Login Credentials** | Authentication information | email + password OR Google OAuth token | Per session |
| **Mood Entries** | Daily mood tracking data | mood_level (1-10), journal, triggers[], activities[], sleep_hours | Daily |
| **Chat Messages** | User messages to AI companion | message_text, timestamp | Multiple per session |
| **Forum Posts** | Community discussion posts | title, content, tags[], anonymous_flag | As needed |
| **Match Requests** | Peer connection requests | target_user_id, message | As needed |
| **Profile Updates** | User information changes | name, bio, university, year, privacy_settings | Occasional |
| **Settings Preferences** | User configuration | theme, notifications, privacy, language | Occasional |

### 6.2 MindMate System to User

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **Dashboard** | Personalized overview | recent_moods, notifications, suggestions, insights | Per login |
| **Mood Statistics** | Analytics and insights | average_mood, trends, patterns, AI_insights | On request |
| **AI Responses** | Chat companion replies | response_text, timestamp, crisis_flag | Per message |
| **Forum Content** | Community posts and comments | posts[], reactions, comments[], user_info | Continuous |
| **Match Suggestions** | Peer recommendations | user_list[], match_scores, compatibility_reasons | On request |
| **Notifications** | System alerts | type, content, timestamp, read_status | Real-time |
| **Crisis Alerts** | Emergency resources | hotline_numbers, resources, support_info | When triggered |

### 6.3 MindMate System to Google Gemini AI

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **Chat Messages** | User queries with context | message, conversation_history, system_prompt | Per user message |
| **Insight Requests** | Mood analysis queries | mood_data, patterns, user_context | On demand |

### 6.4 Google Gemini AI to MindMate System

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **AI Responses** | Generated replies | response_text, confidence_score | Per request |
| **Generated Insights** | Mood analysis results | insights, recommendations, patterns | Per request |

### 6.5 MindMate System to Firebase Auth

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **Auth Requests** | Login/registration attempts | email, password OR OAuth_token | Per auth attempt |
| **Token Validation** | Session verification | JWT_token | Per API request |

### 6.6 Firebase Auth to MindMate System

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **Auth Tokens** | Authentication credentials | JWT_token, user_id, expiry | Per successful auth |
| **Validation Results** | Token verification status | valid/invalid, user_id | Per validation |

### 6.7 Admin to MindMate System

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **Admin Commands** | Management actions | action_type, target_id, parameters | As needed |
| **Moderation Actions** | Content review decisions | post_id, action (approve/remove), reason | As needed |
| **Report Requests** | Analytics queries | report_type, date_range, filters | Daily/Weekly |

### 6.8 MindMate System to Admin

| Data Flow Name | Description | Data Components | Frequency |
|----------------|-------------|-----------------|-----------|
| **System Reports** | Platform analytics | user_count, engagement_metrics, performance | Daily/Weekly |
| **User Analytics** | User behavior data | active_users, retention, feature_usage | On request |
| **Crisis Event Logs** | Emergency alerts | crisis_detections[], user_ids, timestamps | Real-time |
| **Content Queue** | Posts for moderation | flagged_posts[], user_reports[] | Continuous |

---

## 7. System Boundary

### 7.1 Inside the System Boundary

**What MindMate System Controls:**
- User authentication and authorization
- Mood entry storage and encryption
- AI chat conversation management
- Community forum operations
- Peer matching algorithm
- Notification generation and delivery
- Admin dashboard and tools
- Data encryption and security
- Business logic and rules
- Database operations

### 7.2 Outside the System Boundary

**What MindMate System Does NOT Control:**
- Firebase authentication infrastructure
- Google Gemini AI model training and responses
- User devices (browsers, mobile apps)
- Internet connectivity
- External email services
- Third-party OAuth providers
- Cloud infrastructure (MongoDB Atlas, hosting)

### 7.3 System Interfaces

#### 7.3.1 User Interface
- **Type:** Web-based (React SPA)
- **Access:** Browser (Chrome, Firefox, Safari, Edge)
- **Responsive:** Mobile, tablet, desktop
- **Authentication:** Required for most features

#### 7.3.2 Admin Interface
- **Type:** Web-based admin panel
- **Access:** Restricted to admin accounts
- **Features:** User management, moderation, analytics
- **Authentication:** Admin-level credentials required

#### 7.3.3 API Interfaces
- **Firebase Auth API:** RESTful authentication
- **Google Gemini API:** AI conversation service
- **MongoDB Atlas:** Database operations
- **Internal REST API:** Frontend-backend communication

### 7.4 Data Flow Characteristics

#### 7.4.1 Synchronous Flows
- User login → Authentication → Dashboard
- Chat message → AI processing → Response
- Forum post creation → Validation → Storage

#### 7.4.2 Asynchronous Flows
- Notification generation → Delivery
- Match calculation → Suggestion delivery
- Analytics generation → Report creation

#### 7.4.3 Real-time Flows
- Crisis detection → Alert display
- New notifications → User notification
- Admin alerts → Admin dashboard

---

## 8. Context Diagram Summary

### 8.1 Key Statistics

| Metric | Count |
|--------|-------|
| **External Entities** | 4 (2 human, 2 systems) |
| **Main Process** | 1 (MindMate System) |
| **Incoming Data Flows** | 11 |
| **Outgoing Data Flows** | 11 |
| **Total Data Flows** | 22 |

### 8.2 Entity Interaction Summary

```
User (Student) ←→ MindMate System (16 data flows)
Admin ←→ MindMate System (8 data flows)
Google Gemini AI ←→ MindMate System (4 data flows)
Firebase Auth ←→ MindMate System (4 data flows)
```

### 8.3 System Scope

**Primary Functions Visible at Level 0:**
1. ✅ User account management
2. ✅ Mood tracking and analytics
3. ✅ AI chat support
4. ✅ Community engagement
5. ✅ Peer matching
6. ✅ Notifications
7. ✅ Administrative oversight

**Internal Details (Hidden at Level 0):**
- Database structure
- Encryption algorithms
- Matching algorithms
- Internal processes
- Data stores
- Detailed workflows

---

## 9. Next Steps

### 9.1 Level 1 DFD
The Level 1 DFD will decompose the single Process 0.0 (MindMate System) into major functional processes:
- Process 1.0: User Management
- Process 2.0: Mood Tracking
- Process 3.0: AI Chat System
- Process 4.0: Community Forum
- Process 5.0: Peer Matching
- Process 6.0: Notification System
- Process 7.0: Admin Management

### 9.2 Level 2 DFD
The Level 2 DFD will further decompose each Level 1 process into detailed sub-processes, showing internal operations and data transformations.

---

**Document Control:**
- **Created by:** MindMate Development Team
- **Approved by:** Project Stakeholders
- **Next Review Date:** December 21, 2025
- **Version History:**
  - v1.0 (Nov 21, 2025): Initial Level 0 DFD - Context Diagram

---

**End of Level 0 DFD - Context Diagram**
