# Level 2 DFD - Detailed Processes
## MindMate Platform

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** MindMate - Full Stack Mental Wellness Platform

---

## Table of Contents

1. [Introduction](#introduction)
2. [Process 1.0: User Management](#process-10-user-management)
3. [Process 2.0: Mood Tracking](#process-20-mood-tracking)
4. [Process 3.0: AI Chat System](#process-30-ai-chat-system)
5. [Process 4.0: Community Forum](#process-40-community-forum)
6. [Process 5.0: Peer Matching](#process-50-peer-matching)
7. [Process 6.0: Notification System](#process-60-notification-system)
8. [Process 7.0: Admin Management](#process-70-admin-management)
9. [Sub-Process Summary](#sub-process-summary)

---

## 1. Introduction

### 1.1 Purpose
This document presents the Level 2 Data Flow Diagrams for the MindMate platform, decomposing each of the 7 major processes from Level 1 into 43 detailed sub-processes.

### 1.2 Scope
- 43 total sub-processes across 7 major processes
- Detailed data flows within each process
- Internal operations and transformations
- Interactions with data stores at a granular level

### 1.3 Numbering Convention
Sub-processes: 1.1, 1.2, 1.3 (for Process 1.0), 2.1, 2.2, 2.3 (for Process 2.0), etc.

---

## 2. Process 1.0: User Management

### 2.1 Level 2 Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Registration Data
     ├──────────────────► 1.1 Register New User
     │                     │
     │                     └──────► 1.2 Authenticate User
     │                               │
     │                               ├──────► Firebase Auth
     │                               │
     │                               └──────► 1.3 Generate JWT Token
     │                                         │
     │                                         └──────► D1: Users
     │
     │ Login Credentials
     ├──────────────────► 1.2 Authenticate User
     │                     │
     │                     └──────► 1.3 Generate JWT Token
     │                               │
     │◄──────────────────────────────┘ JWT Token
     │
     │ Profile Update
     ├──────────────────► 1.4 Validate Input
     │                     │
     │                     └──────► 1.5 Update Profile
     │                               │
     │                               └──────► D1: Users (Update)
     │◄──────────────────────────────────────┘ Updated Profile
```

### 2.2 Sub-Processes

**1.1 Register New User**
- Validate email format, password strength, university
- Check for duplicate email
- Prepare data for Firebase authentication

**1.2 Authenticate User**
- Verify credentials via Firebase Auth
- Create/verify user document in D1: Users
- Return Firebase UID and token

**1.3 Generate JWT Token**
- Read user data from D1: Users
- Create JWT payload with user info
- Sign token with secret key (24-hour expiration)
- Return token and profile data

**1.4 Validate Input**
- Validate name (2-50 characters)
- Validate bio (max 500 characters)
- Verify university from allowed list
- Validate settings format

**1.5 Update Profile**
- Update user document in D1: Users
- Update fields: name, bio, university, year, settings
- Return updated profile

---

## 3. Process 2.0: Mood Tracking

### 3.1 Level 2 Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Mood Entry
     ├──────────────────► 2.1 Validate Mood Entry
     │                     │
     │                     └──────► 2.2 Encrypt Journal (AES-256-GCM)
     │                               │
     │                               └──────► 2.3 Store Mood Entry
     │                                         │
     │                                         └──────► D2: Mood Entries
     │
     │ View Request
     ├──────────────────► 2.4 Retrieve Mood History
     │                     │
     │                     │◄──────── D2: Mood Entries
     │                     │
     │                     └──────► 2.5 Decrypt Journal
     │                               │
     │                               └──────► 2.6 Calculate Statistics
     │                                         │
     │                                         └──────► 2.7 Generate AI Insights
     │                                                   │
     │                                                   ├──────► Google Gemini AI
     │◄──────────────────────────────────────────────────┘ Statistics + Insights
```

### 3.2 Sub-Processes

**2.1 Validate Mood Entry**
- Validate mood level (1-10)
- Check journal length (max 5000 characters)
- Validate triggers and activities arrays
- Validate sleep hours (0-24)

**2.2 Encrypt Journal**
- Generate random 16-byte IV
- Encrypt journal text using AES-256-GCM
- Extract authentication tag
- Format encrypted object

**2.3 Store Mood Entry**
- Create mood entry document
- Include encrypted journal, triggers, activities, sleep
- Save to D2: Mood Entries

**2.4 Retrieve Mood History**
- Query D2: Mood Entries by user ID
- Apply date range filter
- Sort by timestamp (descending)
- Apply pagination

**2.5 Decrypt Journal**
- Extract IV, encrypted data, auth tag
- Decrypt journal text using AES-256-GCM
- Verify authentication tag
- Return decrypted entries

**2.6 Calculate Statistics**
- Calculate average mood, trends, distribution
- Correlate mood with triggers and activities
- Analyze sleep patterns
- Identify best/worst days

**2.7 Generate AI Insights**
- Check minimum 5 entries
- Format mood data for AI prompt
- Send to Google Gemini AI
- Return personalized insights

---

## 4. Process 3.0: AI Chat System

### 4.1 Level 2 Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Chat Message
     ├──────────────────► 3.1 Receive Message
     │                     │
     │                     └──────► 3.2 Detect Crisis Keywords
     │                               │
     │                               └──────► 3.3 Format Context
     │                                         │
     │                                         ├──────► Google Gemini AI
     │                                         │
     │                                         └──────► 3.4 Store Conversation
     │                                                   │
     │                                                   └──────► D3: Conversations
     │◄──────────────────────────────────────────────────┘ AI Response
     │
     │ (If crisis detected)
     │◄──────────────────────────────────────────────────── Crisis Alert
```

### 4.2 Sub-Processes

**3.1 Receive Message**
- Validate message (1-2000 characters)
- Check rate limit (max 20/minute)
- Retrieve conversation context

**3.2 Detect Crisis Keywords**
- Scan for keywords: suicide, self-harm, overdose, etc.
- Set crisis flag if detected
- Log crisis event for admin

**3.3 Format Context**
- Retrieve last 10 messages
- Format for Gemini API
- Add system prompt
- Send to Google Gemini AI

**3.4 Store Conversation**
- Append user message and AI response
- Update crisis flag if detected
- Save to D3: Conversations

**Crisis Alert (Conditional)**
- Display emergency hotlines
- Show crisis resources
- Log event for admin monitoring

---

## 5. Process 4.0: Community Forum

### 5.1 Level 2 Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Forum Post
     ├──────────────────► 4.1 Validate Post
     │                     │
     │                     └──────► 4.2 Check Anonymous Flag
     │                               │
     │                               └──────► 4.3 Create Post
     │                                         │
     │                                         └──────► D4: Forum Posts
     │
     │ View Request
     ├──────────────────► 4.4 Retrieve Posts
     │                     │
     │                     └──────► 4.5 Filter by Tags
     │◄────────────────────────────┘ Filtered Posts
     │
     │ Reaction
     ├──────────────────► 4.6 Add Reaction
     │                     │
     │                     └──────► D4: Forum Posts (Update)
     │
     │ Comment
     ├──────────────────► 4.7 Validate Comment
     │                     │
     │                     └──────► 4.8 Add Comment
     │                               │
     │                               └──────► D4: Forum Posts (Update)
```

### 5.2 Sub-Processes

**4.1 Validate Post**
- Validate title (5-200 characters)
- Validate content (10-5000 characters)
- Validate tags (1-5 from allowed list)

**4.2 Check Anonymous Flag**
- If anonymous: Hide user identity
- If not: Include user name and profile
- Store actual user ID for moderation

**4.3 Create Post**
- Create post document
- Initialize reactions to 0
- Save to D4: Forum Posts

**4.4 Retrieve Posts**
- Query D4: Forum Posts
- Apply filters and sorting
- Apply pagination

**4.5 Filter by Tags**
- Apply tag filters
- Sort by recent/popular/trending
- Return filtered posts

**4.6 Add Reaction**
- Validate reaction type (supportive/helpful/relatable)
- Increment reaction count
- Update D4: Forum Posts

**4.7 Validate Comment**
- Validate comment (1-1000 characters)
- Check anonymous flag

**4.8 Add Comment**
- Add comment to post's comments array
- Update D4: Forum Posts
- Trigger notification

---

## 6. Process 5.0: Peer Matching

### 6.1 Level 2 Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Find Matches
     ├──────────────────► 5.1 Retrieve User Profile
     │                     │
     │                     │◄──────── D1: Users
     │                     │
     │                     └──────► 5.2 Calculate Match Scores
     │                               │
     │                               │◄──────── D2: Mood Entries
     │                               │
     │                               └──────► 5.3 Rank Matches
     │◄────────────────────────────────────────┘ Match Suggestions
     │
     │ Match Request
     ├──────────────────► 5.4 Create Match Request
     │                     │
     │                     ├──────► D5: Matches
     │                     │
     │                     └──────► 6.0 Notification System
     │
     │ Match Response
     ├──────────────────► 5.5 Update Match Status
     │                     │
     │                     └──────► D5: Matches (Update)
     │
     │ View My Matches
     ├──────────────────► 5.6 Retrieve Accepted Matches
     │                     │
     │                     │◄──────── D5: Matches
     │◄────────────────────┘ Connected Peers
```

### 6.2 Sub-Processes

**5.1 Retrieve User Profile**
- Get user data from D1: Users
- Get mood patterns from D2: Mood Entries

**5.2 Calculate Match Scores**
- University match: 30%
- Year/level match: 20%
- Mood pattern similarity: 30%
- Activity overlap: 20%
- Calculate compatibility score (0-100)

**5.3 Rank Matches**
- Sort matches by score (descending)
- Filter out existing connections
- Return top matches

**5.4 Create Match Request**
- Create match request document
- Save to D5: Matches
- Trigger notification to target user

**5.5 Update Match Status**
- Update match status (accepted/rejected)
- Update D5: Matches
- Trigger notification to requester

**5.6 Retrieve Accepted Matches**
- Query D5: Matches for accepted connections
- Return connected peers

---

## 7. Process 6.0: Notification System

### 7.1 Level 2 Diagram

```
    (Triggered by other processes)
              │
              └──────────────────► 6.1 Create Notification
                                    │
                                    └──────► 6.2 Format Notification
                                              │
                                              └──────► 6.3 Store Notification
                                                        │
                                                        └──────► D6: Notifications

┌──────────┐
│   User   │
└────┬─────┘
     │ View Request
     ├──────────────────► 6.4 Retrieve Notifications
     │                     │
     │                     │◄──────── D6: Notifications
     │◄────────────────────┘ Notifications
     │
     │ Mark as Read
     ├──────────────────► 6.5 Update Read Status
     │                     │
     │                     └──────► D6: Notifications (Update)
     │
     │ Delete
     ├──────────────────► 6.6 Delete Notification
     │                     │
     │                     └──────► D6: Notifications (Delete)
```

### 7.2 Sub-Processes

**6.1 Create Notification**
- Receive event from other processes
- Generate notification from event data

**6.2 Format Notification**
- Format based on type (match, comment, reaction, system, crisis)
- Create notification content

**6.3 Store Notification**
- Save notification to D6: Notifications
- Set read status to false

**6.4 Retrieve Notifications**
- Query D6: Notifications by user ID
- Sort by timestamp (descending)
- Return notifications

**6.5 Update Read Status**
- Update read flag to true
- Update D6: Notifications

**6.6 Delete Notification**
- Remove notification from D6: Notifications

---

## 8. Process 7.0: Admin Management

### 8.1 Level 2 Diagram

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │ View Users
     ├──────────────────► 7.1 Retrieve All Users
     │                     │
     │                     │◄──────── D1: Users
     │◄────────────────────┘ User List
     │
     │ Suspend User
     ├──────────────────► 7.2 Update User Status
     │                     │
     │                     └──────► D1: Users (Update)
     │
     │ Delete User
     ├──────────────────► 7.3 Delete User Account
     │                     │
     │                     ├──────► D1: Users (Delete)
     │                     ├──────► D2: Mood Entries (Delete)
     │                     ├──────► D3: Conversations (Delete)
     │                     ├──────► D4: Forum Posts (Delete)
     │                     └──────► D5: Matches (Delete)
     │
     │ Moderate Content
     ├──────────────────► 7.4 Review Forum Posts
     │                     │
     │                     │◄──────── D4: Forum Posts
     │◄────────────────────┘ Posts for Review
     │
     │ Remove Post
     ├──────────────────► 7.5 Delete Inappropriate Post
     │                     │
     │                     └──────► D4: Forum Posts (Delete)
     │
     │ View Analytics
     ├──────────────────► 7.6 Generate System Analytics
     │                     │
     │                     ├◄──────── D1, D2, D3, D4, D5, D6
     │◄────────────────────┘ Analytics Report
     │
     │ Monitor Crises
     ├──────────────────► 7.7 Retrieve Crisis Detections
     │                     │
     │                     │◄──────── D3: Conversations
     │◄────────────────────┘ Crisis Event Log
```

### 8.2 Sub-Processes

**7.1 Retrieve All Users**
- Query D1: Users
- Apply filters (active, suspended, all)
- Return user list

**7.2 Update User Status**
- Update user status (suspend/activate)
- Update D1: Users

**7.3 Delete User Account**
- Delete from D1: Users
- Cascade delete from D2, D3, D4, D5 (all user data)

**7.4 Review Forum Posts**
- Query D4: Forum Posts
- Filter flagged or reported posts
- Return posts for moderation

**7.5 Delete Inappropriate Post**
- Remove post from D4: Forum Posts
- Log moderation action

**7.6 Generate System Analytics**
- Calculate user count, engagement metrics
- Analyze feature usage
- Calculate crisis detection count
- Return analytics report

**7.7 Retrieve Crisis Detections**
- Query D3: Conversations where crisisDetected = true
- Return crisis event log

---

## 9. Sub-Process Summary

### 9.1 Complete Sub-Process List

| Process | Sub-Processes | Total |
|---------|---------------|-------|
| **1.0 User Management** | 1.1, 1.2, 1.3, 1.4, 1.5 | 5 |
| **2.0 Mood Tracking** | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 | 7 |
| **3.0 AI Chat System** | 3.1, 3.2, 3.3, 3.4, Crisis Alert | 5 |
| **4.0 Community Forum** | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8 | 8 |
| **5.0 Peer Matching** | 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 | 6 |
| **6.0 Notification System** | 6.1, 6.2, 6.3, 6.4, 6.5, 6.6 | 6 |
| **7.0 Admin Management** | 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7 | 7 |
| **TOTAL** | | **44** |

### 9.2 Key Operations by Category

**Data Validation:** 1.1, 1.4, 2.1, 4.1, 4.7  
**Authentication:** 1.2, 1.3  
**Encryption/Decryption:** 2.2, 2.5  
**AI Integration:** 2.7, 3.3  
**Crisis Detection:** 3.2, Crisis Alert  
**Content Management:** 4.3, 4.6, 4.8, 7.5  
**Matching Algorithm:** 5.2, 5.3  
**Notification Handling:** 6.1, 6.2, 6.3  
**Admin Operations:** 7.1, 7.2, 7.3, 7.6, 7.7

### 9.3 External System Integrations

**Firebase Auth:** 1.2 (Authenticate User)  
**Google Gemini AI:** 2.7 (Generate Insights), 3.3 (Format Context)  
**MongoDB:** All data store operations

---

**Document Control:**
- **Created by:** MindMate Development Team
- **Approved by:** Project Stakeholders
- **Next Review Date:** December 21, 2025
- **Version History:**
  - v1.0 (Nov 21, 2025): Initial Level 2 DFD - Detailed Processes

---

**End of Level 2 DFD - Detailed Processes**
