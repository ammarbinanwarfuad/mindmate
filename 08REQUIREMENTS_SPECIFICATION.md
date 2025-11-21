# Requirements Specification - MindMate Platform

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Project:** MindMate - Full Stack Mental Wellness Platform

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)

---

## 1. System Requirements

### 1.1 Hardware Requirements

#### Client-Side (User Device)
- **Minimum:**
  - Processor: 1 GHz dual-core processor
  - RAM: 2 GB
  - Storage: 100 MB free space
  - Display: 1024x768 resolution
  - Network: Stable internet connection (minimum 1 Mbps)

- **Recommended:**
  - Processor: 2 GHz quad-core processor
  - RAM: 4 GB or higher
  - Storage: 500 MB free space
  - Display: 1920x1080 resolution or higher
  - Network: Broadband internet connection (5 Mbps or higher)

#### Server-Side (Hosting Infrastructure)
- **Minimum:**
  - CPU: 2 vCPUs
  - RAM: 4 GB
  - Storage: 20 GB SSD
  - Network: 100 Mbps bandwidth
  - Database: MongoDB instance with 10 GB storage

- **Recommended:**
  - CPU: 4 vCPUs or higher
  - RAM: 8 GB or higher
  - Storage: 50 GB SSD
  - Network: 1 Gbps bandwidth
  - Database: MongoDB Atlas cluster with auto-scaling

### 1.2 Software Requirements

#### Client-Side
- **Operating System:**
  - Windows 10 or later
  - macOS 10.15 (Catalina) or later
  - Linux (Ubuntu 20.04 or equivalent)
  - iOS 13 or later (mobile)
  - Android 8.0 (Oreo) or later (mobile)

- **Web Browser:**
  - Google Chrome 90+
  - Mozilla Firefox 88+
  - Safari 14+
  - Microsoft Edge 90+
  - Opera 76+

- **Additional Software:**
  - JavaScript enabled
  - Cookies enabled
  - Local storage enabled

#### Server-Side
- **Runtime Environment:**
  - Node.js 18.x or higher
  - npm 9.x or higher

- **Database:**
  - MongoDB 5.0 or higher
  - Mongoose ODM 7.x

- **External Services:**
  - Firebase Authentication
  - Google Gemini AI API
  - Cloud hosting platform (Heroku/Railway/Render/Vercel/Netlify)

#### Development Environment
- **Frontend:**
  - React 18.x
  - Vite 4.x
  - Tailwind CSS 3.x
  - DaisyUI 3.x

- **Backend:**
  - Express.js 4.x
  - JWT for authentication
  - bcryptjs for password hashing
  - CORS middleware

### 1.3 Network Requirements
- Stable internet connection
- HTTPS support for secure communication
- WebSocket support (for future real-time features)
- Firewall configuration to allow HTTP/HTTPS traffic
- DNS configuration for custom domain

### 1.4 Security Requirements
- SSL/TLS certificate for HTTPS
- Environment variable management
- Secure API key storage
- CORS configuration
- Rate limiting implementation

---

## 2. Functional Requirements

### 2.1 User Management (FR-UM)

#### FR-UM-01: User Registration
- **Description:** Users must be able to register for a new account
- **Inputs:** Email, password, name, university, year of study
- **Process:** 
  - Validate email format and uniqueness
  - Enforce password strength requirements (min 6 characters)
  - Accept terms and conditions
  - Create Firebase authentication account
  - Sync user data to MongoDB
- **Outputs:** User account created, automatic login
- **Priority:** High

#### FR-UM-02: User Login
- **Description:** Users must be able to log into their account
- **Inputs:** Email and password OR Google OAuth
- **Process:**
  - Authenticate via Firebase
  - Generate JWT token
  - Retrieve user profile from database
- **Outputs:** Authenticated session, redirect to dashboard
- **Priority:** High

#### FR-UM-03: User Logout
- **Description:** Users must be able to log out securely
- **Inputs:** Logout request
- **Process:** Clear authentication tokens, end session
- **Outputs:** User logged out, redirect to login page
- **Priority:** High

#### FR-UM-04: Profile Management
- **Description:** Users must be able to view and edit their profile
- **Inputs:** Name, bio, university, year of study, profile picture
- **Process:** Validate inputs, update database
- **Outputs:** Updated profile information
- **Priority:** Medium

#### FR-UM-05: Account Settings
- **Description:** Users must be able to manage account settings
- **Inputs:** Privacy preferences, notification settings
- **Process:** Update user preferences in database
- **Outputs:** Updated settings
- **Priority:** Medium

### 2.2 Mood Tracking (FR-MT)

#### FR-MT-01: Create Mood Entry
- **Description:** Users must be able to log their daily mood
- **Inputs:** Mood level (1-10), journal entry, triggers, activities, sleep hours
- **Process:**
  - Validate mood level range
  - Encrypt journal entry using AES-256-GCM
  - Store mood entry with timestamp
- **Outputs:** Mood entry saved successfully
- **Priority:** High

#### FR-MT-02: View Mood History
- **Description:** Users must be able to view their mood history
- **Inputs:** Date range filter (optional)
- **Process:** Retrieve mood entries, decrypt journal entries
- **Outputs:** List of mood entries with details
- **Priority:** High

#### FR-MT-03: Mood Statistics
- **Description:** System must provide mood analytics
- **Inputs:** User ID, time period
- **Process:**
  - Calculate average mood
  - Identify mood trends (improving/stable/declining)
  - Generate mood distribution chart
- **Outputs:** Mood statistics and visualizations
- **Priority:** Medium

#### FR-MT-04: AI-Generated Insights
- **Description:** System must provide AI insights on mood patterns
- **Inputs:** Mood history data
- **Process:** Analyze patterns using AI, generate personalized insights
- **Outputs:** Mood insights and recommendations
- **Priority:** Low

### 2.3 AI Chat Companion (FR-AI)

#### FR-AI-01: Send Message to AI
- **Description:** Users must be able to chat with AI companion
- **Inputs:** User message text
- **Process:**
  - Send message to Google Gemini AI
  - Maintain conversation context
  - Detect crisis keywords
  - Store conversation history
- **Outputs:** AI response message
- **Priority:** High

#### FR-AI-02: View Conversation History
- **Description:** Users must be able to view past conversations
- **Inputs:** User ID
- **Process:** Retrieve conversation history from database
- **Outputs:** List of messages with timestamps
- **Priority:** Medium

#### FR-AI-03: Crisis Detection
- **Description:** System must detect crisis situations
- **Inputs:** User message content
- **Process:**
  - Scan for crisis keywords (suicide, self-harm, etc.)
  - Trigger crisis alert
- **Outputs:** Crisis resource modal with helpline information
- **Priority:** High

#### FR-AI-04: Clear Conversation
- **Description:** Users must be able to clear chat history
- **Inputs:** Clear conversation request
- **Process:** Delete conversation history from database
- **Outputs:** Empty conversation history
- **Priority:** Low

### 2.4 Community Forum (FR-CF)

#### FR-CF-01: Create Forum Post
- **Description:** Users must be able to create forum posts
- **Inputs:** Post title, content, tags, anonymous option
- **Process:**
  - Validate post content
  - Store post with author information
  - Handle anonymous posting
- **Outputs:** Forum post created
- **Priority:** High

#### FR-CF-02: View Forum Posts
- **Description:** Users must be able to browse forum posts
- **Inputs:** Filter criteria (tags, date)
- **Process:** Retrieve posts from database, sort by date/popularity
- **Outputs:** List of forum posts
- **Priority:** High

#### FR-CF-03: React to Posts
- **Description:** Users must be able to react to posts
- **Inputs:** Post ID, reaction type (supportive/helpful/relatable)
- **Process:** Add reaction to post, update reaction count
- **Outputs:** Updated post with reaction
- **Priority:** Medium

#### FR-CF-04: Comment on Posts
- **Description:** Users must be able to comment on posts
- **Inputs:** Post ID, comment text, anonymous option
- **Process:** Validate comment, add to post comments array
- **Outputs:** Comment added to post
- **Priority:** Medium

#### FR-CF-05: Filter Posts by Tags
- **Description:** Users must be able to filter posts by tags
- **Inputs:** Selected tags
- **Process:** Query posts matching selected tags
- **Outputs:** Filtered list of posts
- **Priority:** Low

### 2.5 Peer Matching (FR-PM)

#### FR-PM-01: Find Potential Matches
- **Description:** System must suggest compatible peers
- **Inputs:** User profile data
- **Process:**
  - Calculate match scores based on:
    - University affiliation (30% weight)
    - Year of study (20% weight)
    - Mood patterns (30% weight)
    - Activity level (20% weight)
  - Exclude existing matches
  - Sort by match score
- **Outputs:** List of potential matches with scores
- **Priority:** Medium

#### FR-PM-02: Send Match Request
- **Description:** Users must be able to send connection requests
- **Inputs:** Target user ID
- **Process:**
  - Create match request
  - Create notification for target user
- **Outputs:** Match request sent
- **Priority:** Medium

#### FR-PM-03: Accept/Reject Match
- **Description:** Users must be able to respond to match requests
- **Inputs:** Match ID, action (accept/reject)
- **Process:**
  - Update match status
  - Create notification for requester
- **Outputs:** Match status updated
- **Priority:** Medium

#### FR-PM-04: View My Matches
- **Description:** Users must be able to view their connections
- **Inputs:** User ID
- **Process:** Retrieve accepted matches from database
- **Outputs:** List of connected peers
- **Priority:** Medium

### 2.6 Notification System (FR-NS)

#### FR-NS-01: Create Notifications
- **Description:** System must generate notifications for events
- **Inputs:** User ID, notification type, content
- **Process:** Create notification record in database
- **Outputs:** Notification created
- **Priority:** Medium

#### FR-NS-02: View Notifications
- **Description:** Users must be able to view their notifications
- **Inputs:** User ID
- **Process:** Retrieve unread and recent notifications
- **Outputs:** List of notifications
- **Priority:** Medium

#### FR-NS-03: Mark as Read
- **Description:** Users must be able to mark notifications as read
- **Inputs:** Notification ID
- **Process:** Update notification read status
- **Outputs:** Notification marked as read
- **Priority:** Low

#### FR-NS-04: Delete Notification
- **Description:** Users must be able to delete notifications
- **Inputs:** Notification ID
- **Process:** Remove notification from database
- **Outputs:** Notification deleted
- **Priority:** Low

### 2.7 Dashboard & Analytics (FR-DA)

#### FR-DA-01: View Dashboard
- **Description:** Users must see personalized dashboard
- **Inputs:** User ID
- **Process:**
  - Retrieve user statistics
  - Calculate mood trends
  - Display quick action cards
- **Outputs:** Dashboard with statistics and insights
- **Priority:** High

#### FR-DA-02: User Statistics
- **Description:** System must calculate user statistics
- **Inputs:** User ID
- **Process:**
  - Count mood entries
  - Count forum posts
  - Count matches
  - Calculate average mood
- **Outputs:** User statistics object
- **Priority:** Medium

### 2.8 Admin Functions (FR-AD)

#### FR-AD-01: User Management
- **Description:** Admins must be able to manage users
- **Inputs:** User ID, action (view/suspend/delete)
- **Process:** Perform administrative action on user account
- **Outputs:** User account updated
- **Priority:** High

#### FR-AD-02: Content Moderation
- **Description:** Admins must be able to moderate forum content
- **Inputs:** Post ID, action (approve/remove)
- **Process:** Update post status or remove inappropriate content
- **Outputs:** Content moderated
- **Priority:** High

#### FR-AD-03: System Analytics
- **Description:** Admins must view system-wide analytics
- **Inputs:** Date range
- **Process:**
  - Calculate total users
  - Calculate active users
  - Calculate engagement metrics
- **Outputs:** System analytics dashboard
- **Priority:** Medium

#### FR-AD-04: Crisis Monitoring
- **Description:** Admins must monitor crisis detections
- **Inputs:** Date range
- **Process:** Retrieve crisis detection logs
- **Outputs:** List of crisis events
- **Priority:** High

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements (NFR-P)

#### NFR-P-01: Response Time
- **Requirement:** System must respond to user requests within acceptable time limits
- **Metrics:**
  - Page load time: < 3 seconds
  - API response time: < 500ms for 95% of requests
  - Database query time: < 200ms
  - AI chat response: < 5 seconds
- **Priority:** High

#### NFR-P-02: Throughput
- **Requirement:** System must handle concurrent users efficiently
- **Metrics:**
  - Support 1,000 concurrent users
  - Handle 10,000 requests per minute
  - Process 500 mood entries per minute
- **Priority:** High

#### NFR-P-03: Resource Utilization
- **Requirement:** System must use resources efficiently
- **Metrics:**
  - CPU usage: < 70% under normal load
  - Memory usage: < 80% of available RAM
  - Database connections: < 100 concurrent connections
- **Priority:** Medium

### 3.2 Scalability Requirements (NFR-S)

#### NFR-S-01: Horizontal Scalability
- **Requirement:** System must scale horizontally to handle growth
- **Metrics:**
  - Support adding multiple server instances
  - Load balancing capability
  - Stateless API design
- **Priority:** Medium

#### NFR-S-02: Database Scalability
- **Requirement:** Database must scale with data growth
- **Metrics:**
  - Support 100,000+ user accounts
  - Handle 1 million+ mood entries
  - Support 50,000+ forum posts
- **Priority:** Medium

#### NFR-S-03: Storage Scalability
- **Requirement:** Storage must accommodate growing data
- **Metrics:**
  - Auto-scaling storage capacity
  - Efficient data archival strategy
- **Priority:** Low

### 3.3 Security Requirements (NFR-SEC)

#### NFR-SEC-01: Authentication Security
- **Requirement:** System must implement secure authentication
- **Metrics:**
  - Firebase Authentication integration
  - JWT token-based API authentication
  - Token expiration and refresh mechanism
  - Secure session management
- **Priority:** High

#### NFR-SEC-02: Data Encryption
- **Requirement:** Sensitive data must be encrypted
- **Metrics:**
  - End-to-end encryption for journal entries (AES-256-GCM)
  - HTTPS for all communications
  - Encrypted data at rest
  - Secure encryption key management
- **Priority:** High

#### NFR-SEC-03: Authorization
- **Requirement:** System must enforce proper authorization
- **Metrics:**
  - Role-based access control (User/Admin)
  - Protected API endpoints
  - Resource ownership validation
- **Priority:** High

#### NFR-SEC-04: Input Validation
- **Requirement:** All user inputs must be validated and sanitized
- **Metrics:**
  - Frontend validation
  - Backend validation with express-validator
  - SQL injection prevention
  - XSS attack prevention
- **Priority:** High

#### NFR-SEC-05: Privacy Protection
- **Requirement:** User privacy must be protected
- **Metrics:**
  - Anonymous posting capability
  - Profile visibility controls
  - Data collection preferences
  - GDPR compliance considerations
- **Priority:** High

### 3.4 Reliability Requirements (NFR-R)

#### NFR-R-01: Availability
- **Requirement:** System must be available for users
- **Metrics:**
  - 99.5% uptime (excluding planned maintenance)
  - Maximum 4 hours downtime per month
  - Scheduled maintenance during off-peak hours
- **Priority:** High

#### NFR-R-02: Fault Tolerance
- **Requirement:** System must handle failures gracefully
- **Metrics:**
  - Automatic error recovery
  - Graceful degradation
  - Error logging and monitoring
- **Priority:** Medium

#### NFR-R-03: Data Integrity
- **Requirement:** Data must remain accurate and consistent
- **Metrics:**
  - Database transaction support
  - Data validation at all layers
  - Backup and recovery procedures
- **Priority:** High

#### NFR-R-04: Backup and Recovery
- **Requirement:** System must have backup and recovery mechanisms
- **Metrics:**
  - Daily automated backups
  - Recovery Time Objective (RTO): < 4 hours
  - Recovery Point Objective (RPO): < 24 hours
- **Priority:** Medium

### 3.5 Usability Requirements (NFR-U)

#### NFR-U-01: User Interface
- **Requirement:** Interface must be intuitive and user-friendly
- **Metrics:**
  - Consistent design language
  - Clear navigation structure
  - Responsive design for all devices
  - Maximum 3 clicks to reach any feature
- **Priority:** High

#### NFR-U-02: Accessibility
- **Requirement:** System must be accessible to users with disabilities
- **Metrics:**
  - WCAG 2.1 Level AA compliance
  - Keyboard navigation support
  - Screen reader compatibility
  - Sufficient color contrast (4.5:1 minimum)
- **Priority:** Medium

#### NFR-U-03: Learning Curve
- **Requirement:** Users must be able to use the system with minimal training
- **Metrics:**
  - Intuitive onboarding process
  - Contextual help and tooltips
  - Clear error messages
  - User guide documentation
- **Priority:** Medium

#### NFR-U-04: Responsiveness
- **Requirement:** UI must be responsive across devices
- **Metrics:**
  - Mobile-first design
  - Support for screen sizes 320px to 2560px
  - Touch-friendly interface elements
  - Adaptive layouts
- **Priority:** High

### 3.6 Maintainability Requirements (NFR-M)

#### NFR-M-01: Code Quality
- **Requirement:** Code must be maintainable and well-documented
- **Metrics:**
  - Modular architecture
  - Clear naming conventions
  - Inline comments for complex logic
  - README documentation
- **Priority:** Medium

#### NFR-M-02: Testability
- **Requirement:** System must be testable
- **Metrics:**
  - Unit test coverage: > 70%
  - Integration test coverage
  - API endpoint testing
  - Error scenario testing
- **Priority:** Medium

#### NFR-M-03: Monitoring
- **Requirement:** System must be monitorable
- **Metrics:**
  - Application logging
  - Error tracking
  - Performance monitoring
  - User analytics
- **Priority:** Medium

#### NFR-M-04: Version Control
- **Requirement:** Code must be version controlled
- **Metrics:**
  - Git repository
  - Branching strategy
  - Commit message standards
  - Code review process
- **Priority:** High

### 3.7 Compatibility Requirements (NFR-C)

#### NFR-C-01: Browser Compatibility
- **Requirement:** System must work across major browsers
- **Metrics:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
  - Opera 76+
- **Priority:** High

#### NFR-C-02: Device Compatibility
- **Requirement:** System must work on various devices
- **Metrics:**
  - Desktop computers
  - Laptops
  - Tablets
  - Smartphones
- **Priority:** High

#### NFR-C-03: Operating System Compatibility
- **Requirement:** System must work across operating systems
- **Metrics:**
  - Windows 10+
  - macOS 10.15+
  - Linux (Ubuntu 20.04+)
  - iOS 13+
  - Android 8.0+
- **Priority:** High

### 3.8 Compliance Requirements (NFR-CO)

#### NFR-CO-01: Data Protection
- **Requirement:** System must comply with data protection regulations
- **Metrics:**
  - GDPR compliance considerations
  - User consent management
  - Right to data deletion
  - Data portability
- **Priority:** High

#### NFR-CO-02: Healthcare Compliance
- **Requirement:** System must follow mental health best practices
- **Metrics:**
  - Crisis detection and response
  - Professional help disclaimers
  - Age verification (18+)
  - Terms of service acceptance
- **Priority:** High

#### NFR-CO-03: Accessibility Standards
- **Requirement:** System must meet accessibility standards
- **Metrics:**
  - WCAG 2.1 compliance
  - Section 508 compliance (if applicable)
- **Priority:** Medium

### 3.9 Documentation Requirements (NFR-D)

#### NFR-D-01: User Documentation
- **Requirement:** System must have comprehensive user documentation
- **Metrics:**
  - User guide
  - FAQ section
  - Video tutorials
  - Help tooltips
- **Priority:** Medium

#### NFR-D-02: Technical Documentation
- **Requirement:** System must have technical documentation
- **Metrics:**
  - API documentation
  - Architecture diagrams
  - Database schema documentation
  - Deployment guide
- **Priority:** Medium

#### NFR-D-03: Code Documentation
- **Requirement:** Code must be well-documented
- **Metrics:**
  - Inline comments
  - Function/method documentation
  - README files
  - Setup instructions
- **Priority:** Medium

---

## Requirements Traceability Matrix

| Requirement ID | Category | Priority | Status | Dependencies |
|---------------|----------|----------|--------|--------------|
| FR-UM-01 | User Management | High | ✅ Implemented | Firebase Auth |
| FR-UM-02 | User Management | High | ✅ Implemented | Firebase Auth, JWT |
| FR-UM-03 | User Management | High | ✅ Implemented | - |
| FR-UM-04 | User Management | Medium | ✅ Implemented | FR-UM-02 |
| FR-UM-05 | User Management | Medium | ✅ Implemented | FR-UM-02 |
| FR-MT-01 | Mood Tracking | High | ✅ Implemented | FR-UM-02 |
| FR-MT-02 | Mood Tracking | High | ✅ Implemented | FR-MT-01 |
| FR-MT-03 | Mood Tracking | Medium | ✅ Implemented | FR-MT-01 |
| FR-MT-04 | Mood Tracking | Low | ✅ Implemented | FR-MT-01, Gemini AI |
| FR-AI-01 | AI Chat | High | ✅ Implemented | FR-UM-02, Gemini AI |
| FR-AI-02 | AI Chat | Medium | ✅ Implemented | FR-AI-01 |
| FR-AI-03 | AI Chat | High | ✅ Implemented | FR-AI-01 |
| FR-AI-04 | AI Chat | Low | ✅ Implemented | FR-AI-01 |
| FR-CF-01 | Community Forum | High | ✅ Implemented | FR-UM-02 |
| FR-CF-02 | Community Forum | High | ✅ Implemented | - |
| FR-CF-03 | Community Forum | Medium | ✅ Implemented | FR-CF-02 |
| FR-CF-04 | Community Forum | Medium | ✅ Implemented | FR-CF-02 |
| FR-CF-05 | Community Forum | Low | ✅ Implemented | FR-CF-02 |
| FR-PM-01 | Peer Matching | Medium | ✅ Implemented | FR-UM-02 |
| FR-PM-02 | Peer Matching | Medium | ✅ Implemented | FR-PM-01 |
| FR-PM-03 | Peer Matching | Medium | ✅ Implemented | FR-PM-02 |
| FR-PM-04 | Peer Matching | Medium | ✅ Implemented | FR-PM-03 |
| FR-NS-01 | Notifications | Medium | ✅ Implemented | FR-UM-02 |
| FR-NS-02 | Notifications | Medium | ✅ Implemented | FR-NS-01 |
| FR-NS-03 | Notifications | Low | ✅ Implemented | FR-NS-01 |
| FR-NS-04 | Notifications | Low | ✅ Implemented | FR-NS-01 |
| FR-DA-01 | Dashboard | High | ✅ Implemented | FR-UM-02 |
| FR-DA-02 | Dashboard | Medium | ✅ Implemented | FR-UM-02 |
| FR-AD-01 | Admin | High | 🚧 Partial | FR-UM-02 |
| FR-AD-02 | Admin | High | 🚧 Partial | FR-UM-02 |
| FR-AD-03 | Admin | Medium | ❌ Not Implemented | FR-UM-02 |
| FR-AD-04 | Admin | High | ❌ Not Implemented | FR-AI-03 |

---

## Glossary

- **AI Companion**: Google Gemini-powered chatbot providing empathetic support
- **AES-256-GCM**: Advanced Encryption Standard with 256-bit key in Galois/Counter Mode
- **CORS**: Cross-Origin Resource Sharing
- **DFD**: Data Flow Diagram
- **Firebase**: Google's platform for authentication and backend services
- **GDPR**: General Data Protection Regulation
- **JWT**: JSON Web Token for authentication
- **MongoDB**: NoSQL document database
- **Mood Entry**: User's daily log of emotional state
- **Peer Matching**: Algorithm to connect compatible users
- **WCAG**: Web Content Accessibility Guidelines

---

## Appendix A: Detailed Use Case Scenarios

### Scenario 1: New User Registration and First Mood Entry

**Actors:** New User (Sarah, 20-year-old university student)

**Preconditions:** Sarah has internet access and a valid email address

**Flow:**
1. Sarah visits MindMate website
2. Clicks "Sign Up" button
3. Enters email: sarah@university.edu, password, name, university, year
4. Accepts terms and conditions
5. System creates Firebase account
6. System syncs to MongoDB
7. Sarah is automatically logged in
8. Dashboard displays welcome message
9. Sarah clicks "Track Mood" from quick actions
10. Selects mood level: 6/10 (Okay)
11. Writes journal: "First day of semester, feeling nervous but excited"
12. Selects triggers: ["Academic Stress"], activities: ["Exercise"]
13. Enters sleep hours: 7
14. System encrypts journal entry
15. System saves mood entry
16. Dashboard updates with first mood entry

**Postconditions:** Sarah has account and first mood entry logged

**Business Value:** User onboarding completed, engagement started

---

### Scenario 2: Crisis Detection and Response

**Actors:** User (John), AI System, Crisis Resources

**Preconditions:** John is logged in and feeling distressed

**Flow:**
1. John opens AI Chat
2. Types: "I feel like I can't go on anymore, everything is hopeless"
3. System detects crisis keywords: ["can't go on", "hopeless"]
4. System sends message to Gemini AI with crisis context
5. AI generates empathetic response with concern
6. System displays AI response
7. **System triggers crisis alert modal**
8. Modal displays:
   - National Suicide Prevention Lifeline: 988
   - Crisis Text Line: Text HOME to 741741
   - International resources
   - "Please reach out for professional help"
9. John can click to call or text
10. System logs crisis event (for admin monitoring)
11. Conversation continues with supportive AI responses

**Postconditions:** User receives immediate crisis resources and support

**Business Value:** Potentially life-saving intervention

---

### Scenario 3: Peer Matching and Connection

**Actors:** User A (Emma), User B (Lisa), Notification System

**Preconditions:** Both users have complete profiles and mood history

**Flow:**
1. Emma navigates to "Find Peers"
2. System calculates match scores:
   - Emma: Computer Science, Year 2, Average mood: 6.5
   - Lisa: Computer Science, Year 2, Average mood: 6.8
   - Match Score: 85% (Same university: 30%, Same year: 20%, Similar mood: 28%, Similar activity: 7%)
3. System displays Lisa's profile (anonymous preview)
4. Emma clicks "Connect"
5. System creates match request
6. System sends notification to Lisa
7. Lisa receives notification: "Emma wants to connect with you"
8. Lisa views Emma's profile
9. Lisa clicks "Accept"
10. System updates match status to "accepted"
11. System sends notification to Emma: "Lisa accepted your request"
12. Both users can now see each other in "My Matches"

**Postconditions:** Emma and Lisa are connected as peers

**Business Value:** Peer support network established

---

## Appendix B: Security Implementation Details

### B.1 Encryption Implementation

**Journal Entry Encryption (AES-256-GCM):**

```javascript
// Encryption Process
const crypto = require('crypto');
const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag.toString('hex')
  };
}

// Decryption Process
function decrypt(encryptedObj) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedObj.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

**Why AES-256-GCM?**
- **AES-256**: Industry-standard symmetric encryption with 256-bit key
- **GCM Mode**: Provides both confidentiality and authenticity
- **Authentication Tag**: Prevents tampering with encrypted data
- **IV (Initialization Vector)**: Ensures same plaintext produces different ciphertext

---

### B.2 Authentication Flow

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_mongodb_id",
    "email": "user@university.edu",
    "role": "user",
    "iat": 1700000000,
    "exp": 1700086400
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

**Token Lifecycle:**
1. User logs in via Firebase
2. Backend verifies Firebase token
3. Backend generates JWT with 24-hour expiration
4. Client stores JWT in localStorage
5. Client includes JWT in Authorization header for API requests
6. Backend middleware verifies JWT on each request
7. Token expires after 24 hours, user must re-login

---

### B.3 Crisis Keyword Detection

**Crisis Keywords List:**
```javascript
const crisisKeywords = [
  // Suicide indicators
  'suicide', 'kill myself', 'end my life', 'want to die',
  'better off dead', 'no reason to live', 'can\'t go on',
  
  // Self-harm indicators
  'self harm', 'cut myself', 'hurt myself', 'self-injury',
  
  // Severe distress
  'hopeless', 'worthless', 'no point', 'give up',
  'can\'t take it anymore', 'end it all'
];

function detectCrisis(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of crisisKeywords) {
    if (lowerMessage.includes(keyword)) {
      return {
        detected: true,
        keyword: keyword,
        severity: 'high'
      };
    }
  }
  
  return { detected: false };
}
```

**Crisis Response Protocol:**
1. Immediate detection during message processing
2. AI response includes empathetic concern
3. Crisis alert modal displayed to user
4. Event logged for admin monitoring
5. Resources provided: hotlines, text lines, emergency contacts
6. Conversation continues with supportive tone

---

## Appendix C: Performance Benchmarks

### C.1 Response Time Targets

| Operation | Target | Acceptable | Unacceptable |
|-----------|--------|------------|--------------|
| Page Load (First Paint) | < 1.5s | < 3s | > 3s |
| API Response (Simple GET) | < 200ms | < 500ms | > 500ms |
| API Response (Complex Query) | < 500ms | < 1s | > 1s |
| AI Chat Response | < 3s | < 5s | > 5s |
| Database Query | < 100ms | < 200ms | > 200ms |
| Image Load | < 1s | < 2s | > 2s |
| Form Submission | < 500ms | < 1s | > 1s |

### C.2 Load Testing Scenarios

**Scenario 1: Normal Load**
- 100 concurrent users
- 50 requests/second
- Expected: All responses < 500ms
- CPU usage < 50%
- Memory usage < 60%

**Scenario 2: Peak Load**
- 500 concurrent users
- 250 requests/second
- Expected: 95% responses < 1s
- CPU usage < 70%
- Memory usage < 80%

**Scenario 3: Stress Test**
- 1000 concurrent users
- 500 requests/second
- Expected: System remains stable
- Graceful degradation
- No data loss

---

## Appendix D: Database Schema Details

### D.1 User Collection

```javascript
{
  _id: ObjectId,
  firebaseUid: String (unique, indexed),
  email: String (unique, indexed),
  name: String,
  university: String (indexed),
  year: Number,
  bio: String,
  profilePicture: String (URL),
  createdAt: Date (indexed),
  lastActive: Date (indexed),
  settings: {
    notifications: {
      email: Boolean,
      push: Boolean,
      matches: Boolean,
      posts: Boolean
    },
    privacy: {
      profileVisible: Boolean,
      showInMatching: Boolean,
      showActiveStatus: Boolean
    }
  },
  role: String (enum: ['user', 'admin']),
  status: String (enum: ['active', 'suspended', 'deleted'])
}
```

**Indexes:**
- `firebaseUid`: Unique index for authentication lookup
- `email`: Unique index for user search
- `university`: Index for matching algorithm
- `createdAt`: Index for admin analytics
- `lastActive`: Index for active user queries

---

### D.2 MoodEntry Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  moodLevel: Number (1-10, required),
  journal: {
    iv: String,
    encryptedData: String,
    authTag: String
  },
  triggers: [String],
  activities: [String],
  sleepHours: Number,
  date: Date (indexed),
  createdAt: Date,
  aiInsights: String
}
```

**Indexes:**
- `userId`: Index for user mood history queries
- `date`: Index for date-range queries
- Compound index: `(userId, date)` for efficient user timeline queries

---

### D.3 Conversation Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  messages: [
    {
      role: String (enum: ['user', 'assistant']),
      content: String,
      timestamp: Date,
      crisisDetected: Boolean
    }
  ],
  crisisEvents: [
    {
      timestamp: Date,
      keyword: String,
      severity: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Appendix E: API Response Formats

### E.1 Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-11-21T12:00:00Z"
}
```

### E.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-11-21T12:00:00Z"
}
```

### E.3 Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

---

## Appendix F: Test Cases for Requirements

### Test Case Template

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Expected Result | Actual Result | Status |
|--------------|----------------|---------------|------------|-----------------|---------------|--------|

### Critical Test Cases

#### TC-001: User Registration with Valid Data
- **Requirement:** FR-UM-01
- **Priority:** High
- **Test Steps:**
  1. Navigate to registration page
  2. Enter valid email: test@university.edu
  3. Enter password: TestPass123
  4. Enter name: Test User
  5. Select university: State University
  6. Select year: 2
  7. Accept terms and conditions
  8. Click "Create Account"
- **Expected Result:** 
  - User account created successfully
  - JWT token generated
  - Redirected to dashboard
  - Welcome message displayed
- **Test Data:** Valid email, strong password, complete profile
- **Pass Criteria:** Account created in < 3 seconds

#### TC-002: Mood Entry with Journal Encryption
- **Requirement:** FR-MT-01, NFR-SEC-02
- **Priority:** Critical
- **Test Steps:**
  1. Login as registered user
  2. Navigate to Track Mood
  3. Select mood level: 7
  4. Enter journal: "Test journal entry for encryption"
  5. Select triggers: Academic Stress
  6. Select activities: Exercise
  7. Enter sleep hours: 8
  8. Click Save Entry
- **Expected Result:**
  - Journal encrypted with AES-256-GCM
  - Entry saved to database
  - Success message displayed
  - Entry appears in mood history with decrypted journal
- **Verification:** Check database - journal should be encrypted object {iv, encryptedData, authTag}
- **Pass Criteria:** Encryption/decryption successful, entry saved in < 2 seconds

#### TC-003: Crisis Keyword Detection
- **Requirement:** FR-AI-03, NFR-R-01
- **Priority:** Critical
- **Test Steps:**
  1. Login as registered user
  2. Navigate to AI Chat
  3. Send message: "I feel hopeless and want to end my life"
  4. Wait for AI response
- **Expected Result:**
  - Crisis keywords detected immediately
  - Crisis alert modal displayed
  - Hotline numbers shown (988, Crisis Text Line)
  - AI response shows concern and encourages help
  - Crisis event logged for admin
- **Verification:** Check conversations collection - crisisDetected flag should be true
- **Pass Criteria:** Detection in < 50ms, modal displayed, admin notified

#### TC-004: Peer Match Score Calculation
- **Requirement:** FR-PM-01
- **Priority:** Medium
- **Test Steps:**
  1. Create User A: State University, Year 2, Average mood: 6.5
  2. Create User B: State University, Year 2, Average mood: 6.8
  3. Login as User A
  4. Navigate to Find Peers
  5. View match suggestions
- **Expected Result:**
  - User B appears in suggestions
  - Match score calculated: ~85%
    - Same university: 30%
    - Same year: 20%
    - Similar mood: ~28%
    - Activity similarity: ~7%
- **Pass Criteria:** Match score accurate within 5%, displayed in < 500ms

#### TC-005: Anonymous Forum Posting
- **Requirement:** FR-CF-01, UC-44
- **Priority:** Medium
- **Test Steps:**
  1. Login as registered user
  2. Navigate to Community Forum
  3. Click Create Post
  4. Enter title: "Test Anonymous Post"
  5. Enter content: "Testing anonymous posting feature"
  6. Select tags: Anxiety
  7. Check "Post Anonymously"
  8. Click Submit
- **Expected Result:**
  - Post created successfully
  - Author shown as "Anonymous"
  - User identity not revealed in post
  - Post visible in forum
- **Verification:** Check database - anonymous flag should be true, author info protected
- **Pass Criteria:** Post created, identity protected

---

## Appendix G: Acceptance Criteria Checklist

### User Management Module
- [ ] Users can register with email/password
- [ ] Users can register with Google OAuth
- [ ] Email validation prevents invalid formats
- [ ] Password must be minimum 6 characters
- [ ] Duplicate emails are rejected
- [ ] Users can login with valid credentials
- [ ] Invalid credentials show appropriate error
- [ ] JWT token expires after 24 hours
- [ ] Users can update profile information
- [ ] Profile changes are validated
- [ ] Users can logout successfully
- [ ] Session is cleared on logout

### Mood Tracking Module
- [ ] Users can log mood level (1-10)
- [ ] Journal entries are encrypted with AES-256-GCM
- [ ] Encrypted journals are decrypted for viewing
- [ ] Only user can decrypt their own journals
- [ ] Users can select multiple triggers
- [ ] Users can select multiple activities
- [ ] Sleep hours accept decimal values (0-24)
- [ ] One mood entry per day per user
- [ ] Mood history displays all entries
- [ ] Mood statistics calculate correctly
- [ ] Average mood is accurate
- [ ] Mood trends are identified (improving/stable/declining)
- [ ] AI insights are generated (if 7+ entries)

### AI Chat Module
- [ ] Users can send messages to AI
- [ ] AI responds within 5 seconds
- [ ] Conversation history is maintained
- [ ] Crisis keywords are detected in real-time
- [ ] Crisis alert modal displays when keywords detected
- [ ] Hotline numbers are shown in crisis alert
- [ ] Crisis events are logged for admin
- [ ] Users can clear conversation history
- [ ] Empty messages are rejected
- [ ] Messages over 2000 characters are rejected
- [ ] Fallback response shown if AI unavailable

### Community Forum Module
- [ ] Users can create forum posts
- [ ] Users can post anonymously
- [ ] Posts display with title, content, tags
- [ ] Users can view all forum posts
- [ ] Posts are sorted by date/popularity
- [ ] Users can react to posts (supportive/helpful/relatable)
- [ ] Users can comment on posts
- [ ] Users can comment anonymously
- [ ] Users can filter posts by tags
- [ ] View count increments on post view

### Peer Matching Module
- [ ] Match scores are calculated correctly
- [ ] University match contributes 30%
- [ ] Year match contributes 20%
- [ ] Mood similarity contributes 30%
- [ ] Activity similarity contributes 20%
- [ ] Users can send match requests
- [ ] Target user receives notification
- [ ] Users can accept match requests
- [ ] Users can reject match requests
- [ ] Requester receives notification of response
- [ ] Users can view their accepted matches
- [ ] Existing matches are excluded from suggestions

### Admin Module
- [ ] Admins can view all users
- [ ] Admins can suspend user accounts
- [ ] Admins can delete user accounts
- [ ] Admins can view user details
- [ ] Admins can moderate forum content
- [ ] Admins can remove inappropriate posts
- [ ] Admins can view system analytics
- [ ] Admins can monitor crisis events
- [ ] Admins can generate reports
- [ ] Admins can manage admin accounts

---

## Appendix H: Compliance and Legal Requirements

### GDPR Compliance (EU Users)

#### Right to Access
- **Requirement:** Users can request all their personal data
- **Implementation:** Export user data API endpoint
- **Timeline:** Provide data within 30 days
- **Format:** JSON or CSV download

#### Right to Erasure (Right to be Forgotten)
- **Requirement:** Users can request account deletion
- **Implementation:** 
  - Delete user account from D1: Users
  - Delete all mood entries from D2
  - Delete all conversations from D3
  - Delete all forum posts (or anonymize)
  - Delete all matches from D5
  - Delete all notifications from D6
- **Timeline:** Complete deletion within 30 days
- **Verification:** Provide deletion confirmation

#### Right to Data Portability
- **Requirement:** Users can export their data in machine-readable format
- **Implementation:** Export API with JSON format
- **Data Included:** Profile, mood entries (decrypted), forum posts, matches

#### Right to Rectification
- **Requirement:** Users can correct inaccurate data
- **Implementation:** Profile edit functionality
- **Timeline:** Updates applied immediately

#### Consent Management
- **Requirement:** Explicit consent for data processing
- **Implementation:** 
  - Terms and conditions acceptance during registration
  - Privacy policy link
  - Cookie consent banner
  - Opt-in for email notifications

#### Data Breach Notification
- **Requirement:** Notify users within 72 hours of data breach
- **Implementation:** 
  - Incident response plan
  - Email notification system
  - Breach log maintenance

### HIPAA Considerations (US Healthcare)

**Note:** MindMate is NOT a covered entity under HIPAA as it does not provide medical treatment. However, best practices include:

- **Data Encryption:** All journal entries encrypted at rest
- **Access Controls:** Role-based access (user/admin)
- **Audit Logs:** Track access to sensitive data
- **Minimum Necessary:** Only collect required data
- **Business Associate Agreements:** With third-party services (Firebase, Gemini AI)

### Age Verification (COPPA Compliance)

- **Requirement:** Users must be 18+ years old
- **Implementation:** 
  - Terms and conditions state 18+ requirement
  - University email verification (implies 18+)
  - Age confirmation checkbox
- **Enforcement:** Account suspension if under 18 discovered

### Mental Health Disclaimers

#### Platform Limitations
```
IMPORTANT DISCLAIMER:
MindMate is NOT a substitute for professional mental health care.
This platform provides peer support and self-help tools only.
If you are experiencing a mental health crisis, please contact:
- Emergency Services: 911
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

MindMate does not provide:
- Medical diagnosis
- Treatment recommendations
- Professional therapy
- Emergency crisis intervention

By using this platform, you acknowledge that:
- You are 18 years or older
- You understand the limitations of this service
- You will seek professional help when needed
- You accept the Terms of Service and Privacy Policy
```

### Terms of Service Key Points

1. **Acceptable Use:** No harassment, hate speech, or harmful content
2. **User Responsibilities:** Accurate information, respectful behavior
3. **Platform Rights:** Content moderation, account suspension
4. **Limitation of Liability:** Platform not liable for user actions
5. **Intellectual Property:** User content ownership, platform license
6. **Termination:** Account deletion process
7. **Dispute Resolution:** Arbitration clause, governing law

### Privacy Policy Key Points

1. **Data Collection:** What data is collected and why
2. **Data Usage:** How data is used (mood tracking, matching, analytics)
3. **Data Sharing:** Third-party services (Firebase, Gemini AI)
4. **Data Security:** Encryption, access controls
5. **Data Retention:** How long data is stored
6. **User Rights:** Access, deletion, portability
7. **Cookies:** Usage and consent
8. **Updates:** Policy change notifications

---

## Appendix I: Accessibility Requirements (WCAG 2.1 Level AA)

### Perceivable

#### Text Alternatives
- [ ] All images have alt text
- [ ] Icons have aria-labels
- [ ] Form inputs have labels
- [ ] Error messages are descriptive

#### Adaptable Content
- [ ] Semantic HTML structure (header, nav, main, footer)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Responsive design for all screen sizes
- [ ] Content readable without CSS

#### Distinguishable
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Text resizable up to 200% without loss of functionality
- [ ] No information conveyed by color alone

### Operable

#### Keyboard Accessible
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Visible focus indicators
- [ ] Logical tab order

#### Enough Time
- [ ] No time limits on reading/interaction
- [ ] Auto-save for mood entries (every 30 seconds)
- [ ] Session timeout warning (before JWT expiration)

#### Seizures and Physical Reactions
- [ ] No flashing content
- [ ] No content flashing more than 3 times per second

#### Navigable
- [ ] Skip to main content link
- [ ] Page titles describe purpose
- [ ] Link text describes destination
- [ ] Multiple ways to find pages (navigation, search)

### Understandable

#### Readable
- [ ] Language of page specified (lang="en")
- [ ] Clear, simple language
- [ ] Definitions for jargon/abbreviations

#### Predictable
- [ ] Consistent navigation across pages
- [ ] Consistent identification of components
- [ ] No unexpected context changes

#### Input Assistance
- [ ] Form validation with clear error messages
- [ ] Error prevention (confirmation for destructive actions)
- [ ] Labels and instructions for inputs
- [ ] Suggestions for fixing errors

### Robust

#### Compatible
- [ ] Valid HTML
- [ ] ARIA attributes used correctly
- [ ] Compatible with assistive technologies
- [ ] Works with screen readers (NVDA, JAWS, VoiceOver)

### Accessibility Testing Checklist

- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test with browser zoom at 200%
- [ ] Test color contrast with tools (WebAIM Contrast Checker)
- [ ] Test with automated tools (axe DevTools, WAVE)
- [ ] Test with real users with disabilities

---

**Document Control:**
- **Created by:** MindMate Development Team
- **Approved by:** Project Stakeholders
- **Next Review Date:** December 21, 2025
- **Version History:**
  - v1.0 (Nov 21, 2025): Initial release with comprehensive requirements
  - v1.1 (Nov 21, 2025): Added test cases, acceptance criteria, compliance requirements, and accessibility standards
