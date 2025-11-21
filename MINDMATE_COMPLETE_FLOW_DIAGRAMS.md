# MindMate - Complete Flow Diagrams
## Visual System Overview

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** MindMate - Full Stack Mental Wellness Platform

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [User Authentication Flow](#2-user-authentication-flow)
3. [Mood Tracking Flow](#3-mood-tracking-flow)
4. [AI Chat Flow with Crisis Detection](#4-ai-chat-flow-with-crisis-detection)
5. [Community Forum Flow](#5-community-forum-flow)
6. [Peer Matching Flow](#6-peer-matching-flow)
7. [Notification System Flow](#7-notification-system-flow)
8. [Admin Management Flow](#8-admin-management-flow)
9. [Complete User Journey](#9-complete-user-journey)
10. [Data Flow Summary](#10-data-flow-summary)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MINDMATE SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

                                 EXTERNAL ENTITIES
┌──────────┐                                                      ┌──────────┐
│   USER   │                                                      │  ADMIN   │
│(Student) │                                                      │          │
└────┬─────┘                                                      └────┬─────┘
     │                                                                 │
     │                    ┌─────────────────────┐                     │
     └───────────────────►│                     │◄────────────────────┘
                          │   REACT FRONTEND    │
                          │   (Port 5173)       │
                          │                     │
                          └──────────┬──────────┘
                                     │
                                     │ HTTP/HTTPS
                                     │
                          ┌──────────▼──────────┐
                          │                     │
                          │   EXPRESS BACKEND   │
                          │   (Port 5000)       │
                          │                     │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
         ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
         │   FIREBASE      │ │   MONGODB   │ │ GOOGLE GEMINI   │
         │   AUTH          │ │   ATLAS     │ │      AI         │
         │                 │ │             │ │                 │
         │ - Email/Pass    │ │ - Users     │ │ - Chat AI       │
         │ - Google OAuth  │ │ - Moods     │ │ - Insights      │
         │ - JWT Tokens    │ │ - Posts     │ │                 │
         └─────────────────┘ │ - Matches   │ └─────────────────┘
                             │ - Chats     │
                             │ - Notifs    │
                             └─────────────┘

                          TECHNOLOGY STACK
┌─────────────────────────────────────────────────────────────────────────────┐
│ Frontend: React 18, TailwindCSS, Framer Motion, Lucide Icons               │
│ Backend: Node.js, Express.js, JWT, AES-256-GCM Encryption                  │
│ Database: MongoDB Atlas (Cloud)                                             │
│ Auth: Firebase Authentication                                               │
│ AI: Google Gemini 1.5 Flash                                                │
│ Deployment: Vercel (Frontend), Railway (Backend)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Authentication Flow

```
REGISTRATION FLOW
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Enter: email, password, name, university, year
     ▼
┌─────────────────┐
│ Validate Input  │
└────┬────────────┘
     │
     │ 2. Check email format, password strength
     ▼
┌──────────────────┐
│ Firebase Auth    │ ──► Create Account
└────┬─────────────┘
     │
     │ 3. Return Firebase UID
     ▼
┌──────────────────┐
│ MongoDB: Users   │ ──► Save User Profile
└────┬─────────────┘
     │
     │ 4. Generate JWT Token
     ▼
┌──────────────────┐
│ Return to User   │ ──► JWT + Profile Data
└──────────────────┘


LOGIN FLOW (Email/Password)
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Enter: email, password
     ▼
┌──────────────────┐
│ Firebase Auth    │ ──► Verify Credentials
└────┬─────────────┘
     │
     │ 2. Return Firebase Token
     ▼
┌──────────────────┐
│ MongoDB: Users   │ ──► Fetch User Data
└────┬─────────────┘
     │
     │ 3. Generate JWT Token (24h expiry)
     ▼
┌──────────────────┐
│ Return to User   │ ──► JWT + Profile + Dashboard
└──────────────────┘


LOGIN FLOW (Google OAuth)
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Click "Sign in with Google"
     ▼
┌──────────────────┐
│ Google OAuth     │ ──► Authenticate
└────┬─────────────┘
     │
     │ 2. Return Google Token
     ▼
┌──────────────────┐
│ Firebase Auth    │ ──► Verify Google Token
└────┬─────────────┘
     │
     │ 3. Return Firebase UID
     ▼
┌──────────────────┐
│ MongoDB: Users   │ ──► Create/Fetch User
└────┬─────────────┘
     │
     │ 4. Generate JWT Token
     ▼
┌──────────────────┐
│ Return to User   │ ──► JWT + Profile + Dashboard
└──────────────────┘


PROFILE UPDATE FLOW
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Update: name, bio, university, year, settings
     ▼
┌─────────────────┐
│ Validate Input  │
└────┬────────────┘
     │
     │ 2. Verify JWT Token
     ▼
┌──────────────────┐
│ MongoDB: Users   │ ──► Update Document
└────┬─────────────┘
     │
     │ 3. Return Updated Profile
     ▼
┌──────────────────┐
│ Return to User   │ ──► Success + New Profile Data
└──────────────────┘
```

---

## 3. Mood Tracking Flow

```
CREATE MOOD ENTRY
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Select mood level (1-10)
     │ 2. Write journal entry
     │ 3. Select triggers, activities, sleep hours
     ▼
┌─────────────────┐
│ Validate Input  │
└────┬────────────┘
     │
     │ 4. Check mood level, journal length
     ▼
┌──────────────────┐
│ Encrypt Journal  │ ──► AES-256-GCM
└────┬─────────────┘     (Generate IV, Encrypt, Auth Tag)
     │
     │ 5. Encrypted journal object
     ▼
┌──────────────────┐
│ MongoDB: Moods   │ ──► Save Entry
└────┬─────────────┘
     │
     │ 6. Success confirmation
     ▼
┌──────────────────┐
│ Return to User   │ ──► Entry Saved
└──────────────────┘


VIEW MOOD HISTORY & STATISTICS
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Request mood history
     ▼
┌──────────────────┐
│ MongoDB: Moods   │ ──► Fetch Entries (by user ID)
└────┬─────────────┘
     │
     │ 2. Encrypted mood entries
     ▼
┌──────────────────┐
│ Decrypt Journal  │ ──► AES-256-GCM Decrypt
└────┬─────────────┘
     │
     │ 3. Decrypted entries
     ▼
┌──────────────────┐
│ Calculate Stats  │ ──► Average, Trends, Patterns
└────┬─────────────┘
     │
     │ 4. Statistics computed
     ▼
┌──────────────────┐
│ Generate AI      │ ──► Send to Google Gemini AI
│ Insights         │     (If 5+ entries)
└────┬─────────────┘
     │
     │ 5. AI-generated insights
     ▼
┌──────────────────┐
│ Return to User   │ ──► History + Stats + Insights
└──────────────────┘
```

---

## 4. AI Chat Flow with Crisis Detection

```
CHAT WITH AI COMPANION
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Type message
     ▼
┌─────────────────┐
│ Receive Message │
└────┬────────────┘
     │
     │ 2. Validate message (1-2000 chars)
     ▼
┌──────────────────┐
│ Detect Crisis    │ ──► Scan for keywords:
│ Keywords         │     (suicide, self-harm, overdose, etc.)
└────┬─────────────┘
     │
     ├─────────────────────┐
     │                     │
     ▼                     ▼ (If crisis detected)
┌──────────────────┐  ┌──────────────────┐
│ Format Context   │  │ Set Crisis Flag  │
└────┬─────────────┘  └────┬─────────────┘
     │                     │
     │ 3. Add conversation history (last 10 messages)
     ▼
┌──────────────────┐
│ Google Gemini AI │ ──► Send formatted message
└────┬─────────────┘
     │
     │ 4. AI response received
     ▼
┌──────────────────┐
│ MongoDB: Chats   │ ──► Store conversation
└────┬─────────────┘
     │
     ├─────────────────────┐
     │                     │
     ▼                     ▼ (If crisis detected)
┌──────────────────┐  ┌──────────────────┐
│ Return AI        │  │ Display Crisis   │
│ Response         │  │ Alert + Hotlines │
└────┬─────────────┘  └────┬─────────────┘
     │                     │
     └──────────┬──────────┘
                ▼
         ┌──────────────┐
         │ Return to    │
         │ User         │
         └──────────────┘
```

---

## 5. Community Forum Flow

```
CREATE FORUM POST
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Enter: title, content, tags, anonymous flag
     ▼
┌─────────────────┐
│ Validate Post   │
└────┬────────────┘
     │
     │ 2. Check title (5-200 chars), content (10-5000 chars)
     ▼
┌──────────────────┐
│ Check Anonymous  │ ──► If true: Hide user identity
│ Flag             │     If false: Show user name
└────┬─────────────┘
     │
     │ 3. Prepare post data
     ▼
┌──────────────────┐
│ MongoDB: Posts   │ ──► Save Post
└────┬─────────────┘
     │
     │ 4. Post created
     ▼
┌──────────────────┐
│ Return to User   │ ──► Success + Post ID
└──────────────────┘


VIEW & INTERACT WITH POSTS
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Request posts (with filters/tags)
     ▼
┌──────────────────┐
│ MongoDB: Posts   │ ──► Fetch Posts
└────┬─────────────┘
     │
     │ 2. Apply filters, sort by date/popular
     ▼
┌──────────────────┐
│ Return Posts     │ ──► Display in feed
└────┬─────────────┘
     │
     ▼
┌──────────┐
│   User   │ ──► Choose action:
└────┬─────┘     - Add Reaction (supportive/helpful/relatable)
     │           - Add Comment
     │           - View Details
     │
     ├──────────────────┐
     │                  │
     ▼                  ▼
┌──────────────┐  ┌──────────────┐
│ Add Reaction │  │ Add Comment  │
└────┬─────────┘  └────┬─────────┘
     │                  │
     │                  │ Validate comment
     ▼                  ▼
┌──────────────────────────┐
│ MongoDB: Posts (Update)  │
└────┬─────────────────────┘
     │
     │ Trigger notification to post author
     ▼
┌──────────────────┐
│ Notification     │
│ System           │
└──────────────────┘
```

---

## 6. Peer Matching Flow

```
FIND PEER MATCHES
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Request peer matches
     ▼
┌──────────────────┐
│ MongoDB: Users   │ ──► Fetch user profile
└────┬─────────────┘
     │
     │ 2. Get user data (university, year, interests)
     ▼
┌──────────────────┐
│ MongoDB: Moods   │ ──► Fetch mood patterns
└────┬─────────────┘
     │
     │ 3. Get mood history for analysis
     ▼
┌──────────────────┐
│ Calculate Match  │ ──► Matching Algorithm:
│ Scores           │     - University: 30%
└────┬─────────────┘     - Year: 20%
     │                   - Mood similarity: 30%
     │                   - Activities: 20%
     │
     │ 4. Match scores (0-100)
     ▼
┌──────────────────┐
│ Rank Matches     │ ──► Sort by score (descending)
└────┬─────────────┘
     │
     │ 5. Top matches
     ▼
┌──────────────────┐
│ Return to User   │ ──► Display match suggestions
└──────────────────┘


SEND MATCH REQUEST
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Click "Connect" on match
     ▼
┌──────────────────┐
│ Create Match     │
│ Request          │
└────┬─────────────┘
     │
     │ 2. Save request (status: pending)
     ▼
┌──────────────────┐
│ MongoDB: Matches │ ──► Save Request
└────┬─────────────┘
     │
     │ 3. Trigger notification
     ▼
┌──────────────────┐
│ Notification     │ ──► Notify target user
│ System           │
└────┬─────────────┘
     │
     │ 4. Notification sent
     ▼
┌──────────────────┐
│ Return to User   │ ──► Request sent confirmation
└──────────────────┘


RESPOND TO MATCH REQUEST
┌──────────┐
│   User   │ (Target)
└────┬─────┘
     │
     │ 1. View match request notification
     ▼
┌──────────────────┐
│ Choose Action    │ ──► Accept or Reject
└────┬─────────────┘
     │
     ├──────────────────┐
     │                  │
     ▼                  ▼
┌──────────┐      ┌──────────┐
│ Accept   │      │ Reject   │
└────┬─────┘      └────┬─────┘
     │                  │
     │                  │
     └────────┬─────────┘
              ▼
┌──────────────────────┐
│ MongoDB: Matches     │ ──► Update status
└────┬─────────────────┘
     │
     │ Trigger notification to requester
     ▼
┌──────────────────┐
│ Notification     │ ──► Notify requester
│ System           │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Return to User   │ ──► Match status updated
└──────────────────┘
```

---

## 7. Notification System Flow

```
CREATE NOTIFICATION (Triggered by other processes)

    (Event from: Match Request, Comment, Reaction, System)
                        │
                        ▼
              ┌──────────────────┐
              │ Create           │
              │ Notification     │
              └────┬─────────────┘
                   │
                   │ 1. Receive event data
                   ▼
              ┌──────────────────┐
              │ Format           │ ──► Based on type:
              │ Notification     │     - match, comment, reaction, system, crisis
              └────┬─────────────┘
                   │
                   │ 2. Formatted notification
                   ▼
              ┌──────────────────┐
              │ MongoDB: Notifs  │ ──► Save Notification (read: false)
              └────┬─────────────┘
                   │
                   │ 3. Notification stored
                   ▼
              ┌──────────────────┐
              │ Real-time        │ ──► Deliver to user
              │ Delivery         │
              └──────────────────┘


VIEW NOTIFICATIONS
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Request notifications
     ▼
┌──────────────────┐
│ MongoDB: Notifs  │ ──► Fetch by user ID, Sort by timestamp
└────┬─────────────┘
     │
     │ 2. Notifications list
     ▼
┌──────────────────┐
│ Return to User   │ ──► Display notifications (with unread count)
└──────────────────┘


MARK AS READ / DELETE
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Click notification action
     ▼
┌──────────────────┐
│ Choose Action    │ ──► Mark as Read or Delete
└────┬─────────────┘
     │
     ├──────────────────┐
     │                  │
     ▼                  ▼
┌────────────┐  ┌────────────┐
│ Mark Read  │  │ Delete     │
└────┬───────┘  └────┬───────┘
     │                  │
     └────────┬─────────┘
              ▼
┌──────────────────────┐
│ MongoDB: Notifs      │ ──► Update or Delete
└────┬─────────────────┘
     │
     ▼
┌──────────────────┐
│ Return to User   │ ──► Updated notification list
└──────────────────┘
```

---

## 8. Admin Management Flow

```
ADMIN LOGIN
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ 1. Login with admin credentials
     ▼
┌──────────────────┐
│ Firebase Auth    │ ──► Verify admin role
└────┬─────────────┘
     │
     │ 2. Admin authenticated
     ▼
┌──────────────────┐
│ Admin Dashboard  │ ──► Access granted
└──────────────────┘


USER MANAGEMENT
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ 1. View all users
     ▼
┌──────────────────┐
│ MongoDB: Users   │ ──► Fetch all users
└────┬─────────────┘
     │
     │ 2. User list displayed
     ▼
┌──────────┐
│  Admin   │ ──► Choose action: View Details, Suspend, Delete
└────┬─────┘
     │
     ├──────────────────────────┐
     │                          │
     ▼                          ▼
┌────────────┐          ┌──────────────┐
│ Suspend    │          │ Delete User  │
│ User       │          │              │
└────┬───────┘          └────┬─────────┘
     │                       │
     │                       │ Cascade delete from:
     │                       │ - Users, Moods, Chats,
     │                       │   Posts, Matches
     │                       │
     └───────────┬───────────┘
                 ▼
┌──────────────────────────────┐
│ MongoDB: All Collections     │ ──► Update/Delete
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────┐
│ Return to Admin  │ ──► Action completed
└──────────────────┘


CONTENT MODERATION
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ 1. View forum posts for moderation
     ▼
┌──────────────────┐
│ MongoDB: Posts   │ ──► Fetch posts (flagged/all)
└────┬─────────────┘
     │
     │ 2. Posts displayed
     ▼
┌──────────┐
│  Admin   │ ──► Review post: Approve or Remove
└────┬─────┘
     │
     ├──────────────────┐
     │                  │
     ▼                  ▼
┌────────────┐  ┌──────────────┐
│ Approve    │  │ Remove Post  │
└────────────┘  └────┬─────────┘
                     │
                     ▼
              ┌──────────────────┐
              │ MongoDB: Posts   │ ──► Delete Post
              └────┬─────────────┘
                   │
                   ▼
              ┌──────────────────┐
              │ Log Action       │ ──► Moderation log
              └──────────────────┘


SYSTEM ANALYTICS
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ 1. Request analytics
     ▼
┌──────────────────────────────────────┐
│ Query All Collections:               │
│ - Users (count, active)              │
│ - Moods (entries, avg)               │
│ - Chats (conversations, crisis)      │
│ - Posts (count, engagement)          │
│ - Matches (requests, accepted)       │
└────┬─────────────────────────────────┘
     │
     │ 2. Calculate metrics
     ▼
┌──────────────────┐
│ Generate Report  │ ──► User count, Engagement, Crisis events
└────┬─────────────┘
     │
     │ 3. Analytics report
     ▼
┌──────────────────┐
│ Return to Admin  │ ──► Display dashboard
└──────────────────┘


CRISIS MONITORING
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ 1. Monitor crisis events
     ▼
┌──────────────────┐
│ MongoDB: Chats   │ ──► Fetch where crisisDetected = true
└────┬─────────────┘
     │
     │ 2. Crisis events list
     ▼
┌──────────────────┐
│ Return to Admin  │ ──► Display crisis log (user ID, timestamp, keywords)
└──────────────────┘
```

---

## 9. Complete User Journey

```
COMPLETE USER FLOW (From Registration to Full Platform Use)

START
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                                  │
│    User → Register → Firebase Auth → MongoDB → JWT Token        │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PROFILE SETUP                                                 │
│    Complete Profile → University, Year, Bio → Save              │
└────┬────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. DASHBOARD                                                     │
│    View Dashboard → Recent Activity, Quick Actions              │
└────┬────────────────────────────────────────────────────────────┘
     │
     ├─────────────────┬─────────────────┬─────────────────┬──────┐
     │                 │                 │                 │      │
     ▼                 ▼                 ▼                 ▼      ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  ┌──────────┐
│   MOOD   │    │   AI     │    │  FORUM   │    │   PEER   │  │  CRISIS  │
│ TRACKING │    │   CHAT   │    │          │    │ MATCHING │  │ SUPPORT  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘  └────┬─────┘
     │               │               │               │             │
     ▼               ▼               ▼               ▼             ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  ┌──────────┐
│ Log Mood │    │ Chat AI  │    │ View     │    │ Find     │  │ Access   │
│ Entry    │    │ Companion│    │ Posts    │    │ Matches  │  │ Hotlines │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘  └────┬─────┘
     │               │               │               │             │
     ▼               ▼               ▼               ▼             ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  ┌──────────┐
│ View     │    │ Crisis   │    │ Create   │    │ Send     │  │ Chat     │
│ Stats    │    │ Detection│    │ Post     │    │ Request  │  │ Support  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘  └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ AI       │    │ Alert    │    │ React &  │    │ Connect  │
│ Insights │    │ Display  │    │ Comment  │    │ with Peer│
└────┬─────┘    └──────────┘    └────┬─────┘    └────┬─────┘
     │                               │               │
     └───────────────┬───────────────┴───────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ NOTIFICATIONS    │
            │ (Real-time)      │
            └────┬─────────────┘
                 │
                 ▼
            ┌──────────────────┐
            │ CONTINUOUS USE   │
            │ & ENGAGEMENT     │
            └──────────────────┘
```

---

## 10. Data Flow Summary

```
COMPLETE DATA FLOW ARCHITECTURE

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL ENTITIES                                  │
├─────────────┬─────────────┬──────────────────┬──────────────────────────────┤
│    USER     │    ADMIN    │ GOOGLE GEMINI AI │    FIREBASE AUTH             │
└──────┬──────┴──────┬──────┴────────┬─────────┴────────┬───────────────────┘
       │             │               │                  │
       │             │               │                  │
       ▼             ▼               ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REACT FRONTEND (Port 5173)                          │
│  Components: Auth, Dashboard, Mood, Chat, Forum, Matches, Notifications     │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ HTTP/HTTPS (REST API)
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                        EXPRESS BACKEND (Port 5000)                           │
│  Routes: /auth, /mood, /chat, /forum, /matches, /notifications, /admin      │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
         ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
         │   FIREBASE      │ │   MONGODB   │ │ GOOGLE GEMINI   │
         │   AUTH          │ │   ATLAS     │ │      AI         │
         └─────────────────┘ └──────┬──────┘ └─────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
         │ D1: Users   │ │ D2: Moods   │ │ D3: Chats   │
         └─────────────┘ └─────────────┘ └─────────────┘
                    │               │               │
                    ▼               ▼               ▼
         ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
         │ D4: Posts   │ │ D5: Matches │ │ D6: Notifs  │
         └─────────────┘ └─────────────┘ └─────────────┘


DATA FLOW PATTERNS

1. AUTHENTICATION FLOW
   User → Frontend → Backend → Firebase Auth → Backend → MongoDB → Frontend

2. MOOD TRACKING FLOW
   User → Frontend → Backend → Encrypt (AES-256) → MongoDB → Backend → Frontend

3. AI CHAT FLOW
   User → Frontend → Backend → Gemini AI → Backend → MongoDB → Frontend
                              └─► Crisis Detection → Alert

4. FORUM FLOW
   User → Frontend → Backend → MongoDB → Backend → Notification System → Frontend

5. PEER MATCHING FLOW
   User → Frontend → Backend → MongoDB (Users + Moods) → Algorithm → MongoDB (Matches) → Frontend

6. NOTIFICATION FLOW
   Event → Backend → MongoDB → Real-time Delivery → Frontend

7. ADMIN FLOW
   Admin → Frontend → Backend → MongoDB (All Collections) → Backend → Frontend


SECURITY LAYERS

┌─────────────────────────────────────────────────────────────────────────────┐
│ Layer 1: Firebase Authentication (Email/Password, Google OAuth)             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Layer 2: JWT Token Verification (24h expiry)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Layer 3: AES-256-GCM Encryption (Mood journals)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Layer 4: MongoDB Access Control (Role-based)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Layer 5: HTTPS/TLS (Transport encryption)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**End of Document**

---

**MindMate Complete Flow Diagrams**  
**Version 1.0 | November 21, 2025**  
**All diagrams showing internal & external system flows**
