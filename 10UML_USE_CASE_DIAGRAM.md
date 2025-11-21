# UML Use Case Diagram - MindMate Platform

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** MindMate - Full Stack Mental Wellness Platform

---

## Table of Contents

1. [Actors](#actors)
2. [Use Cases Summary](#use-cases-summary)
3. [Use Case Diagram](#use-case-diagram)
4. [Relationships](#relationships)
5. [Key Use Case Descriptions](#key-use-case-descriptions)

---

## 1. Actors

### Primary Actors

#### **User (Student)**
- University student seeking mental wellness support
- Main goals: Track mood, get AI support, connect with peers, participate in community

#### **Admin (System Administrator)**
- Platform administrator ensuring user safety
- Main goals: Manage users, moderate content, monitor system, handle crises

### Secondary Actors (External Systems)
- **Google Gemini AI** - Provides chat responses
- **Firebase Authentication** - Handles authentication
- **MongoDB Database** - Stores application data

---

## 2. Use Cases Summary

### 2.1 User Use Cases (25 Total)

| Category | Use Cases |
|----------|-----------|
| **Authentication & Profile** | UC-01: Register Account, UC-02: Login, UC-03: Logout, UC-04: Manage Profile |
| **Mood Tracking** | UC-05: Log Mood Entry, UC-06: View Mood History, UC-07: View Mood Statistics |
| **AI Chat** | UC-08: Chat with AI, UC-09: View Chat History, UC-10: Clear Chat History |
| **Community Forum** | UC-11: Create Forum Post, UC-12: View Forum Posts, UC-13: React to Post, UC-14: Comment on Post, UC-15: Filter Posts by Tags |
| **Peer Matching** | UC-16: Find Peer Matches, UC-17: Send Match Request, UC-18: Respond to Match Request, UC-19: View My Matches |
| **Notifications** | UC-20: View Notifications, UC-21: Mark as Read, UC-22: Delete Notification |
| **Settings & Dashboard** | UC-23: Update Settings, UC-24: View Dashboard, UC-25: Access Crisis Resources |

### 2.2 Admin Use Cases (11 Total)

| Category | Use Cases |
|----------|-----------|
| **Admin Access** | UC-26: Login as Admin |
| **User Management** | UC-27: View All Users, UC-28: Suspend User, UC-29: Delete User, UC-30: View User Details |
| **Content Moderation** | UC-31: Moderate Forum Content, UC-32: Remove Inappropriate Post |
| **System Management** | UC-33: View System Analytics, UC-34: Monitor Crisis Events, UC-35: Generate Reports, UC-36: Manage Admin Accounts |

### 2.3 Common Use Cases (Include Relationships)

| Use Case | Description | Included By |
|----------|-------------|-------------|
| **UC-37: Authenticate User** | Verify credentials via Firebase | UC-02, UC-26 |
| **UC-38: Validate Input** | Check input data correctness | UC-04, UC-05, UC-11, UC-14 |
| **UC-39: Encrypt Data** | Encrypt sensitive information | UC-05 |
| **UC-40: Decrypt Data** | Decrypt encrypted information | UC-06 |
| **UC-41: Send Notification** | Create and send notification | UC-17, UC-18 |
| **UC-42: Detect Crisis Keywords** | Scan text for crisis indicators | UC-08 |

### 2.4 Extension Use Cases (Extend Relationships)

| Use Case | Description | Extends |
|----------|-------------|---------|
| **UC-43: Display Crisis Alert** | Show crisis resources modal | UC-08 (Chat with AI) |
| **UC-44: Post Anonymously** | Create post without identity | UC-11 (Create Forum Post) |
| **UC-45: Comment Anonymously** | Add comment without identity | UC-14 (Comment on Post) |
| **UC-46: Generate AI Insights** | Create mood insights using AI | UC-07 (View Mood Statistics) |

---

## 3. Use Case Diagram

### 3.1 Visual Representation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MindMate System                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    USER FUNCTIONS                                   │    │
│  │                                                                     │    │
│  │  Authentication & Profile                                          │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │  │  Register    │◄───┤ Authenticate │───►│    Login     │        │    │
│  │  │   Account    │    │     User     │    │              │        │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │         │                «include»               │                │    │
│  │         └────────────────────┬───────────────────┘                │    │
│  │                              ▼                                     │    │
│  │                      ┌──────────────┐                             │    │
│  │                      │   Manage     │                             │    │
│  │                      │   Profile    │                             │    │
│  │                      └──────────────┘                             │    │
│  │                                                                     │    │
│  │  Mood Tracking                                                     │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │  │  Log Mood    │───►│   Encrypt    │    │ View Mood    │        │    │
│  │  │    Entry     │    │     Data     │    │   History    │        │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │                         «include»                │                │    │
│  │                                                  ▼                │    │
│  │                                          ┌──────────────┐        │    │
│  │                                          │   Decrypt    │        │    │
│  │                                          │     Data     │        │    │
│  │                                          └──────────────┘        │    │
│  │                                                  │                │    │
│  │                                                  ▼                │    │
│  │                                          ┌──────────────┐        │    │
│  │                                          │ View Mood    │        │    │
│  │                                          │  Statistics  │        │    │
│  │                                          └──────────────┘        │    │
│  │                                                  │                │    │
│  │                                                  ▼ «extend»       │    │
│  │                                          ┌──────────────┐        │    │
│  │                                          │ Generate AI  │        │    │
│  │                                          │   Insights   │        │    │
│  │                                          └──────────────┘        │    │
│  │                                                                     │    │
│  │  AI Chat Companion                                                 │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │  │  Chat with   │───►│ Detect Crisis│───►│Display Crisis│        │    │
│  │  │      AI      │    │   Keywords   │    │    Alert     │        │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │         │                «include»            «extend»            │    │
│  │         │                                                          │    │
│  │         ├──────────────┐                                          │    │
│  │         ▼              ▼                                          │    │
│  │  ┌──────────────┐ ┌──────────────┐                              │    │
│  │  │ View Chat    │ │ Clear Chat   │                              │    │
│  │  │   History    │ │   History    │                              │    │
│  │  └──────────────┘ └──────────────┘                              │    │
│  │                                                                     │    │
│  │  Community Forum                                                   │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │  │Create Forum  │───►│   Validate   │    │     Post     │        │    │
│  │  │     Post     │    │    Input     │    │ Anonymously  │        │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │         │                «include»            «extend»            │    │
│  │         │                                                          │    │
│  │  ┌──────┴──────┬──────────────┬──────────────┐                   │    │
│  │  ▼             ▼              ▼              ▼                   │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │ View │ │React │ │Comment│ │ Comment  │ │  Filter  │          │    │
│  │  │Posts │ │ Post │ │ Post  │ │Anonymous │ │by Tags   │          │    │
│  │  └──────┘ └──────┘ └──────┘ └──────────┘ └──────────┘          │    │
│  │                                  «extend»                          │    │
│  │                                                                     │    │
│  │  Peer Matching                                                     │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │  │ Find Peer    │    │Send Match    │───►│     Send     │        │    │
│  │  │   Matches    │    │   Request    │    │ Notification │        │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │                                               «include»            │    │
│  │         ┌──────────────┬──────────────┐                           │    │
│  │         ▼              ▼              ▼                           │    │
│  │  ┌──────────┐   ┌──────────┐  ┌──────────┐                      │    │
│  │  │ Respond  │───│   Send   │  │View My   │                      │    │
│  │  │to Match  │   │Notification│  │ Matches  │                      │    │
│  │  └──────────┘   └──────────┘  └──────────┘                      │    │
│  │                    «include»                                       │    │
│  │                                                                     │    │
│  │  Notifications & Settings                                          │    │
│  │  ┌──────────────┬──────────────┬──────────────┐                  │    │
│  │  ▼              ▼              ▼              ▼                  │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                            │    │
│  │  │ View │ │ Mark │ │Delete│ │Update│                            │    │
│  │  │Notif.│ │ Read │ │Notif.│ │Settings│                            │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                            │    │
│  │                                                                     │    │
│  │  Dashboard & Crisis                                                │    │
│  │  ┌──────────────┐              ┌──────────────┐                  │    │
│  │  │     View     │              │    Access    │                  │    │
│  │  │  Dashboard   │              │    Crisis    │                  │    │
│  │  └──────────────┘              │  Resources   │                  │    │
│  │                                 └──────────────┘                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    ADMIN FUNCTIONS                                  │    │
│  │                                                                     │    │
│  │  Admin Access                                                       │    │
│  │  ┌──────────────┐    ┌──────────────┐                             │    │
│  │  │ Login as     │───►│ Authenticate │                             │    │
│  │  │    Admin     │    │     User     │                             │    │
│  │  └──────────────┘    └──────────────┘                             │    │
│  │                         «include»                                   │    │
│  │                                                                     │    │
│  │  User Management                                                    │    │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────┐   │    │
│  │  ▼              ▼              ▼              ▼              ▼   │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │    │
│  │  │ View │ │Suspend│ │Delete│ │ View │ │Manage│                   │    │
│  │  │Users │ │ User  │ │ User │ │Details│ │Admins│                   │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                   │    │
│  │                                                                     │    │
│  │  Content Moderation                                                │    │
│  │  ┌──────────────┐              ┌──────────────┐                  │    │
│  │  │  Moderate    │              │    Remove    │                  │    │
│  │  │   Content    │              │Inappropriate │                  │    │
│  │  └──────────────┘              │     Post     │                  │    │
│  │                                 └──────────────┘                  │    │
│  │                                                                     │    │
│  │  System Management                                                 │    │
│  │  ┌──────────────┬──────────────┬──────────────┐                  │    │
│  │  ▼              ▼              ▼              ▼                  │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐                                      │    │
│  │  │ View │ │Monitor│ │Generate│                                      │    │
│  │  │Analytics│ │Crisis│ │Reports│                                      │    │
│  │  └──────┘ └──────┘ └──────┘                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Legend:
───►  Association (Actor to Use Case)
◄───  Include Relationship
───►  Extend Relationship
```

---

## 4. Relationships

### 4.1 Include Relationships («include»)

Include relationships represent mandatory sub-functionality that must execute.

| Base Use Case | Includes | Reason |
|---------------|----------|--------|
| UC-02: Login | UC-37: Authenticate User | Authentication is mandatory for login |
| UC-26: Login as Admin | UC-37: Authenticate User | Authentication is mandatory for admin access |
| UC-04: Manage Profile | UC-38: Validate Input | Input validation is required before saving |
| UC-05: Log Mood Entry | UC-38: Validate Input | Input validation is required |
| UC-05: Log Mood Entry | UC-39: Encrypt Data | Journal entries must be encrypted |
| UC-06: View Mood History | UC-40: Decrypt Data | Journal entries must be decrypted for viewing |
| UC-08: Chat with AI | UC-42: Detect Crisis Keywords | Every message must be scanned for crisis indicators |
| UC-11: Create Forum Post | UC-38: Validate Input | Post content must be validated |
| UC-14: Comment on Post | UC-38: Validate Input | Comment content must be validated |
| UC-17: Send Match Request | UC-41: Send Notification | Notification must be sent to target user |
| UC-18: Respond to Match | UC-41: Send Notification | Notification must be sent to requester |

### 4.2 Extend Relationships («extend»)

Extend relationships represent optional functionality that may execute under certain conditions.

| Base Use Case | Extended By | Condition |
|---------------|-------------|-----------|
| UC-07: View Mood Statistics | UC-46: Generate AI Insights | If user has sufficient mood data |
| UC-08: Chat with AI | UC-43: Display Crisis Alert | If crisis keywords are detected |
| UC-11: Create Forum Post | UC-44: Post Anonymously | If user chooses anonymous option |
| UC-14: Comment on Post | UC-45: Comment Anonymously | If user chooses anonymous option |

### 4.3 Generalization Relationships

| General Use Case | Specialized Use Cases |
|------------------|----------------------|
| UC-02: Login | UC-26: Login as Admin |

---

## 5. Key Use Case Descriptions

### UC-02: Login (with Include)
**Actor:** User  
**Preconditions:** User has registered account  
**Main Flow:**
1. User enters credentials
2. **Include: UC-37 Authenticate User** (Firebase verification)
3. System generates JWT token
4. System redirects to dashboard

**Postconditions:** User authenticated and logged in

---

### UC-05: Log Mood Entry (with Multiple Includes)
**Actor:** User  
**Preconditions:** User is logged in  
**Main Flow:**
1. User selects mood level (1-10)
2. User writes journal entry
3. User selects triggers, activities, sleep hours
4. **Include: UC-38 Validate Input** (Check data correctness)
5. **Include: UC-39 Encrypt Data** (Encrypt journal with AES-256-GCM)
6. System saves mood entry
7. System displays success message

**Postconditions:** Encrypted mood entry saved to database

---

### UC-08: Chat with AI (with Include and Extend)
**Actor:** User  
**Preconditions:** User is logged in  
**Main Flow:**
1. User types message
2. System sends to Google Gemini AI
3. **Include: UC-42 Detect Crisis Keywords** (Scan for crisis indicators)
4. System receives AI response
5. System stores conversation
6. System displays response
7. **Extend: UC-43 Display Crisis Alert** (If crisis detected, show resources)

**Postconditions:** Message exchanged and stored

---

### UC-11: Create Forum Post (with Include and Extend)
**Actor:** User  
**Preconditions:** User is logged in  
**Main Flow:**
1. User enters post title, content, tags
2. **Include: UC-38 Validate Input** (Validate post content)
3. **Extend: UC-44 Post Anonymously** (If user selects anonymous option)
4. System saves post to database
5. System displays post in forum

**Postconditions:** Forum post created (anonymous or identified)

---

### UC-17: Send Match Request (with Include)
**Actor:** User  
**Preconditions:** User viewing potential matches  
**Main Flow:**
1. User clicks connect button
2. System creates match request
3. **Include: UC-41 Send Notification** (Notify target user)
4. System displays confirmation

**Postconditions:** Match request sent and notification created

---

## 6. Use Case Priority Matrix

| Priority | Use Cases |
|----------|-----------|
| **Critical** | UC-02 (Login), UC-05 (Log Mood), UC-08 (Chat with AI), UC-25 (Crisis Resources), UC-42 (Detect Crisis) |
| **High** | UC-01 (Register), UC-06 (View Mood History), UC-11 (Create Post), UC-24 (Dashboard), UC-27 (View Users), UC-31 (Moderate Content) |
| **Medium** | UC-04 (Manage Profile), UC-07 (Mood Stats), UC-12 (View Posts), UC-16 (Find Matches), UC-20 (View Notifications), UC-33 (System Analytics) |
| **Low** | UC-10 (Clear Chat), UC-15 (Filter Posts), UC-22 (Delete Notification), UC-35 (Generate Reports) |

---

**Document Control:**
- **Created by:** MindMate Development Team
- **Approved by:** Project Stakeholders
- **Next Review Date:** December 21, 2025

---

## Appendix A: Complete Use Case Specifications

### UC-01: Register Account (Detailed)

**Use Case ID:** UC-01  
**Use Case Name:** Register Account  
**Actor:** User (Student)  
**Priority:** High  
**Complexity:** Medium

**Preconditions:**
- User has internet access
- User has valid email address
- User is 18+ years old

**Main Success Scenario:**
1. User navigates to MindMate website
2. User clicks "Sign Up" button
3. System displays registration form
4. User enters:
   - Email address
   - Password (minimum 6 characters)
   - Full name
   - University name
   - Year of study (1-4, Graduate)
5. User checks "I accept Terms and Conditions"
6. User clicks "Create Account" button
7. System validates all inputs
8. System checks email uniqueness
9. System creates Firebase authentication account
10. System generates user ID
11. System creates user record in MongoDB
12. System generates JWT token
13. System logs user in automatically
14. System redirects to dashboard with welcome message

**Postconditions:**
- User account created in Firebase and MongoDB
- User is authenticated with JWT token
- User can access protected features
- Welcome email sent to user

**Alternative Flows:**

**A1: Email Already Exists**
- At step 8, if email exists:
  - System displays error: "Email already registered"
  - User can click "Login instead"
  - Return to step 4

**A2: Weak Password**
- At step 7, if password < 6 characters:
  - System displays error: "Password must be at least 6 characters"
  - Return to step 4

**A3: Terms Not Accepted**
- At step 7, if terms not checked:
  - System displays error: "You must accept terms and conditions"
  - Return to step 5

**A4: Firebase Service Unavailable**
- At step 9, if Firebase is down:
  - System displays error: "Service temporarily unavailable. Please try again later"
  - Log error for admin review
  - Return to step 6

**Exception Flows:**

**E1: Network Connection Lost**
- At any step, if network fails:
  - System displays: "Connection lost. Please check your internet"
  - User can retry when connection restored

**Business Rules:**
- BR-001: Users must be 18+ (enforced through terms)
- BR-002: Email must be unique across platform
- BR-003: Password minimum 6 characters
- BR-004: University and year are required fields

**Special Requirements:**
- SR-001: Form must be accessible (WCAG 2.1 AA)
- SR-002: Password must be masked
- SR-003: Email validation must check format
- SR-004: Registration must complete within 5 seconds

**Frequency of Use:** High (new users daily)

**Assumptions:**
- User has valid email address
- User can receive verification emails
- Firebase service is operational

---

### UC-05: Log Mood Entry (Detailed)

**Use Case ID:** UC-05  
**Use Case Name:** Log Mood Entry  
**Actor:** User (Student)  
**Priority:** Critical  
**Complexity:** High

**Preconditions:**
- User is logged in
- User has valid JWT token

**Main Success Scenario:**
1. User navigates to "Track Mood" page
2. System displays mood entry form
3. User selects mood level using slider (1-10)
   - 1-2: Very Bad
   - 3-4: Bad
   - 5-6: Okay
   - 7-8: Good
   - 9-10: Excellent
4. User writes journal entry (optional, max 1000 characters)
5. User selects triggers from predefined list (multiple selection):
   - Academic Stress
   - Social Anxiety
   - Family Issues
   - Financial Stress
   - Health Concerns
   - Relationship Problems
   - Other
6. User selects activities from predefined list (multiple selection):
   - Exercise
   - Meditation
   - Socializing
   - Studying
   - Gaming
   - Reading
   - Other
7. User enters sleep hours (0-24, decimal allowed)
8. User clicks "Save Entry" button
9. System validates all inputs
10. System encrypts journal entry using AES-256-GCM
11. System generates encryption metadata (IV, auth tag)
12. System saves mood entry to MongoDB
13. System displays success message: "Mood entry saved successfully"
14. System updates dashboard statistics
15. System redirects to mood history page

**Postconditions:**
- Mood entry saved with encrypted journal
- User statistics updated
- Entry visible in mood history
- Dashboard reflects new entry

**Alternative Flows:**

**A1: No Journal Entry**
- At step 4, if user skips journal:
  - Continue to step 5
  - Save mood entry without journal text

**A2: Invalid Sleep Hours**
- At step 9, if sleep hours < 0 or > 24:
  - System displays error: "Sleep hours must be between 0 and 24"
  - Return to step 7

**A3: Duplicate Entry for Today**
- At step 12, if entry exists for today:
  - System asks: "You already logged mood today. Update existing entry?"
  - If yes: Update existing entry
  - If no: Return to step 3

**Exception Flows:**

**E1: Encryption Failure**
- At step 10, if encryption fails:
  - System logs error
  - System displays: "Unable to save entry. Please try again"
  - Do not save entry
  - Return to step 8

**E2: Database Connection Lost**
- At step 12, if MongoDB unavailable:
  - System stores entry in local storage temporarily
  - System displays: "Entry saved locally. Will sync when online"
  - Retry sync when connection restored

**Business Rules:**
- BR-005: One mood entry per day per user
- BR-006: Mood level must be 1-10
- BR-007: Journal entries must be encrypted
- BR-008: Sleep hours must be 0-24
- BR-009: Triggers and activities are optional

**Special Requirements:**
- SR-005: Journal encryption must use AES-256-GCM
- SR-006: Encryption key must be stored securely
- SR-007: Form must auto-save draft every 30 seconds
- SR-008: Mood entry must save within 2 seconds

**Security Requirements:**
- SEC-001: Journal text never transmitted unencrypted
- SEC-002: Encryption key never exposed to client
- SEC-003: Only user can decrypt their own journals

**Frequency of Use:** Very High (daily per active user)

**Assumptions:**
- User understands mood scale
- User can write in English
- Encryption service is operational

---

### UC-08: Chat with AI (Detailed)

**Use Case ID:** UC-08  
**Use Case Name:** Chat with AI  
**Actor:** User (Student), Google Gemini AI (Secondary)  
**Priority:** Critical  
**Complexity:** High

**Preconditions:**
- User is logged in
- Google Gemini AI service is available
- User has internet connection

**Main Success Scenario:**
1. User navigates to "AI Chat" page
2. System retrieves conversation history from database
3. System displays chat interface with previous messages
4. User types message in text input
5. User clicks "Send" button or presses Enter
6. System displays user message in chat
7. System shows "AI is typing..." indicator
8. System scans message for crisis keywords
9. System prepares context from conversation history
10. System sends message to Google Gemini AI with context
11. System receives AI response
12. System stores user message and AI response in database
13. System displays AI response in chat
14. System hides "AI is typing..." indicator
15. System scrolls to latest message

**Postconditions:**
- Message exchange stored in database
- Conversation history updated
- User can continue chatting

**Alternative Flows:**

**A1: Crisis Keywords Detected**
- At step 8, if crisis keywords found:
  - System flags message as crisis
  - Continue to step 9
  - After step 13, **Extend to UC-43: Display Crisis Alert**
  - System shows crisis resources modal
  - User can call hotline or continue chatting
  - System logs crisis event for admin monitoring

**A2: Empty Message**
- At step 5, if message is empty or whitespace only:
  - System displays error: "Please enter a message"
  - Return to step 4

**A3: Message Too Long**
- At step 5, if message > 2000 characters:
  - System displays error: "Message too long (max 2000 characters)"
  - Return to step 4

**Exception Flows:**

**E1: Gemini AI Service Unavailable**
- At step 10, if Gemini AI is down:
  - System displays fallback response:
    "I'm temporarily unavailable. Please try again in a moment. If you're in crisis, please call 988."
  - System logs error for admin
  - User can retry message

**E2: API Rate Limit Exceeded**
- At step 10, if rate limit hit:
  - System displays: "Too many messages. Please wait a moment"
  - System implements exponential backoff
  - Retry after delay

**E3: Network Timeout**
- At step 10, if request times out (>10 seconds):
  - System displays: "Request timed out. Please try again"
  - System cancels request
  - User can retry

**Business Rules:**
- BR-010: Crisis keywords must be detected in real-time
- BR-011: AI responses must be empathetic and supportive
- BR-012: Conversation history limited to last 50 messages
- BR-013: Messages stored indefinitely unless user clears

**Special Requirements:**
- SR-009: AI response must appear within 5 seconds
- SR-010: Crisis detection must be 100% reliable
- SR-011: Chat must support markdown formatting
- SR-012: User can clear conversation history anytime

**Security Requirements:**
- SEC-004: Conversations are private to user
- SEC-005: Admin can view crisis-flagged conversations only
- SEC-006: Messages transmitted over HTTPS only

**Crisis Keywords List:**
- suicide, kill myself, end my life, want to die
- better off dead, no reason to live, can't go on
- self harm, cut myself, hurt myself
- hopeless, worthless, no point, give up

**AI Prompt Template:**
```
You are a compassionate mental health support companion for university students.
Be empathetic, supportive, and non-judgmental.
If the user expresses crisis thoughts, show concern and encourage professional help.
Keep responses concise (2-3 paragraphs max).

Conversation history:
{previous_messages}

User message: {current_message}

Respond with empathy and support:
```

**Frequency of Use:** Very High (multiple times per active user daily)

**Assumptions:**
- User understands AI is not a replacement for therapy
- User has accepted terms acknowledging AI limitations
- Gemini AI provides appropriate responses

---

## Appendix B: Use Case Relationships Matrix

### Include Relationships

| Base Use Case | Included Use Case | Reason | Mandatory |
|---------------|-------------------|--------|-----------|
| UC-02: Login | UC-37: Authenticate User | Authentication required for login | Yes |
| UC-26: Login as Admin | UC-37: Authenticate User | Authentication required for admin access | Yes |
| UC-04: Manage Profile | UC-38: Validate Input | Profile data must be validated | Yes |
| UC-05: Log Mood Entry | UC-38: Validate Input | Mood data must be validated | Yes |
| UC-05: Log Mood Entry | UC-39: Encrypt Data | Journal must be encrypted | Yes |
| UC-06: View Mood History | UC-40: Decrypt Data | Journal must be decrypted for display | Yes |
| UC-08: Chat with AI | UC-42: Detect Crisis Keywords | Every message must be scanned | Yes |
| UC-11: Create Forum Post | UC-38: Validate Input | Post content must be validated | Yes |
| UC-14: Comment on Post | UC-38: Validate Input | Comment must be validated | Yes |
| UC-17: Send Match Request | UC-41: Send Notification | Target user must be notified | Yes |
| UC-18: Respond to Match | UC-41: Send Notification | Requester must be notified | Yes |

### Extend Relationships

| Base Use Case | Extending Use Case | Condition | Optional |
|---------------|-------------------|-----------|----------|
| UC-07: View Mood Statistics | UC-46: Generate AI Insights | User has 7+ mood entries | Yes |
| UC-08: Chat with AI | UC-43: Display Crisis Alert | Crisis keywords detected | Yes |
| UC-11: Create Forum Post | UC-44: Post Anonymously | User selects anonymous option | Yes |
| UC-14: Comment on Post | UC-45: Comment Anonymously | User selects anonymous option | Yes |

---

## Appendix C: Actor Characteristics

### User (Student) Profile

**Demographics:**
- Age: 18-30 years old
- Education: University student (undergraduate or graduate)
- Tech Savvy: Moderate to high
- Mental Health Awareness: Varies

**Goals:**
- Track and improve mental health
- Get support during difficult times
- Connect with peers facing similar challenges
- Access resources when needed

**Pain Points:**
- Stigma around mental health
- Limited access to professional help
- Feeling isolated or alone
- Academic and social pressures

**Usage Patterns:**
- Daily mood tracking (morning or evening)
- Chat with AI during stress or anxiety
- Browse forum when seeking community
- Check dashboard for progress tracking

**Motivations:**
- Self-improvement
- Understanding mental health patterns
- Peer support
- Crisis prevention

---

### Admin (System Administrator) Profile

**Demographics:**
- Age: 25-45 years old
- Role: Mental health professional or IT administrator
- Experience: Mental health awareness training
- Tech Savvy: High

**Goals:**
- Ensure user safety
- Maintain platform integrity
- Monitor crisis situations
- Generate insights for improvements

**Responsibilities:**
- User account management
- Content moderation
- Crisis event monitoring
- System health monitoring
- Report generation

**Usage Patterns:**
- Daily crisis monitoring
- Weekly content moderation
- Monthly analytics review
- As-needed user management

**Decision Authority:**
- Suspend/delete user accounts
- Remove inappropriate content
- Access crisis-flagged conversations
- Generate system reports

---

## Appendix D: Use Case Traceability to Requirements

| Use Case | Functional Requirement | Non-Functional Requirement |
|----------|------------------------|----------------------------|
| UC-01: Register Account | FR-UM-01 | NFR-SEC-01, NFR-U-01 |
| UC-02: Login | FR-UM-02 | NFR-SEC-01, NFR-P-01 |
| UC-03: Logout | FR-UM-03 | NFR-SEC-01 |
| UC-04: Manage Profile | FR-UM-04 | NFR-U-01, NFR-P-01 |
| UC-05: Log Mood Entry | FR-MT-01 | NFR-SEC-02, NFR-P-01 |
| UC-06: View Mood History | FR-MT-02 | NFR-SEC-02, NFR-P-01 |
| UC-07: View Mood Statistics | FR-MT-03 | NFR-P-01, NFR-U-04 |
| UC-08: Chat with AI | FR-AI-01 | NFR-P-01, NFR-R-01 |
| UC-09: View Chat History | FR-AI-02 | NFR-P-01 |
| UC-10: Clear Chat History | FR-AI-04 | NFR-P-01 |
| UC-11: Create Forum Post | FR-CF-01 | NFR-SEC-05, NFR-U-01 |
| UC-12: View Forum Posts | FR-CF-02 | NFR-P-01 |
| UC-13: React to Post | FR-CF-03 | NFR-P-01 |
| UC-14: Comment on Post | FR-CF-04 | NFR-SEC-05, NFR-U-01 |
| UC-15: Filter Posts by Tags | FR-CF-05 | NFR-P-01 |
| UC-16: Find Peer Matches | FR-PM-01 | NFR-P-01, NFR-SEC-05 |
| UC-17: Send Match Request | FR-PM-02 | NFR-P-01 |
| UC-18: Respond to Match | FR-PM-03 | NFR-P-01 |
| UC-19: View My Matches | FR-PM-04 | NFR-P-01 |
| UC-20: View Notifications | FR-NS-02 | NFR-P-01 |
| UC-24: View Dashboard | FR-DA-01 | NFR-P-01, NFR-U-04 |
| UC-25: Access Crisis Resources | FR-AI-03 | NFR-R-01 |
| UC-27: View All Users | FR-AD-01 | NFR-SEC-03 |
| UC-31: Moderate Forum Content | FR-AD-02 | NFR-SEC-03 |
| UC-33: View System Analytics | FR-AD-03 | NFR-M-03 |
| UC-34: Monitor Crisis Events | FR-AD-04 | NFR-R-01 |
| UC-42: Detect Crisis Keywords | FR-AI-03 | NFR-R-01, NFR-P-01 |

---

---

## Appendix E: Sequence Diagrams

### Sequence Diagram 1: User Registration

```
User          Frontend       Backend        Firebase       MongoDB
 │               │              │              │              │
 │ Enter details │              │              │              │
 │──────────────►│              │              │              │
 │               │              │              │              │
 │ Click Register│              │              │              │
 │──────────────►│              │              │              │
 │               │              │              │              │
 │               │ POST /auth/register         │              │
 │               │─────────────►│              │              │
 │               │              │              │              │
 │               │              │ Create User  │              │
 │               │              │─────────────►│              │
 │               │              │              │              │
 │               │              │ User UID     │              │
 │               │              │◄─────────────│              │
 │               │              │              │              │
 │               │              │ Save User    │              │
 │               │              │──────────────┼─────────────►│
 │               │              │              │              │
 │               │              │ User Document│              │
 │               │              │◄─────────────┼──────────────│
 │               │              │              │              │
 │               │              │ Generate JWT │              │
 │               │              │──────────────┤              │
 │               │              │              │              │
 │               │ JWT Token    │              │              │
 │               │◄─────────────│              │              │
 │               │              │              │              │
 │ Redirect to   │              │              │              │
 │   Dashboard   │              │              │              │
 │◄──────────────│              │              │              │
```

---

### Sequence Diagram 2: Mood Entry with Encryption

```
User       Frontend    Backend    Encryption   MongoDB
 │            │           │        Service       │
 │ Fill form  │           │           │          │
 │───────────►│           │           │          │
 │            │           │           │          │
 │ Click Save │           │           │          │
 │───────────►│           │           │          │
 │            │           │           │          │
 │            │ POST /mood/entry      │          │
 │            │──────────►│           │          │
 │            │           │           │          │
 │            │           │ Validate  │          │
 │            │           │───────────┤          │
 │            │           │           │          │
 │            │           │ Encrypt Journal      │
 │            │           │──────────►│          │
 │            │           │           │          │
 │            │           │ {iv, encrypted, tag} │
 │            │           │◄──────────│          │
 │            │           │           │          │
 │            │           │ Save Entry│          │
 │            │           │───────────┼─────────►│
 │            │           │           │          │
 │            │           │ Entry ID  │          │
 │            │           │◄──────────┼──────────│
 │            │           │           │          │
 │            │ Success   │           │          │
 │            │◄──────────│           │          │
 │            │           │           │          │
 │ Show Success│          │           │          │
 │◄───────────│           │           │          │
```

---

### Sequence Diagram 3: AI Chat with Crisis Detection

```
User     Frontend   Backend   Crisis     Gemini AI   Notification
 │          │          │      Detector      │           │
 │ Type msg │          │         │          │           │
 │─────────►│          │         │          │           │
 │          │          │         │          │           │
 │ Send     │          │         │          │           │
 │─────────►│          │         │          │           │
 │          │          │         │          │           │
 │          │ POST /chat/message │          │           │
 │          │─────────►│         │          │           │
 │          │          │         │          │           │
 │          │          │ Scan Keywords     │           │
 │          │          │────────►│          │           │
 │          │          │         │          │           │
 │          │          │ Crisis Detected!  │           │
 │          │          │◄────────│          │           │
 │          │          │         │          │           │
 │          │          │ Send to AI        │           │
 │          │          │────────┼─────────►│           │
 │          │          │         │          │           │
 │          │          │ AI Response       │           │
 │          │          │◄───────┼──────────│           │
 │          │          │         │          │           │
 │          │          │ Store Conversation│           │
 │          │          │────────┼──────────┼──────────►│
 │          │          │         │          │           │
 │          │          │ Notify Admin      │           │
 │          │          │────────┼──────────┼──────────►│
 │          │          │         │          │           │
 │          │ Response + Crisis Alert      │           │
 │          │◄─────────│         │          │           │
 │          │          │         │          │           │
 │ Display  │          │         │          │           │
 │ Response │          │         │          │           │
 │◄─────────│          │         │          │           │
 │          │          │         │          │           │
 │ Show     │          │         │          │           │
 │ Crisis   │          │         │          │           │
 │ Modal    │          │         │          │           │
 │◄─────────│          │         │          │           │
```

---

### Sequence Diagram 4: Peer Matching

```
User A    Frontend   Backend   Matching    MongoDB    User B
 │           │          │       Algorithm     │         │
 │ Find Peers│          │          │          │         │
 │──────────►│          │          │          │         │
 │           │          │          │          │         │
 │           │ GET /matching/find  │          │         │
 │           │─────────►│          │          │         │
 │           │          │          │          │         │
 │           │          │ Get User Profile    │         │
 │           │          │──────────┼─────────►│         │
 │           │          │          │          │         │
 │           │          │ User Data│          │         │
 │           │          │◄─────────┼──────────│         │
 │           │          │          │          │         │
 │           │          │ Calculate Scores    │         │
 │           │          │─────────►│          │         │
 │           │          │          │          │         │
 │           │          │ Ranked Matches      │         │
 │           │          │◄─────────│          │         │
 │           │          │          │          │         │
 │           │ Match List│         │          │         │
 │           │◄─────────│          │          │         │
 │           │          │          │          │         │
 │ Display   │          │          │          │         │
 │ Matches   │          │          │          │         │
 │◄──────────│          │          │          │         │
 │           │          │          │          │         │
 │ Click     │          │          │          │         │
 │ Connect   │          │          │          │         │
 │──────────►│          │          │          │         │
 │           │          │          │          │         │
 │           │ POST /matching/request         │         │
 │           │─────────►│          │          │         │
 │           │          │          │          │         │
 │           │          │ Create Match Request│         │
 │           │          │──────────┼─────────►│         │
 │           │          │          │          │         │
 │           │          │ Send Notification   │         │
 │           │          │──────────┼──────────┼────────►│
 │           │          │          │          │         │
 │           │ Success  │          │          │         │
 │           │◄─────────│          │          │         │
 │           │          │          │          │         │
 │ Show      │          │          │          │         │
 │ Confirmation│        │          │          │         │
 │◄──────────│          │          │          │         │
```

---

## Appendix F: State Diagrams

### State Diagram: Mood Entry Lifecycle

```
                    ┌─────────────┐
                    │   Initial   │
                    └──────┬──────┘
                           │
                           │ User starts entry
                           ▼
                    ┌─────────────┐
                    │   Editing   │◄──────┐
                    └──────┬──────┘       │
                           │               │
                           │ Click Save    │ Validation fails
                           ▼               │
                    ┌─────────────┐       │
                    │ Validating  │───────┘
                    └──────┬──────┘
                           │
                           │ Validation passes
                           ▼
                    ┌─────────────┐
                    │ Encrypting  │
                    └──────┬──────┘
                           │
                           │ Encryption complete
                           ▼
                    ┌─────────────┐
                    │   Saving    │
                    └──────┬──────┘
                           │
                           │ Save successful
                           ▼
                    ┌─────────────┐
                    │    Saved    │
                    └─────────────┘
```

---

### State Diagram: Match Request Status

```
                    ┌─────────────┐
                    │   Pending   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │             │
          User accepts│           │User rejects
                    │             │
                    ▼             ▼
            ┌─────────────┐ ┌─────────────┐
            │  Accepted   │ │  Rejected   │
            └─────────────┘ └─────────────┘
                    │
                    │ Connection established
                    ▼
            ┌─────────────┐
            │  Connected  │
            └─────────────┘
```

---

### State Diagram: User Account Status

```
                    ┌─────────────┐
                    │Registration │
                    └──────┬──────┘
                           │
                           │ Account created
                           ▼
                    ┌─────────────┐
                    │   Active    │◄──────┐
                    └──────┬──────┘       │
                           │               │
                    ┌──────┴──────┐       │
                    │             │       │
        Admin suspends│           │Admin reactivates
                    │             │       │
                    ▼             │       │
            ┌─────────────┐      │       │
            │  Suspended  │──────┘       │
            └──────┬──────┘               │
                   │                      │
                   │ Admin deletes        │
                   │ OR User deletes      │
                   ▼                      │
            ┌─────────────┐               │
            │   Deleted   │               │
            └─────────────┘               │
                                          │
                    ┌─────────────────────┘
                    │
                    │ Account recovery (within 30 days)
                    │
```

---

## Appendix G: Activity Diagrams

### Activity Diagram: User Registration Process

```
        ┌─────────┐
        │  Start  │
        └────┬────┘
             │
             ▼
    ┌────────────────┐
    │ Enter Details  │
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │ Validate Input │
    └────────┬───────┘
             │
        ┌────┴────┐
        │ Valid?  │
        └────┬────┘
             │
      ┌──────┴──────┐
      │             │
     No            Yes
      │             │
      ▼             ▼
┌──────────┐  ┌──────────────┐
│  Show    │  │ Check Email  │
│  Error   │  │  Uniqueness  │
└────┬─────┘  └──────┬───────┘
     │               │
     │          ┌────┴────┐
     │          │ Unique? │
     │          └────┬────┘
     │               │
     │        ┌──────┴──────┐
     │        │             │
     │       No            Yes
     │        │             │
     └────────┤             ▼
              │    ┌────────────────┐
              │    │ Create Firebase│
              │    │    Account     │
              │    └────────┬───────┘
              │             │
              │             ▼
              │    ┌────────────────┐
              │    │  Save to DB    │
              │    └────────┬───────┘
              │             │
              │             ▼
              │    ┌────────────────┐
              │    │ Generate JWT   │
              │    └────────┬───────┘
              │             │
              │             ▼
              │    ┌────────────────┐
              │    │ Auto Login     │
              │    └────────┬───────┘
              │             │
              │             ▼
              │    ┌────────────────┐
              │    │ Redirect to    │
              │    │   Dashboard    │
              │    └────────┬───────┘
              │             │
              │             ▼
              │        ┌─────────┐
              └───────►│   End   │
                       └─────────┘
```

---

## Appendix H: Use Case Testing Matrix

### Test Coverage Matrix

| Use Case | Unit Tests | Integration Tests | E2E Tests | Manual Tests | Status |
|----------|-----------|-------------------|-----------|--------------|--------|
| UC-01: Register Account | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-02: Login | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-03: Logout | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-04: Manage Profile | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-05: Log Mood Entry | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-06: View Mood History | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-07: View Mood Statistics | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-08: Chat with AI | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-09: View Chat History | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-10: Clear Chat History | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-11: Create Forum Post | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-12: View Forum Posts | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-13: React to Post | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-14: Comment on Post | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-15: Filter Posts by Tags | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-16: Find Peer Matches | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-17: Send Match Request | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-18: Respond to Match | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-19: View My Matches | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-20: View Notifications | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-24: View Dashboard | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-25: Access Crisis Resources | ✅ | ✅ | ✅ | ✅ | Complete |
| UC-27: View All Users | ✅ | ✅ | ⚠️ | ✅ | Partial |
| UC-31: Moderate Content | ✅ | ✅ | ⚠️ | ✅ | Partial |
| UC-42: Detect Crisis Keywords | ✅ | ✅ | ✅ | ✅ | Complete |

**Legend:**
- ✅ Complete
- ⚠️ Partial
- ❌ Not Started

---

## Appendix I: User Journey Maps

### Journey Map 1: New User Onboarding

**Persona:** Sarah, 20-year-old university student

| Stage | Action | Touchpoint | Emotion | Pain Points | Opportunities |
|-------|--------|------------|---------|-------------|---------------|
| **Awareness** | Hears about MindMate from friend | Word of mouth | Curious 😊 | Skeptical about mental health apps | Clear value proposition |
| **Discovery** | Visits website | Landing page | Interested 🤔 | Wants to know if it's safe | Testimonials, security badges |
| **Registration** | Creates account | Sign up form | Hopeful 😌 | Worried about privacy | Clear privacy policy |
| **First Use** | Logs first mood entry | Mood tracking page | Engaged 😃 | Unsure what to write | Helpful prompts, examples |
| **Exploration** | Browses forum | Community page | Connected 🤗 | Afraid to post | Anonymous posting option |
| **Engagement** | Chats with AI | AI chat page | Supported 💙 | Wants human connection | Peer matching suggestion |
| **Retention** | Returns daily | Dashboard | Motivated 💪 | Needs reminders | Email/push notifications |

---

### Journey Map 2: Crisis Situation

**Persona:** John, experiencing mental health crisis

| Stage | Action | Touchpoint | Emotion | Pain Points | Opportunities |
|-------|--------|------------|---------|-------------|---------------|
| **Crisis Onset** | Feeling hopeless | N/A | Distressed 😢 | Alone, overwhelmed | 24/7 availability |
| **Seeking Help** | Opens MindMate | Mobile app | Desperate 😰 | Needs immediate support | Quick access to chat |
| **Reaching Out** | Types crisis message | AI chat | Vulnerable 😔 | Afraid of judgment | Non-judgmental AI |
| **Detection** | Crisis keywords detected | System | Noticed 😌 | Needs resources | Immediate crisis alert |
| **Resources** | Views crisis hotlines | Crisis modal | Hopeful 🙏 | Unsure about calling | Click-to-call feature |
| **Connection** | Calls hotline | Phone | Supported 💙 | Waiting for help | Follow-up check-in |
| **Recovery** | Returns to app | Dashboard | Grateful 🙏 | Wants to track progress | Recovery tracking |

---

**Document Control:**
- **Created by:** MindMate Development Team
- **Approved by:** Project Stakeholders
- **Next Review Date:** December 21, 2025
- **Version History:**
  - v1.0 (Nov 21, 2025): Initial use case diagram
  - v1.1 (Nov 21, 2025): Added sequence diagrams, state diagrams, activity diagrams, testing matrix, and user journey maps
