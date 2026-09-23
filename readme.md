# 🚀 CareerIQ - AI-Powered Career Development Platform

<div align="center">
  <h3>Your Intelligent Career Compass 🧭</h3>
  <p>Transforming career guidance with AI-powered interviews, personalized learning paths, mentor connections, and smart college recommendations.</p>

  [**GitHub**](https://github.com) | [**Report Issues**](https://github.com/issues) | [**Documentation**](./DEMO_DATA_SETUP.md)
</div>

---

## 🌟 Problem & Solution

### 🎯 The Problem
Students and professionals face significant challenges in career planning:
- Lack of personalized guidance on skill development
- Difficulty preparing for technical interviews
- Limited access to industry mentorship
- Overwhelming choices in educational institutions
- No structured path for career progression

### 💡 The Solution
**CareerIQ** is a comprehensive AI-powered career development platform that:
- Generates personalized learning roadmaps using advanced AI
- Conducts realistic mock interviews with real-time feedback
- Connects users with experienced industry mentors
- Provides data-driven college recommendations
- Offers intelligent career coaching through AI agents
- Tracks progress with interactive career roadmaps

## ✨ Key Features

### 🤖 AI Career Coach
Intelligent conversational AI agent that provides personalized career guidance based on your profile, interests, and goals. Uses Google Gemini and LangChain for context-aware responses.

### 🗺️ AI-Generated Learning Roadmaps
Creates personalized learning paths based on your target career and current skills. Generates structured, milestone-based roadmaps with resources and timeline estimates.

### 🎤 Voice AI Mock Interviews
Practice interviews with realistic AI agents powered by Vapi and Deepgram. Get real-time feedback on technical knowledge, communication skills, and problem-solving approaches. Transcripts and AI-generated feedback are automatically saved.

### 📋 Job Tracker
Manage your job applications and interview prep in one place. Track application status, upcoming interviews, and preparation progress with integrated interview scheduling.

### 🧠 Interview Preparation System
- Generate interview questions based on job descriptions
- Conduct AI-powered mock interviews with voice interaction
- Receive detailed feedback on interview performance
- Build interview history and track improvement over time

### 📚 My Learning Tracks
Access and manage your personalized learning roadmaps. Track progress through different career paths with structured milestones and resource recommendations.

### 🎓 College Recommendation Engine
Smart recommendations based on your preferences for:
- Budget range and fee structure
- Placement outcomes and average packages
- Geographic location
- Specific programs and specializations
- College type (Government/Private)

### 👥 Mentor Connect
Direct access to industry experts for 1:1 sessions. Connect with mentors across different specializations for guidance, mock interviews, and career mentorship via video calls.

### 📅 Calendar & Scheduling
Integrated calendar for managing mentorship sessions, mock interviews, and career milestones. Sync with Google Calendar for seamless scheduling.

### 💬 Messaging
Direct messaging with mentors and career coaches. Real-time communication for quick questions and guidance.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1 (with Turbopack)
- **Runtime:** React 19.2.3, TypeScript 5
- **Styling:** Tailwind CSS v4, Framer Motion, Styled Components
- **UI Components:** Radix UI, Lucide React, shadcn/ui
- **Visualization:** Three.js, React Flow, Recharts

### AI & Agents
- **LLMs:** Google Gemini API, Groq
- **Voice AI:** Vapi AI for mock interviews
- **Speech Recognition:** Deepgram
- **AI Framework:** LangChain (Google, Groq integrations)
- **Vector Database:** Pinecone for embeddings
- **Search:** Tavily, SerpApi, NewsAPI

### Backend & Database
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth, Google OAuth
- **Real-time:** Supabase Realtime
- **Cache:** Upstash Redis

### External Services
- **Video Communication:** ZegoCloud (1:1 video calls)
- **File Storage:** Google Cloud Storage, ImageKit
- **Calendar:** Google Calendar API
- **Payments:** Razorpay
- **Verification:** hCaptcha

### Development & Deployment
- **Package Manager:** pnpm
- **Build Tool:** Next.js build with Turbopack
- **Version Control:** Git

## 🏗️ Architecture

### System Design
```
┌─────────────────┐
│   Frontend      │
│  (Next.js 16)   │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │  API Routes         │
    │  (Next.js Backend)  │
    └────┬─────────────────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
┌───▼─────────┐    ┌──────────────▼──┐    ┌──────────────┐
│  Supabase   │    │  External APIs  │    │  AI Services │
│  (Database) │    │  (Vapi, Zego)   │    │  (Gemini)    │
└─────────────┘    └─────────────────┘    └──────────────┘
```

### Core Features Flow
1. **Authentication:** Supabase Auth (Email/Google OAuth)
2. **Profile Setup:** User data stored in Supabase
3. **Quiz Assessment:** Career preference questionnaire
4. **AI Roadmap Generation:** LangChain + Gemini
5. **Interview Prep:** Vapi AI voice interviews + transcript → AI feedback
6. **Learning Progress:** Supabase tracks roadmap completion
7. **Mentor Connection:** ZegoCloud video calls
8. **College Recommendations:** Smart filtering based on preferences

## 📊 Database Schema

### Key Tables

**users**
- id, email, full_name, avatar
- current_status, main_focus
- isQuizDone, created_at

**roadmapUsers**
- id, user_id, roadmap_data, created_at
- isStarted, progress, status, timeline

**others** (Interview Feedback)
- id, userId, jobTitle, interviewInsights
- created_at

**mentors**
- id, full_name, email, bio
- expertise[], current_position, availability
- rating, avatar, is_verified

**colleges**
- id, college_name, location
- best_suit_for[], fees, placement, type

**messages** (1:1 messaging)
- id, sender_id, receiver_id, content
- created_at, read_at

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **pnpm:** v8.0.0 or higher (recommended)
- **Supabase Account:** For database and authentication
- **API Keys:** Gemini, Vapi, Razorpay, etc.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-iq
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

   # AI Services
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
   VAPI_PUBLIC_KEY=your_vapi_public_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

   # Other Services
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # Storage
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

   # See env-vars.txt for complete list
   ```

4. **Set up Demo Data (Optional)**
   ```bash
   npx ts-node scripts/seed-demo-mentors.ts
   npx ts-node scripts/seed-demo-colleges.ts
   ```
   See [DEMO_DATA_SETUP.md](./DEMO_DATA_SETUP.md) for details.

5. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build & Deploy
```bash
# Build the application
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── (main)/                   # Main application routes
│   │   └── home/
│   │       ├── interview-prep/   # Interview preparation
│   │       ├── job-tracker/      # Job application tracking
│   │       ├── mentor-connect/   # Mentor marketplace
│   │       ├── ai-tools/         # AI features
│   │       └── my-tracks/        # Learning roadmaps
│   ├── api/                      # API routes
│   │   ├── feedback/             # Interview feedback generation
│   │   ├── ai/                   # AI agent endpoints
│   │   └── ...
│   └── auth/                     # Authentication pages
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   └── ...
├── context/                      # React Context providers
│   ├── InterviewContext.tsx
│   ├── UserDataProvider.tsx
│   └── userQuizProvider.tsx
├── lib/
│   ├── functions/                # Utility functions
│   ├── supabase/                 # Supabase clients
│   ├── store/                    # Zustand stores
│   └── types/                    # TypeScript definitions
└── public/                       # Static assets
```

## 🎯 Key Features Implementation

### Interview System Flow
1. User selects job and generates interview questions (AI via Gemini)
2. Vapi initializes voice call with interviewer agent
3. Deepgram captures audio transcription
4. Interview ends → Transcript sent to `/api/feedback`
5. Gemini generates structured feedback
6. Feedback stored in Supabase `others` table
7. User views feedback in Interview History

### Career Coach Flow
1. User inputs question/topic
2. System retrieves user's quiz data (career preferences)
3. LangChain agent constructs context
4. Gemini generates personalized response
5. Follow-up questions auto-generated
6. History maintained in chat interface

### Mentor Matching Flow
1. System filters mentors by expertise and availability
2. Displays mentors with ratings and bios
3. User books session → ZegoCloud video call initiated
4. Session recorded and available for review
5. Mentor feedback added to user profile

## 🔒 Security

- **Environment Secrets:** All sensitive keys in `.env.local` (excluded from git)
- **Supabase RLS:** Row-level security policies on all tables
- **Authentication:** Supabase Auth with OAuth support
- **API Protection:** API routes validate user authentication
- **Input Validation:** ZOD schemas for request validation

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect your GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Push to main branch to auto-deploy
```

### Self-Hosted
1. Set environment variables on server
2. Run `pnpm build`
3. Run `pnpm start`
4. Use process manager (PM2, systemd) for production

## 📚 Documentation

- **[DEMO_DATA_SETUP.md](./DEMO_DATA_SETUP.md)** - How to seed demo mentors and colleges
- **env-vars.txt** - Complete list of required environment variables
- **requirements.md** - Detailed requirements documentation

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a student portfolio project created for educational purposes. Demo data includes sample mentors and colleges for demonstration. For production use, replace with real data and implement proper verification processes.

---

<div align="center">
  <p><strong>CareerIQ</strong> - Your Intelligent Career Compass 🧭</p>
  <p>Built with ❤️ for career development</p>
</div>
