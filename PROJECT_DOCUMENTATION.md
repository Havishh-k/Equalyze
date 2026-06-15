# 📘 Shiv Genie Classes — Complete Project Documentation

> **Project Name:** Shiv Genie Classes — AI-Powered Learning Platform  
> **Version:** Production (v1.0+)  
> **Development Period:** January 23, 2026 — Present  
> **Total Commits:** 281+  
> **Codebase Size:** ~62,500 lines across 325 source files  
> **Architecture:** Full-Stack MERN (MongoDB, Express, React, Node.js) + PWA  
> **License:** Internal Use — Shiv Genie Classes

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack — Complete Breakdown](#4-technology-stack--complete-breakdown)
5. [Backend — Deep Dive](#5-backend--deep-dive)
6. [Frontend — Deep Dive](#6-frontend--deep-dive)
7. [AI Integration — Google Gemini](#7-ai-integration--google-gemini)
8. [Database Design](#8-database-design)
9. [Authentication & Security](#9-authentication--security)
10. [Feature Modules](#10-feature-modules)
11. [Deployment & DevOps](#11-deployment--devops)
12. [Project Structure — Full Directory Tree](#12-project-structure--full-directory-tree)
13. [Libraries & Dependencies — Complete List](#13-libraries--dependencies--complete-list)
14. [Development Process — How the Project Was Built](#14-development-process--how-the-project-was-built)
15. [API Endpoints](#15-api-endpoints)
16. [Environment Configuration](#16-environment-configuration)
17. [Performance Optimizations](#17-performance-optimizations)
18. [Future Roadmap](#18-future-roadmap)

---

## 1. Executive Summary

**Shiv Genie Classes** is a comprehensive, AI-powered educational management platform built for a coaching institute. It serves **five distinct user roles** — Students, Teachers, Parents, Staff, and Administrators — through a unified web application with Progressive Web App (PWA) capabilities.

The platform integrates **Google Gemini AI** for instant doubt-clearing with support for both text and image-based questions, combined with a full-featured academic management system covering lecture scheduling, examinations, fee management, admissions, attendance tracking, and parent transparency.

### Key Metrics

| Metric | Value |
|---|---|
| Total Source Files | 325 |
| Backend Files (JS) | 131 files — 23,825 lines |
| Frontend Files (JSX/JS/CSS) | 196 files — 38,814 lines |
| MongoDB Models | 35 schemas |
| API Controllers | 28 controllers |
| API Route Files | 26 route modules |
| Backend Services | 24 service modules |
| Frontend Pages | 50+ page components |
| Frontend Components | 60+ reusable components |
| Git Commits | 281+ |
| Development Duration | ~5 months (Jan–Jun 2026) |

---

## 2. Problem Statement & Motivation

### Core Challenges Addressed

1. **24/7 Doubt Resolution** — Students preparing for HSC, MHT-CET, JEE, and NEET exams need instant academic support outside class hours. Teachers cannot provide round-the-clock assistance.

2. **Operational Management** — Coaching institutes need unified systems for managing lectures, attendance, batches, exams, fees, admissions, and enquiries — replacing fragmented spreadsheets and manual tracking.

3. **Parent Transparency** — Parents need real-time visibility into their child's academic progress, attendance, fee status, and exam performance.

4. **Scalability at Zero Cost** — The platform needed to operate on free-tier infrastructure for initial deployment, scaling organically as the institute grows.

### Target Users

| Role | Description |
|---|---|
| **Students** | 11th/12th Science stream students (JEE, NEET, MHT-CET aspirants) |
| **Teachers** | Subject faculty managing lectures and availability |
| **Parents** | Guardians linked to student accounts for monitoring |
| **Staff** | Front-desk and administrative staff managing enquiries and fees |
| **Admins** | Center heads with full system access and analytics |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│   React 19 + Vite 7 + TailwindCSS 4 + Framer Motion            │
│   PWA (Service Worker) │ Role-Based Layouts                      │
│   Deployed on: Vercel                                            │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTPS / REST API (v1/)
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
│                                                                  │
│   Node.js + Express 4.18                                         │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐        │
│   │  Middleware  │  │  Controllers │  │   Services     │        │
│   │ • JWT Auth   │  │  (28 files)  │  │  (24 modules)  │        │
│   │ • RBAC       │  │              │  │  • Gemini AI   │        │
│   │ • Rate Limit │  │              │  │  • Scheduler   │        │
│   │ • Helmet     │  │              │  │  • Email       │        │
│   │ • XSS Clean  │  │              │  │  • Biometric   │        │
│   │ • Mongo      │  │              │  │  • WhatsApp    │        │
│   │   Sanitize   │  │              │  │  • Blob Store  │        │
│   └─────────────┘  └──────────────┘  └────────────────┘        │
│   Deployed on: Render                                            │
└───────────────────────────────┬──────────────────────────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   MongoDB Atlas  │  │  Google Gemini   │  │  Vercel Blob     │
│   (35 schemas)   │  │  AI API          │  │  Storage         │
│                  │  │  (gemini-2.5-    │  │  (File Uploads)  │
│                  │  │   flash)         │  │                  │
└─────────────────┘  └──────────────────┘  └──────────────────┘
```

### Architecture Highlights

- **RESTful API** with versioned endpoints (`/v1/`)
- **Role-Based Access Control (RBAC)** — 5 distinct roles with granular permissions
- **Multi-tenant Branch Support** — Branch-aware routing and data isolation
- **Smart Caching** — AI response caching to minimize API costs
- **PWA Support** — Installable on mobile devices with offline-first capabilities
- **Biometric Integration** — ICLOCK protocol support for attendance hardware

---

## 4. Technology Stack — Complete Breakdown

### 4.1 Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | UI component library |
| **Vite** | 7.2.4 | Build tool & dev server |
| **React Router DOM** | 7.12.0 | Client-side routing |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Framer Motion** | 12.34.0 | Animations & transitions |
| **Axios** | 1.13.2 | HTTP client for API calls |
| **Recharts** | 3.7.0 | Data visualization charts |
| **Lucide React** | 0.562.0 | Icon system |
| **React Hook Form** | 7.71.1 | Form state management |
| **React Hot Toast** | 2.6.0 | Notification toasts |
| **React Toastify** | 11.0.5 | Additional toast notifications |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **KaTeX** | 0.16.27 | LaTeX/math equation rendering |
| **Rehype KaTeX** | 7.0.1 | KaTeX plugin for rehype |
| **Remark Math** | 6.0.0 | Math plugin for remark |
| **jsPDF** | 4.0.0 | Client-side PDF generation |
| **jsPDF AutoTable** | 5.0.7 | PDF table generation |
| **XLSX (SheetJS)** | 0.18.5 | Excel file import/export |
| **Tesseract.js** | 7.0.0 | OCR — image-to-text extraction |
| **TanStack React Table** | 8.21.3 | Headless table management |
| **Class Variance Authority** | 0.7.1 | Component variant utilities |
| **clsx** | 2.1.1 | Conditional class names |
| **Tailwind Merge** | 3.4.0 | Smart Tailwind class merging |
| **Tailwind Animate** | 1.0.7 | Animation utilities |
| **Vite Plugin PWA** | 1.2.0 | Progressive Web App support |

### 4.2 Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.18.2 | Web application framework |
| **Mongoose** | 8.0.3 | MongoDB ODM |
| **JSON Web Token** | 9.0.2 | Authentication tokens |
| **bcrypt** | 5.1.1 | Password hashing |
| **bcryptjs** | 3.0.3 | Pure JS bcrypt fallback |
| **@google/generative-ai** | 0.24.1 | Gemini AI SDK |
| **Helmet** | 7.1.0 | HTTP security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **express-rate-limit** | 7.1.5 | Request rate limiting |
| **express-validator** | 7.3.1 | Input validation |
| **express-mongo-sanitize** | 2.2.0 | NoSQL injection prevention |
| **xss-clean** | 0.1.4 | XSS attack prevention |
| **Multer** | 2.0.2 | File upload handling |
| **@vercel/blob** | 2.3.3 | Cloud blob storage |
| **Nodemailer** | 7.0.12 | Email sending |
| **dotenv** | 16.3.1 | Environment variable management |
| **node-zklib** | 1.3.0 | ZK biometric device SDK |
| **zklib** | 0.2.11 | ZK fingerprint device library |
| **Nodemon** | 3.0.2 | Development auto-restart |

### 4.3 Database

| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database (free tier) |
| **Mongoose ODM** | Schema validation, middleware, query building |

### 4.4 External Services & APIs

| Service | Purpose |
|---|---|
| **Google Gemini API** (gemini-2.5-flash) | AI-powered question answering |
| **Vercel** | Frontend hosting & CDN |
| **Render** | Backend hosting |
| **Vercel Blob Storage** | File uploads (lecture sheets) |
| **Twilio** (planned) | WhatsApp notifications |
| **Nodemailer / SMTP** | Email notifications |

### 4.5 DevOps & Tooling

| Tool | Purpose |
|---|---|
| **Git + GitHub** | Version control |
| **GitHub Actions** | CI/CD pipelines |
| **Vercel** (auto-deploy) | Frontend CI/CD |
| **Render** (auto-deploy + deploy hooks) | Backend CI/CD |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing pipeline |

---

## 5. Backend — Deep Dive

### 5.1 Entry Point & Server Setup

The application bootstraps in two stages:

1. **`server.js`** — Loads environment variables, connects to MongoDB, starts the Express server on port 5001.
2. **`app.js`** — Configures all middleware, mounts route handlers, and sets up security layers.

### 5.2 Middleware Pipeline

```
Request → Trust Proxy → Helmet → CORS → JSON Parser → Mongo Sanitize → XSS Clean → Rate Limiter → Auth → Route Handler
```

| Middleware | Function |
|---|---|
| `trust proxy` | Required for Render's reverse proxy |
| `helmet()` | Sets security HTTP headers (CSP, HSTS, etc.) |
| `cors()` | Allows cross-origin requests from frontend |
| `express.json({ limit: '10mb' })` | Parses JSON with increased limit for bulk uploads |
| `mongoSanitize()` | Strips `$` and `.` from inputs to prevent NoSQL injection |
| `xss()` | Sanitizes user input against XSS attacks |
| Global rate limiter | 100 requests per 10 minutes per IP |
| Auth rate limiter | 50 requests per 15 minutes for login endpoints |
| Biometric bypass | Exempts biometric device heartbeats from rate limiting |

### 5.3 Controllers (28 modules)

| Controller | Lines | Responsibility |
|---|---|---|
| `exam.controller.js` | ~1,600 | Full exam lifecycle — create, schedule, attempt, grade, analytics |
| `lecture.controller.js` | ~1,400 | Lecture CRUD, status tracking, batch-wise numbering |
| `admin.controller.js` | ~1,100 | User management, system administration |
| `quiz.controller.js` | ~1,200 | Quiz creation, AI-generated questions, attempt tracking |
| `admission.controller.js` | ~900 | Student admission lifecycle, installment plans |
| `batch.controller.js` | ~700 | Batch creation, student assignment, transfers |
| `progress.controller.js` | ~750 | Chapter mastery tracking, syllabus debt |
| `enquiry.controller.js` | ~600 | Lead management, follow-ups, conversion |
| `chapterbank.controller.js` | ~550 | Question bank management, AI generation |
| `lectureContent.controller.js` | ~500 | Lecture sheets, MCQ banks |
| `offlineExam.controller.js` | ~500 | Offline exam result recording |
| `attendance.controller.js` | ~450 | Daily attendance entry and tracking |
| `fees.controller.js` | ~430 | Fee collection, receipts, defaulters |
| `settings.controller.js` | ~430 | System config, receipt templates |
| `teacher.controller.js` | ~400 | Teacher CRUD, assignment |
| `parentTransparency.controller.js` | ~380 | Parent-facing data aggregation |
| `studentTransparency.controller.js` | ~370 | Student transparency views |
| `scheduler.controller.js` | ~370 | Smart lecture scheduling engine |
| `stats.controller.js` | ~320 | Dashboard analytics, KPI computation |
| `auth.controller.js` | ~220 | Registration, login, password management |
| `teacherAvailability.controller.js` | ~230 | Teacher slot management |
| `audit.controller.js` | ~200 | Audit log viewing and filtering |
| `question.controller.js` | ~180 | AI Q&A with caching |
| `biometric.controller.js` | ~140 | ICLOCK protocol handler |
| `staff.controller.js` | ~170 | Staff account management |
| `subject.controller.js` | ~100 | Subject CRUD |
| `onboarding.controller.js` | ~80 | Student onboarding wizard |
| `adminNotification.controller.js` | ~65 | System notifications |

### 5.4 Services (24 modules)

| Service | Purpose |
|---|---|
| `geminiService.js` | Google Gemini AI integration (text + vision) |
| `smartScheduler.service.js` | Collision-aware lecture scheduling engine |
| `collisionDetector.service.js` | Teacher/batch/room conflict detection |
| `studentTransparency.service.js` | Aggregated student performance data |
| `studentCreation.service.js` | Atomic student account provisioning |
| `admissionFees.service.js` | Fee calculation with installment logic |
| `admissionNumber.service.js` | Auto-incrementing admission numbers |
| `admissionReceipt.service.js` | PDF receipt generation data |
| `attendanceAggregation.service.js` | Attendance statistics computation |
| `biometric.service.js` | ZK biometric device communication |
| `blobStorage.service.js` | Vercel Blob file operations |
| `configCache.service.js` | System config caching layer |
| `deviceStatus.service.js` | Biometric device health monitoring |
| `email.service.js` | Transactional email delivery |
| `enquiryDashboard.service.js` | Enquiry funnel analytics |
| `feeDefaulters.service.js` | Fee defaulter identification logic |
| `feeReceipt.service.js` | Fee receipt data formatting |
| `offlineExam.service.js` | Offline exam result processing |
| `parentLink.service.js` | Parent-student account linking |
| `punchHistory.service.js` | Biometric punch record processing |
| `receiptPayload.service.js` | Receipt template data assembly |
| `syllabusDebt.service.js` | Syllabus coverage gap analysis |
| `teacherAvailability.service.js` | Teacher slot management logic |
| `whatsapp.service.js` | WhatsApp notification (Twilio) |

### 5.5 Utilities

| Utility | Purpose |
|---|---|
| `auditLogger.js` | Structured audit trail for critical operations |
| `enquiryLegacySync.js` | Legacy data migration helpers |
| `entranceAccess.js` | Branch-based entrance control |
| `examTypeFilter.js` | Exam-type aware query filtering |
| `istSessionDate.js` | IST timezone date handling |

---

## 6. Frontend — Deep Dive

### 6.1 Application Structure

The frontend is a **React 19 SPA** built with Vite 7, featuring role-based routing and layouts.

#### Entry Point

- **`main.jsx`** — Renders `<App />` inside `<StrictMode>`, registers PWA service worker, and applies `save-data` optimizations for low-end devices.
- **`App.jsx`** (~700 lines) — Central routing hub with React Router, `AuthContext` provider, and role-based route guards.

### 6.2 Role-Based Layout System

Each user role has a dedicated layout with custom navigation:

| Role | Layout | Navigation |
|---|---|---|
| **Admin** | `AdminLayout.jsx` | Sidebar + Header |
| **Teacher** | `TeacherLayout.jsx` | `TeacherBottomNav.jsx` (mobile) |
| **Student** | `Layout.jsx` | `BottomNav.jsx` (mobile) |
| **Parent** | `ParentLayout.jsx` | `ParentBottomNav.jsx` (mobile) |
| **Staff** | `StaffLayout.jsx` | `StaffBottomNav.jsx` (mobile) |

#### Route Guards

- `ProtectedRoute.jsx` — Requires authentication
- `AdminRoute.jsx` — Requires admin role
- `TeacherRoute.jsx` — Requires teacher role
- `StaffRoute.jsx` — Requires staff role
- `ParentRoute.jsx` — Requires parent role

### 6.3 Page Components by Role

#### Admin Pages (20+ pages)

| Page | Lines | Description |
|---|---|---|
| `ScheduleExam.jsx` | ~1,900 | Full exam scheduling with question selection |
| `SyllabusMatrix.jsx` | ~1,700 | Cross-batch syllabus coverage grid |
| `Students.jsx` | ~1,500 | Student management with bulk operations |
| `Teachers.jsx` | ~1,400 | Teacher management, assignment, payments |
| `DailyPlanner.jsx` | ~1,700 | Day-view lecture planning interface |
| `LectureList.jsx` | ~1,100 | Lecture tracking and status management |
| `LectureScheduler.jsx` | ~850 | Smart scheduling with collision detection |
| `CreateBatch.jsx` | ~700 | Batch creation wizard |
| `BatchDetail.jsx` | ~950 | Individual batch management |
| `ExamList.jsx` | ~630 | Exam management and analytics |
| `BiometricDashboard.jsx` | ~600 | Biometric device monitoring |
| `StaffList.jsx` | ~380 | Staff account management |
| `AttendanceEntry.jsx` | ~400 | Daily attendance recording |
| `AdminDashboard.jsx` | ~200 | Overview with KPIs and charts |
| `Settings/` | Dir | System configuration editor |
| `QuestionBank/` | Dir | AI question bank management |
| `StudentOnboarding/` | Dir | Multi-step admission wizard |
| `lecture-content/` | Dir | Lecture sheet and MCQ management |
| `offline-exam/` | Dir | Offline exam result entry |
| `studentProfile/` | Dir | Individual student deep-dive |

#### Student Pages

| Page | Description |
|---|---|
| `Dashboard.jsx` | Home screen with progress, recent activity |
| `AskQuestion.jsx` | AI-powered Q&A with image upload |
| `TakeExam.jsx` | Live exam interface with timer |
| `TakeQuiz.jsx` | Interactive quiz with instant feedback |
| `TakeChapterQuiz.jsx` | Chapter-wise practice quizzes |
| `ExamResult.jsx` | Detailed exam result analysis |
| `QuizResult.jsx` | Quiz result with answer review |
| `QuizList.jsx` | Browse available quizzes |
| `StudentExamList.jsx` | Upcoming and past exams |
| `History.jsx` | Q&A history browser |
| `QuizHistory.jsx` | Past quiz attempts |
| `OfflineExamResults.jsx` | View offline exam scores |
| `practice/` | Mastery-based practice system |
| `student/transparency/` | Academic transparency portal |

#### Teacher Pages

| Page | Description |
|---|---|
| `TeacherDashboard.jsx` | Overview of assigned lectures |
| `AssignedChapters.jsx` | Chapter assignments and progress |
| `AvailabilityPage.jsx` | Weekly availability slot management |
| `TeacherPayments.jsx` | Payment history and tracking |

#### Parent Pages

| Page | Description |
|---|---|
| `ParentDashboard.jsx` | Child's academic overview |
| `ParentContact.jsx` | Contact information management |
| `ParentNotifications.jsx` | System notifications |
| `ParentOfflineExamResults.jsx` | Child's offline exam results |

#### Staff Pages

| Page | Description |
|---|---|
| `StaffDashboard.jsx` | Enquiry and fee collection overview |
| `EnquiryList.jsx` | Lead/enquiry management pipeline |
| `EnquiryDetail.jsx` | Individual enquiry deep-dive |
| `FeeCollection.jsx` | Fee collection interface |
| `FeeHistory.jsx` | Payment history and receipts |

### 6.4 Reusable Component Library

#### UI Components
- `GlassCard.jsx` — Glassmorphism card container
- `BottomSheet.jsx` — Mobile bottom sheet modal
- `ResponsiveTable.jsx` — Adaptive table for mobile/desktop
- `Button.jsx` — Styled button with variants
- `Input.jsx` — Form input with validation
- `LatexRenderer.jsx` — KaTeX math equation display
- `BatchSelector.jsx` — Multi-batch selection widget
- `PageTransition.jsx` — Framer Motion page transitions
- `NotificationBell.jsx` — Real-time notification indicator

#### Admin Components
- `RollCallTable.jsx` — Interactive attendance grid
- `ActivityFeed.jsx` — Real-time activity timeline
- `BranchComparison.jsx` — Multi-branch analytics
- `GrowthMetrics.jsx` — Enrollment growth charts
- `PerformerCards.jsx` — Top/bottom performer highlights
- `QuickActions.jsx` — Admin shortcut buttons
- `SubjectPerformance.jsx` — Subject-wise analytics
- `CreateStaffModal.jsx` / `StaffEditModal.jsx` — Staff CRUD modals

#### Staff Components
- `EnquiryFormModal.jsx` — Full enquiry creation form
- `ConvertToStudentWizard.jsx` — Enquiry-to-student conversion
- `FeeCollectionModal.jsx` — Fee payment processing
- `FeeHistoryModal.jsx` — Payment history viewer
- `FollowUpModal.jsx` — Follow-up scheduling

#### Scheduler Components
- `CollisionWarnings.jsx` — Schedule conflict display
- `CoverageSummary.jsx` — Syllabus coverage overview
- `TeacherUtilization.jsx` — Teacher workload visualization
- `UnschedulableItems.jsx` — Unresolvable scheduling conflicts

#### Practice Components
- `PatternSelector.jsx` — Question pattern selection
- `ScopeSelector.jsx` — Subject/chapter scope picker
- `Breadcrumb.jsx` — Navigation breadcrumb trail
- `ExamInfoModal.jsx` — Exam details popup

#### Student Components
- `ChapterProgressBar.jsx` — Chapter mastery progress
- `MCQRunner.jsx` — Interactive MCQ quiz engine
- `TransparencyCard.jsx` — Academic metric display card

### 6.5 Custom Hooks

| Hook | Purpose |
|---|---|
| `useBasePath.js` | Computes role-based URL prefix |
| `useDebouncedValue.js` | Input debouncing for search |
| `useHeadroom.js` | Auto-hide header on scroll |
| `useIsMobile.js` | Responsive breakpoint detection |
| `useReceiptTemplate.js` | Dynamic receipt template loading |
| `useTransparencyApiPrefix.js` | Role-aware API path resolution |

### 6.6 State Management

- **`AuthContext.jsx`** — Global authentication state (user, token, role) via React Context API
- **`ParentChildContext.jsx`** — Parent-child relationship context for linked student selection
- **React State** — Component-level state via `useState` / `useReducer` (no Redux)

### 6.7 Design System

#### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `primary-500` | `#219ebc` | Main brand color |
| `primary-600` | `#1c829e` | Hover states |
| `primary-700` | `#15657b` | Active/pressed |
| `primary-50` | `#eef8fb` | Light backgrounds |
| `primary-950` | `#0b2d39` | Dark accents |

#### Custom Animations

- **Blob animation** — Floating background effect (10s infinite loop)
- **Page transitions** — Framer Motion fade/slide animations
- **Safe area utilities** — `pb-safe`, `pt-safe` for notched mobile devices

#### Build Optimizations (Vite)

Code splitting with manual chunks:
- `vendor` — react, react-dom, react-router-dom
- `ui` — lucide-react, react-hot-toast
- `charts` — recharts
- `pdf` — jspdf, jspdf-autotable
- `excel` — xlsx
- `ocr` — tesseract.js

---

## 7. AI Integration — Google Gemini

### Configuration

```javascript
Model: gemini-2.5-flash
Temperature: 0.7
Max Output Tokens: 2,048
Safety Settings: BLOCK_MEDIUM_AND_ABOVE (all categories)
```

### Capabilities

1. **Text-Only Q&A** — Students type questions with subject/exam context
2. **Image + Text Q&A** — Students upload photos of problems (diagrams, equations) alongside optional text
3. **Context-Aware Responses** — Prompts include exam type (JEE/NEET/MHT-CET), subject, and class level
4. **Structured Output** — Answers formatted as: Given → Concept → Solution → Final Answer
5. **LaTeX Support** — Mathematical equations rendered with `$` (inline) and `$$` (block)

### AI Question Generation

Beyond Q&A, Gemini is also used to:
- **Auto-generate quiz questions** from chapter content
- **Create chapter-wise MCQs** for practice modules
- **Generate exam questions** based on topic selection

### Smart Caching Strategy

To minimize API costs:

1. Normalize the question (lowercase, trim whitespace)
2. Generate a cache key: `hash(question + subject + examType + class)`
3. Check `CachedAnswer` collection in MongoDB
4. If cache hit → return stored answer (zero API cost)
5. If cache miss → call Gemini → store result → return

> This approach saves an estimated **90% of API calls** for common repetitive questions.

---

## 8. Database Design

### MongoDB Collections (35 Schemas)

#### Core Academic

| Model | Description |
|---|---|
| `User.js` | Users with roles (student/teacher/admin/staff/parent), credentials, profile, linked students |
| `Subject.js` | Academic subjects (Physics, Chemistry, Biology, Mathematics) |
| `Batch.js` | Student batches with subject assignments, schedules, branch data |
| `Lecture.js` | Scheduled lectures with batch, teacher, chapter, status tracking |
| `ChapterBank.js` | Master chapter repository with hierarchical content |
| `ChapterProgress.js` | Per-student chapter completion tracking |

#### Examinations & Quizzes

| Model | Description |
|---|---|
| `Exam.js` | Exam configuration, question pools, scheduling |
| `ExamAttempt.js` | Individual student exam submissions and scores |
| `Quiz.js` | Quiz configuration with AI-generated options |
| `QuizAttempt.js` | Student quiz submissions and analytics |
| `ChapterTestBank.js` | Chapter-level test question repository |
| `ChapterTestAttempt.js` | Chapter test submission records |
| `OfflineExam.js` | Offline/paper exam metadata |
| `OfflineExamResult.js` | Manually entered offline exam scores |

#### Question & Mastery System

| Model | Description |
|---|---|
| `Question.js` | Student-asked questions with AI answers |
| `CachedAnswer.js` | AI response cache for cost optimization |
| `LectureMCQBank.js` | Per-lecture MCQ question bank |
| `LectureMCQAttempt.js` | Student MCQ attempt records |
| `MasteryProgress.js` | Spaced repetition mastery tracking |

#### Administrative

| Model | Description |
|---|---|
| `Admission.js` | Student admission lifecycle |
| `AdmissionPayment.js` | Admission fee payment records |
| `FeePayment.js` | Recurring fee payment tracking |
| `Enquiry.js` | Prospective student enquiries with funnel stage |
| `Attendance.js` | Daily attendance records |
| `BatchTransfer.js` | Student batch transfer history |

#### Content & Communication

| Model | Description |
|---|---|
| `LectureSheet.js` | Uploaded lecture materials (PDFs, notes) |
| `DocumentTemplate.js` | Receipt and document templates |
| `AdminNotification.js` | System-wide announcements |
| `Feedback.js` | Student feedback submissions |
| `ParentQuery.js` | Parent-initiated queries |

#### System & Audit

| Model | Description |
|---|---|
| `AuditLog.js` | Immutable audit trail for critical operations |
| `SystemConfig.js` | Dynamic system configuration (fee packages, receipt templates) |
| `OnboardingSession.js` | Multi-step onboarding state persistence |
| `Punch.js` | Biometric punch/attendance records |
| `TeacherAvailability.js` | Teacher weekly availability slots |

---

## 9. Authentication & Security

### Authentication Flow

1. **Registration** — Student/Teacher accounts created by admin with hashed passwords (bcrypt)
2. **Login** — Email + password verification → JWT token issued
3. **Token Validation** — Bearer token in `Authorization` header → decoded → user loaded from DB
4. **Account Status** — Deactivated accounts are rejected even with valid tokens

### Role-Based Access Control (RBAC)

```
protect → [roleGuard] → controller

Middleware chain:
├── protect         — Validates JWT, loads user
├── adminOnly       — Requires role === 'admin'
├── teacherOnly     — Requires role === 'teacher'
├── staffOnly       — Requires role === 'staff'
├── studentOnly     — Requires role === 'student'
├── parentOnly      — Requires role === 'parent'
└── requireLinkedStudent — Validates parent-student link
```

### Security Layers

| Layer | Implementation |
|---|---|
| **Password Hashing** | bcrypt with salt rounds |
| **JWT Tokens** | RS256 signed, server-validated |
| **HTTP Security Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| **Rate Limiting** | 100 req/10min (global), 50 req/15min (auth) |
| **NoSQL Injection Prevention** | express-mongo-sanitize strips `$` operators |
| **XSS Prevention** | xss-clean sanitizes HTML in inputs |
| **Input Validation** | express-validator for request body/params |
| **CORS** | Configured for specific frontend origin |
| **Proxy Trust** | `trust proxy: 1` for Render's reverse proxy |

---

## 10. Feature Modules

### 10.1 AI-Powered Q&A Engine
- Text and image-based question support
- Subject and exam-type contextual responses
- LaTeX/KaTeX mathematical rendering
- Response caching for cost optimization
- Question history with search

### 10.2 Examination System
- **Online Exams** — Scheduled, timed, auto-graded
- **Quizzes** — Chapter-wise with AI-generated questions
- **Chapter Tests** — Mastery-based practice tests
- **Offline Exams** — Paper exam result recording
- **Analytics** — Per-student, per-batch, per-subject performance

### 10.3 Lecture Management
- Smart scheduling with collision detection (teacher, batch, room)
- Per-batch lecture numbering (L1, L2, L3...)
- Status tracking (scheduled → completed → reviewed)
- Lecture sheet uploads (PDF, images)
- Per-lecture MCQ banks
- Syllabus coverage matrix
- Daily planner view

### 10.4 Attendance & Biometric
- Manual attendance entry interface
- ICLOCK protocol support for ZK biometric devices (TeamOffice Z200BW)
- Automated punch recording
- Attendance aggregation and reporting
- Branch-aware device mapping

### 10.5 Fee & Admission Management
- Multi-installment fee plans
- Admission lifecycle (enquiry → admission → enrolled)
- PDF receipt generation
- Fee defaulter identification
- Admission number auto-generation
- Payment history with filtering

### 10.6 Enquiry Management (CRM)
- Lead capture and tracking
- Funnel stages (New → Contacted → Interested → Converted)
- Follow-up scheduling
- Enquiry-to-student conversion wizard
- Staff-assigned lead management

### 10.7 Parent Transparency Portal
- Linked student accounts
- Academic progress dashboards
- Attendance visibility
- Fee status monitoring
- Exam and quiz performance
- Communication channel (parent queries)

### 10.8 Teacher Portal
- Assigned chapter tracking
- Weekly availability management
- Payment/compensation history
- Lecture status updates
- Dashboard with workload overview

### 10.9 Practice & Mastery System
- Subject → Chapter → Topic drill-down
- Mastery-based progression tracking
- Attempt history with analytics
- Pattern-based question selection
- Scope-based practice sessions

### 10.10 Admin Analytics Dashboard
- Enrollment growth metrics
- Branch comparison analytics
- Top/bottom performer identification
- Subject-wise performance breakdown
- Activity feed (real-time system events)
- Quick action shortcuts

---

## 11. Deployment & DevOps

### Hosting Architecture

| Component | Platform | Plan |
|---|---|---|
| Frontend | **Vercel** | Free tier |
| Backend API | **Render** | Free/Starter tier |
| Database | **MongoDB Atlas** | Free tier (512 MB) |
| File Storage | **Vercel Blob** | Included with Vercel |
| AI API | **Google Gemini** | Free tier (60 req/min) |

### CI/CD Pipeline

#### Frontend (Vercel)
- Auto-deploys from `main` branch via Vercel Git integration
- SPA rewrites configured via `vercel.json`
- Build command: `vite build`

#### Backend (Render)
- Auto-deploys from `main` branch
- Root directory: `backend`
- Backup: GitHub Actions deploy hook (`render-deploy.yml`)
- Manual deploy available via Render dashboard

#### Branch Strategy

```
dev (development) ──PR──▶ main (production)
                          ├── Vercel auto-deploy (frontend)
                          └── Render auto-deploy (backend)
```

### GitHub Actions Workflows

1. **`deploy.yml`** — Automated merge from `dev` to `main` after push
2. **`render-deploy.yml`** — Trigger Render deploy hook as backup

---

## 12. Project Structure — Full Directory Tree

```
Shiv_CDC_AI_app/
├── .github/
│   └── workflows/
│       ├── deploy.yml                    # Auto-merge dev → main
│       └── render-deploy.yml             # Render deploy hook trigger
├── backend/
│   ├── .env.example                      # Environment variable template
│   ├── package.json                      # Backend dependencies
│   └── src/
│       ├── server.js                     # Entry point — DB connect + listen
│       ├── app.js                        # Express app — middleware + routes
│       ├── config/
│       │   ├── db.js                     # MongoDB connection
│       │   └── branchTravel.js           # Branch routing config
│       ├── constants/
│       │   ├── auditConstants.js         # Audit event types
│       │   └── feePackages.js            # Fee structure definitions
│       ├── controllers/                  # 28 controller files
│       │   ├── admin.controller.js
│       │   ├── admission.controller.js
│       │   ├── attendance.controller.js
│       │   ├── audit.controller.js
│       │   ├── auth.controller.js
│       │   ├── batch.controller.js
│       │   ├── biometric.controller.js
│       │   ├── chapterbank.controller.js
│       │   ├── enquiry.controller.js
│       │   ├── exam.controller.js
│       │   ├── fees.controller.js
│       │   ├── lecture.controller.js
│       │   ├── lectureContent.controller.js
│       │   ├── offlineExam.controller.js
│       │   ├── onboarding.controller.js
│       │   ├── parentTransparency.controller.js
│       │   ├── progress.controller.js
│       │   ├── question.controller.js
│       │   ├── quiz.controller.js
│       │   ├── scheduler.controller.js
│       │   ├── settings.controller.js
│       │   ├── staff.controller.js
│       │   ├── stats.controller.js
│       │   ├── studentTransparency.controller.js
│       │   ├── subject.controller.js
│       │   ├── teacher.controller.js
│       │   ├── teacherAvailability.controller.js
│       │   └── adminNotification.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js         # JWT + RBAC (5 roles)
│       │   ├── branchGuard.js            # Branch-level access control
│       │   ├── permissions.js            # Granular permission checks
│       │   └── upload.middleware.js       # Multer file upload config
│       ├── models/                       # 35 Mongoose schemas
│       │   ├── User.js
│       │   ├── Subject.js
│       │   ├── Batch.js
│       │   ├── Lecture.js
│       │   ├── Exam.js
│       │   ├── ExamAttempt.js
│       │   ├── Quiz.js
│       │   ├── QuizAttempt.js
│       │   ├── Question.js
│       │   ├── CachedAnswer.js
│       │   ├── ChapterBank.js
│       │   ├── ChapterProgress.js
│       │   ├── ChapterTestAttempt.js
│       │   ├── ChapterTestBank.js
│       │   ├── MasteryProgress.js
│       │   ├── Admission.js
│       │   ├── AdmissionPayment.js
│       │   ├── FeePayment.js
│       │   ├── Enquiry.js
│       │   ├── Attendance.js
│       │   ├── BatchTransfer.js
│       │   ├── LectureSheet.js
│       │   ├── LectureMCQBank.js
│       │   ├── LectureMCQAttempt.js
│       │   ├── DocumentTemplate.js
│       │   ├── AdminNotification.js
│       │   ├── Feedback.js
│       │   ├── ParentQuery.js
│       │   ├── AuditLog.js
│       │   ├── SystemConfig.js
│       │   ├── OnboardingSession.js
│       │   ├── Punch.js
│       │   ├── TeacherAvailability.js
│       │   └── OfflineExam.js
│       │   └── OfflineExamResult.js
│       ├── routes/                       # 26 route files
│       │   ├── auth.routes.js
│       │   ├── admin.routes.js
│       │   ├── student.routes.js
│       │   ├── parent.routes.js
│       │   ├── staff.routes.js
│       │   ├── teacher.routes.js
│       │   ├── teacherSelf.routes.js
│       │   ├── batch.routes.js
│       │   ├── exam.routes.js
│       │   ├── quiz.routes.js
│       │   ├── lecture.routes.js
│       │   ├── lectureContent.routes.js
│       │   ├── question.routes.js
│       │   ├── subject.routes.js
│       │   ├── chapterbank.routes.js
│       │   ├── progress.routes.js
│       │   ├── attendance.routes.js
│       │   ├── biometric.routes.js
│       │   ├── offlineExam.routes.js
│       │   ├── settings.routes.js
│       │   ├── scheduler.routes.js
│       │   ├── stats.routes.js
│       │   ├── teacherAvailability.routes.js
│       │   ├── enquiryStaff.routes.js
│       │   ├── feesStaff.routes.js
│       │   └── adminNotification.routes.js
│       ├── services/                     # 24 service modules
│       │   ├── geminiService.js
│       │   ├── smartScheduler.service.js
│       │   ├── collisionDetector.service.js
│       │   ├── studentTransparency.service.js
│       │   ├── studentCreation.service.js
│       │   ├── admissionFees.service.js
│       │   ├── admissionNumber.service.js
│       │   ├── admissionReceipt.service.js
│       │   ├── attendanceAggregation.service.js
│       │   ├── biometric.service.js
│       │   ├── blobStorage.service.js
│       │   ├── configCache.service.js
│       │   ├── deviceStatus.service.js
│       │   ├── email.service.js
│       │   ├── enquiryDashboard.service.js
│       │   ├── feeDefaulters.service.js
│       │   ├── feeReceipt.service.js
│       │   ├── offlineExam.service.js
│       │   ├── parentLink.service.js
│       │   ├── punchHistory.service.js
│       │   ├── receiptPayload.service.js
│       │   ├── syllabusDebt.service.js
│       │   ├── teacherAvailability.service.js
│       │   └── whatsapp.service.js
│       └── utils/
│           ├── auditLogger.js
│           ├── enquiryLegacySync.js
│           ├── entranceAccess.js
│           ├── examTypeFilter.js
│           └── istSessionDate.js
├── frontend/
│   ├── .env.example                      # Frontend env template
│   ├── package.json                      # Frontend dependencies
│   ├── index.html                        # SPA entry point
│   ├── vite.config.js                    # Vite + PWA + code splitting
│   ├── tailwind.config.js                # Brand colors + custom config
│   ├── postcss.config.js                 # PostCSS pipeline
│   ├── eslint.config.js                  # ESLint rules
│   ├── vercel.json                       # Vercel SPA rewrites
│   ├── public/                           # Static assets (PWA icons)
│   └── src/
│       ├── main.jsx                      # React root + PWA registration
│       ├── App.jsx                       # Router + AuthProvider
│       ├── App.css                       # Global styles
│       ├── index.css                     # Tailwind imports + base styles
│       ├── assets/                       # Static images/icons
│       ├── constants/                    # Frontend constants
│       ├── context/
│       │   ├── AuthContext.jsx           # Auth state provider
│       │   └── ParentChildContext.jsx    # Parent-child state
│       ├── hooks/
│       │   ├── useBasePath.js
│       │   ├── useDebouncedValue.js
│       │   ├── useHeadroom.js
│       │   ├── useIsMobile.js
│       │   ├── useReceiptTemplate.js
│       │   └── useTransparencyApiPrefix.js
│       ├── services/
│       │   └── api.js                    # Axios instance + interceptors
│       ├── utils/                        # Formatting helpers
│       ├── components/
│       │   ├── BatchSelector.jsx
│       │   ├── common/                   # Button, Input, LatexRenderer
│       │   ├── ui/                       # GlassCard, BottomSheet, ResponsiveTable
│       │   ├── layout/                   # 16 layout components (5 roles)
│       │   ├── admin/                    # 9 admin components
│       │   ├── staff/                    # 5 staff modals/wizards
│       │   ├── student/                  # 3 student components
│       │   ├── scheduler/                # 4 scheduler components
│       │   ├── practice/                 # 2 practice components
│       │   ├── exam/                     # 2 exam components
│       │   ├── question/                 # Question-related components
│       │   ├── auth/                     # Auth-related components
│       │   └── layouts/                  # Additional layout variants
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── AskQuestion.jsx
│           ├── TakeExam.jsx
│           ├── TakeQuiz.jsx
│           ├── TakeChapterQuiz.jsx
│           ├── ExamResult.jsx
│           ├── QuizResult.jsx
│           ├── QuizList.jsx
│           ├── StudentExamList.jsx
│           ├── History.jsx
│           ├── QuizHistory.jsx
│           ├── ChangePasswordPage.jsx
│           ├── admin/                    # 20+ admin pages
│           ├── teacher/                  # 4 teacher pages
│           ├── parent/                   # 4 parent pages
│           ├── staff/                    # 5 staff pages
│           ├── student/                  # Student-specific pages
│           └── practice/                 # 4 practice pages
└── project-docs/
    ├── overview.md                       # Project overview
    ├── tech-stack.md                     # Technical decisions
    ├── api-endpoints.md                  # API documentation
    ├── coaching_webapp_prd.md            # Product Requirements Document
    ├── coaching_webapp_trd.md            # Technical Requirements Document
    ├── GIT_MANUAL.md                     # Git workflow guide
    └── RENDER_DEPLOY.md                  # Deployment instructions
```

---

## 13. Libraries & Dependencies — Complete List

### Backend Dependencies (18 packages)

| # | Package | Version | Category | Purpose |
|---|---|---|---|---|
| 1 | `@google/generative-ai` | ^0.24.1 | AI | Google Gemini SDK for text and vision |
| 2 | `@vercel/blob` | ^2.3.3 | Storage | Cloud file storage for lecture sheets |
| 3 | `axios` | ^1.13.2 | HTTP | External API calls |
| 4 | `bcrypt` | ^5.1.1 | Security | Native password hashing (C++ bindings) |
| 5 | `bcryptjs` | ^3.0.3 | Security | Pure JS bcrypt fallback for compatibility |
| 6 | `cors` | ^2.8.5 | Security | Cross-Origin Resource Sharing middleware |
| 7 | `dotenv` | ^16.3.1 | Config | `.env` file environment variable loading |
| 8 | `express` | ^4.18.2 | Core | Web application framework |
| 9 | `express-mongo-sanitize` | ^2.2.0 | Security | NoSQL injection prevention |
| 10 | `express-rate-limit` | ^7.1.5 | Security | API rate limiting |
| 11 | `express-validator` | ^7.3.1 | Validation | Request body/params validation |
| 12 | `helmet` | ^7.1.0 | Security | HTTP security headers |
| 13 | `jsonwebtoken` | ^9.0.2 | Auth | JWT token generation and verification |
| 14 | `mongoose` | ^8.0.3 | Database | MongoDB ODM with schema validation |
| 15 | `multer` | ^2.0.2 | Upload | Multipart file upload handling |
| 16 | `node-zklib` | ^1.3.0 | Hardware | ZK biometric device communication |
| 17 | `nodemailer` | ^7.0.12 | Email | SMTP email sending |
| 18 | `xss-clean` | ^0.1.4 | Security | Cross-Site Scripting prevention |
| 19 | `zklib` | ^0.2.11 | Hardware | ZK fingerprint reader library |

### Backend Dev Dependencies (1 package)

| # | Package | Version | Purpose |
|---|---|---|---|
| 1 | `nodemon` | ^3.0.2 | Auto-restart server on file changes |

### Frontend Dependencies (25 packages)

| # | Package | Version | Category | Purpose |
|---|---|---|---|---|
| 1 | `react` | ^19.2.0 | Core | UI component library |
| 2 | `react-dom` | ^19.2.0 | Core | React DOM renderer |
| 3 | `react-router-dom` | ^7.12.0 | Routing | Client-side navigation |
| 4 | `axios` | ^1.13.2 | HTTP | API communication |
| 5 | `framer-motion` | ^12.34.0 | Animation | Page transitions and micro-interactions |
| 6 | `lucide-react` | ^0.562.0 | Icons | SVG icon library (600+ icons) |
| 7 | `recharts` | ^3.7.0 | Charts | Data visualization (bar, line, pie, etc.) |
| 8 | `react-hook-form` | ^7.71.1 | Forms | Performant form state management |
| 9 | `react-hot-toast` | ^2.6.0 | UI | Lightweight toast notifications |
| 10 | `react-toastify` | ^11.0.5 | UI | Feature-rich toast notifications |
| 11 | `react-markdown` | ^10.1.0 | Rendering | Markdown → React component rendering |
| 12 | `katex` | ^0.16.27 | Math | LaTeX mathematical equation rendering |
| 13 | `rehype-katex` | ^7.0.1 | Math | KaTeX integration for rehype pipeline |
| 14 | `remark-math` | ^6.0.0 | Math | Math syntax plugin for remark |
| 15 | `jspdf` | ^4.0.0 | PDF | Client-side PDF document generation |
| 16 | `jspdf-autotable` | ^5.0.7 | PDF | Automated table layout in PDFs |
| 17 | `xlsx` | ^0.18.5 | Excel | Excel file read/write (SheetJS) |
| 18 | `tesseract.js` | ^7.0.0 | OCR | Image-to-text extraction in browser |
| 19 | `@tanstack/react-table` | ^8.21.3 | Tables | Headless table state management |
| 20 | `class-variance-authority` | ^0.7.1 | Styling | Component variant management |
| 21 | `clsx` | ^2.1.1 | Styling | Conditional className utility |
| 22 | `tailwind-merge` | ^3.4.0 | Styling | Smart Tailwind class deduplication |
| 23 | `tailwindcss-animate` | ^1.0.7 | Animation | Tailwind animation utilities |
| 24 | `@tailwindcss/forms` | ^0.5.11 | Styling | Form element reset/styling |
| 25 | `@tailwindcss/postcss` | ^4.1.18 | Build | Tailwind PostCSS integration |
| 26 | `@tailwindcss/vite` | ^4.1.18 | Build | Tailwind Vite plugin |

### Frontend Dev Dependencies (12 packages)

| # | Package | Version | Purpose |
|---|---|---|---|
| 1 | `vite` | ^7.2.4 | Build tool and dev server |
| 2 | `tailwindcss` | ^4.1.18 | Utility-first CSS framework |
| 3 | `postcss` | ^8.5.6 | CSS processing pipeline |
| 4 | `autoprefixer` | ^10.4.23 | CSS vendor prefix automation |
| 5 | `@vitejs/plugin-react` | ^5.1.1 | React Fast Refresh for Vite |
| 6 | `vite-plugin-pwa` | ^1.2.0 | PWA manifest + service worker |
| 7 | `eslint` | ^9.39.1 | JavaScript linting |
| 8 | `@eslint/js` | ^9.39.1 | ESLint core rules |
| 9 | `eslint-plugin-react-hooks` | ^7.0.1 | React hooks linting |
| 10 | `eslint-plugin-react-refresh` | ^0.4.24 | HMR compatibility checks |
| 11 | `globals` | ^16.5.0 | Global variable definitions |
| 12 | `@types/react` | ^19.2.5 | TypeScript types (IDE support) |
| 13 | `@types/react-dom` | ^19.2.3 | TypeScript types (IDE support) |
| 14 | `@types/node` | ^25.2.3 | Node.js type definitions |

---

## 14. Development Process — How the Project Was Built

### Phase 1: Foundation & MVP (January 2026)

**Week 1-2: Scaffolding**
- Initialized MERN stack project structure
- Set up MongoDB Atlas free tier database
- Configured Express server with security middleware
- Built User model with bcrypt password hashing
- Implemented JWT authentication flow
- Integrated Google Gemini API for Q&A

**Week 3-4: Core Student Experience**
- Built React frontend with Vite
- Implemented student registration and login
- Created AI-powered question-answer interface
- Added support for image-based questions (Gemini Vision)
- Built question history with LaTeX rendering (KaTeX)
- Implemented smart answer caching to reduce API costs
- Added ChapterBank feature with seeded question data

**Deliverable:** Working MVP — students can register, login, ask questions, and get AI answers.

### Phase 2: Academic Management (February 2026)

**Examination System**
- Built complete exam creation, scheduling, and grading system
- Implemented timed exam interface with live progress tracking
- Added quiz system with AI-generated questions
- Built chapter-wise practice tests

**Batch & Subject Management**
- Created batch management with student assignment
- Built subject CRUD operations
- Implemented batch-aware routing throughout the platform

**Deployment**
- Deployed frontend to Vercel with SPA rewrites
- Deployed backend to Render with auto-deploy from `main`
- Configured CI/CD via GitHub Actions

### Phase 3: Lecture & Teacher System (March 2026)

**Lecture Scheduling Engine**
- Built smart scheduler with multi-constraint collision detection (teacher, batch, room, time)
- Implemented daily planner view for admin
- Added per-batch sequential lecture numbering (L1, L2, L3...)
- Built syllabus coverage matrix

**Teacher Portal**
- Created teacher dashboard with assigned lectures
- Built weekly availability slot management
- Added chapter assignment tracking
- Implemented teacher payment/compensation tracking

**Content Management**
- Added lecture sheet upload system (Vercel Blob storage)
- Built per-lecture MCQ bank with student attempt tracking

### Phase 4: Administrative Features (April 2026)

**Admission & Fee Management**
- Built full admission lifecycle (enquiry → admission → enrolled)
- Implemented multi-installment fee plans
- Created PDF receipt generation (jsPDF)
- Added fee defaulter identification
- Built auto-incrementing admission numbers

**Enquiry CRM**
- Created lead management pipeline for staff
- Built follow-up scheduling system
- Implemented enquiry-to-student conversion wizard
- Added enquiry dashboard with funnel analytics

**Staff Portal**
- Built dedicated staff interface for front-desk operations
- Implemented fee collection workflow
- Added payment history with receipt generation

### Phase 5: Transparency & Monitoring (May 2026)

**Parent Portal**
- Built parent account system with linked students
- Created academic progress dashboard for parents
- Added attendance, fee, and exam visibility
- Implemented parent query/communication system

**Student Transparency**
- Built syllabus progress tracking with real-time percentages
- Added mastery-based learning progression
- Implemented practice system with spaced repetition

**Biometric Integration**
- Integrated ZK TeamOffice Z200BW biometric devices
- Implemented ICLOCK protocol handler for attendance
- Built punch history processing service
- Added device health monitoring dashboard

**Admin Analytics**
- Created admin dashboard with KPIs
- Built enrollment growth charts (Recharts)
- Added branch comparison analytics
- Implemented top/bottom performer identification
- Built real-time activity feed

### Phase 6: Polish & Hardening (May–June 2026)

**PWA Support**
- Added service worker registration
- Configured PWA manifest with icons
- Enabled installable web app on mobile

**Performance Optimization**
- Implemented Vite code splitting (6 manual chunks)
- Added `save-data` detection for low-end devices
- Optimized API queries with selective field population

**UX Improvements**
- Added Framer Motion page transitions
- Built glassmorphism UI components
- Implemented mobile-first bottom navigation for all roles
- Added auto-hiding header (headroom hook)
- Built responsive table components

**System Configuration**
- Created dynamic system config editor
- Built receipt template editor
- Added audit logging for critical operations

**Bug Fixes & Refinements**
- Fixed syllabus progress calculation logic
- Resolved fee defaulter calculation edge cases
- Fixed batch transfer data integrity
- Improved offline exam result handling

---

## 15. API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/auth/register` | Public | Create student account |
| `POST` | `/v1/auth/login` | Public | Authenticate and get JWT |

### Student APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/questions/ask` | Student | Submit question, get AI answer |
| `GET` | `/v1/questions/history` | Student | Past questions and answers |
| `GET` | `/v1/student/*` | Student | Student-specific routes |

### Admin APIs

| Prefix | Auth | Description |
|---|---|---|
| `/v1/admin/*` | Admin | Full admin management routes |
| `/v1/admin/settings/*` | Admin | System configuration |
| `/v1/admin/stats/*` | Admin | Analytics and KPIs |
| `/v1/admin/teachers/*` | Admin | Teacher management |
| `/v1/admin/scheduler/*` | Admin | Smart lecture scheduling |
| `/v1/admin/progress/*` | Admin | Syllabus progress tracking |
| `/v1/admin/attendance/*` | Admin | Attendance management |
| `/v1/admin/notifications/*` | Admin | System notifications |
| `/v1/admin/offline-exams/*` | Admin | Offline exam management |
| `/v1/admin/lecture-content/*` | Admin | Lecture sheets and MCQs |

### Shared APIs

| Prefix | Auth | Description |
|---|---|---|
| `/v1/exams/*` | Various | Exam CRUD, attempts, results |
| `/v1/quiz/*` | Various | Quiz management and attempts |
| `/v1/batches/*` | Various | Batch information |
| `/v1/subjects/*` | Various | Subject data |
| `/v1/lectures/*` | Various | Lecture data |
| `/v1/chapterbank/*` | Various | Chapter and question bank |

### Staff APIs

| Prefix | Auth | Description |
|---|---|---|
| `/v1/staff/*` | Staff | Enquiry management, fee collection |

### Parent APIs

| Prefix | Auth | Description |
|---|---|---|
| `/v1/parent/*` | Parent | Child transparency data |

### Teacher APIs

| Prefix | Auth | Description |
|---|---|---|
| `/v1/teacher/*` | Teacher | Self-service teacher routes |
| `/v1/*/teacher-availability` | Various | Availability management |

### Biometric

| Prefix | Auth | Description |
|---|---|---|
| `/v1/biometric/*` | Device | ICLOCK protocol endpoints |
| `/iclock/cdata` | Device | Direct device compatibility route |

---

## 16. Environment Configuration

### Backend `.env`

```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/DB_NAME

# Authentication
JWT_SECRET=<secret-key>

# AI
GEMINI_API_KEY=<google-gemini-api-key>

# File Storage
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>

# CORS
CLIENT_URL=https://your-frontend.vercel.app

# Biometric
DEVICE_BRANCH_MAP={"SERIAL":"BRANCH_NAME"}
BIOMETRIC_DEBUG=false

# WhatsApp
WHATSAPP_MODE=test

# Twilio (production)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5001/v1
```

---

## 17. Performance Optimizations

| Optimization | Implementation |
|---|---|
| **AI Response Caching** | MongoDB `CachedAnswer` collection reduces Gemini API calls by ~90% |
| **Code Splitting** | Vite manual chunks: vendor, ui, charts, pdf, excel, ocr |
| **PWA Caching** | Service worker caches static assets for offline access |
| **Rate Limiting** | 100 req/10min prevents abuse and protects free tier |
| **Selective Population** | Mongoose `.select()` and `.populate()` minimize data transfer |
| **Debounced Search** | `useDebouncedValue` hook reduces API calls during typing |
| **Save-Data Detection** | Detects `navigator.connection.saveData` to disable animations |
| **Safe Area Utilities** | CSS `env(safe-area-inset-*)` for notched devices |
| **Proxy Configuration** | Vite dev server proxy eliminates CORS during development |

---

## 18. Future Roadmap

### Planned Features

1. **Mobile Application** — React Native or Flutter app for Android/iOS
2. **WhatsApp Integration** — Automated attendance and fee reminders via Twilio
3. **Video Solutions** — Linked video explanations for complex topics
4. **Peer Discussion Forum** — Student-to-student doubt resolution
5. **Multi-Language Support** — Marathi and Hindi interface options
6. **Premium Tier** — Unlimited AI questions with priority support
7. **Advanced Analytics** — Predictive performance modeling
8. **Multi-Branch Scaling** — Full multi-branch architecture with inter-branch analytics

---

## 📝 Document Metadata

| Field | Value |
|---|---|
| **Document Version** | 1.0 |
| **Generated On** | June 12, 2026 |
| **Repository** | `OMGP1/Shiv_CDC_AI_app` |
| **First Commit** | January 23, 2026 |
| **Latest Commit** | May 29, 2026 |
| **Total Commits** | 281 |
| **Primary Language** | JavaScript (Node.js + React) |
| **Architecture** | MERN Stack + PWA |
| **Deployment** | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

> *This document serves as the single source of truth for the Shiv Genie Classes AI-Powered Learning Platform. It covers architecture, technology choices, development history, and operational details for stakeholders, developers, and evaluators.*
