<div align="center">
  <h1>🎙️ AI Adaptive Interviewer</h1>
  <p>A premium, immersive SaaS platform that conducts real-time, highly-adaptive technical and behavioral mock interviews using Groq's low-latency LLM ecosystem.</p>
</div>

---

## 🌊 Complete Platform Flow

The AI Adaptive Interviewer is built around a seamless, 3-step continuous user journey that mimics a high-stakes professional video interview.

### 1. 🚀 Onboarding & Setup
The entry point to the application where candidates prepare their testing parameters.
- **Profile & Resume Parsing**: Users provide their name and optionally upload a PDF resume using a custom drag-and-drop zone. The system extracts this text securely in the browser before feeding it to the AI to heavily personalize the interview questions.
- **Role Selection**: Users select from 8 distinct engineering and management profiles (Frontend, Backend, Full Stack, DevOps, Data Science, Product Manager, HR, UI/UX).
- **AI Personality Tuning**: Candidates can configure the specific behavior and strictness of the interviewer: `Friendly 😊`, `Neutral 😐`, or `Strict (FAANG) 😤`.

### 2. 💻 Live Interview Dashboard
The core simulation environment, structured into a modern 3-column dark-themed HUD.
- **Left Panel (AI Status)**: Displays the active state of the AI Interviewer (Listening, Analyzing, Thinking, Speaking) combined with glowing, pulsing ring animations to make the interaction feel alive and responsive.
- **Center Panel (Interaction Stage)**: The primary focus area where the AI dynamically "types out" complex questions using a simulated typing cursor. Candidates can respond via standard text input or utilize the integrated browser microphone for Speech-to-Text.
- **Right Panel (Real-Time Metrics & Camera)**: 
  - **Live Camera Feed**: Activates the webcam with a mirror effect to simulate video conferencing software (strictly client-side, no video is recorded).
  - **Session Timer**: Tracks the ongoing duration of the active interview.
  - **Pace (WPM)**: Real-time Words Per Minute calculation to train candidates on their speaking speed.
  - **Filler Word Tracker**: Live semantic tracking of filler words ("um", "uh", "like") with visual green/amber/red warning thresholds.
- **Conversational Loop**: Once an answer is finalized and submitted, the Flask backend pings the Groq LLM to evaluate it instantly. The AI generates a natural, contextual acknowledgement ("That's an interesting approach to caching...") AND seamlessly chains it into the next adaptive question in a single fluid stream, completely eliminating jarring "feedback" interruptions.

### 3. 📊 Final Assessment & Report
- **Holistic Evaluation**: Upon manual termination or reaching the question limit, the AI digests the entire session transcript contextually.
- **Scoring**: The candidate receives a final 1-10 overall grade alongside detailed categorized metric rings (Technical Knowledge, Communication, Problem Solving, Confidence).
- **Actionable Takeaways**: An extensive, personalized study plan and a simulated hiring recommendation (Hire / No Hire / Lean Hire) is rendered based on the specific nuances of their performance.

---

## 🏗️ Technical Architecture & Stack

### Frontend (User Interface)
- **Framework**: React 18 / Vite
- **Styling**: Vanilla CSS Modules implementing a premium, futuristic SaaS dark theme (Glassmorphism, backdrop filters, CSS cubic-bezier animations, flex/grid layouts).
- **State Management**: Highly complex custom React Hooks (`useInterview.js`) that track history arrays, active stage states, and continuous metric calculations.
- **Hardware Integration**: Implementations of the native Browser `MediaDevices` API for zero-latency webcam streaming and the `SpeechRecognition` API for voice capture.

### Backend (AI Engine)
- **Framework**: Python / Flask
- **LLM Engine**: Groq API (specifically utilizing `llama3-70b-8192` or `llama3-8b-8192` for near-instant inference execution).
- **PDF Extraction**: `PyPDF2` integration to chunk and extract text cleanly.
- **Architecture**: Stateless REST API operations. All active conversation history is strictly maintained on the client's state and passed up on subsequent requests to ensure perfect scalability and zero server memory bloat.

---

## 📁 Repository Structure

```text
ai-interviewer/
├── backend/
│   ├── app.py                  # Flask entry point and CORS configuration
│   ├── config.py               # API keys, global model parameters, backend settings
│   ├── requirements.txt        # Python pip dependencies
│   ├── api/
│   │   └── interview.py        # Controller defining /start, /next, /report logic routes
│   └── services/
│       └── groq_service.py     # Core prompt engineering, JSON formatting, Groq orchestration
│
└── frontend/
    ├── index.html              # Core HTML document root
    ├── vite.config.js          # Vite optimization build configuration
    ├── package.json            # Node.js dependencies and operational scripts
    └── src/
        ├── main.jsx            # React strict-mode DOM injection
        ├── App.jsx             # Top-level Component Router / Theme wrapper
        ├── styles/
        │   └── global.css      # CSS Reset, Root Variables (Colors, Spacing, Typography)
        ├── services/
        │   ├── interviewApi.js # Asynchronous fetch wrappers for proxying the Flask API
        │   └── useInterview.js # The "Brain" hook managing the active state machine & history
        ├── components/         # Reusable generic UI Atoms (Progress Bars, Loaders, Rings)
        └── pages/
            ├── SetupPage.jsx          # Step 1: Onboarding, Resume Upload, Parameter Configuration
            ├── SetupPage.module.css   # - CSS for Setup Page
            ├── InterviewPage.jsx      # Step 2: 3-column UI, WebRTC Camera, Live Conversational Chat
            ├── InterviewPage.module.css # - CSS for 3-column HUD and Animations
            ├── ReportPage.jsx         # Step 3: Final data visualization and breakdown
            └── ReportPage.module.css  # - CSS for interactive performance charts
```

---

## ⚡ Quick Start Deployment

### 1. Configure the Backend Environment
1. Secure a free API key from [Groq Cloud](https://console.groq.com).
2. Navigate to the backend directory and set up standard Python dependencies.
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
3. Open `backend/config.py` and replace `"YOUR_GROQ_API_KEY_HERE"` with your actual key, OR export it via terminal: `export GROQ_API_KEY="your_key"`.
4. Run the server:
```bash
python app.py
```
*The Flask core API will successfully mount locally at `http://localhost:5000`*.

### 2. Configure the Frontend Application
1. In a split terminal, navigate to the React directory.
```bash
cd frontend
npm install
npm run dev
```
*Vite will compile module graphics and hot-mount the frontend at `http://localhost:5173`*. Open that URL in any modern browser to commence the experience.
