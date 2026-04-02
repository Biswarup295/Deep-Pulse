# DeepPulse
### AI-Powered Deep Work & Attention Recovery Tool

> *"The real problem is not lack of time — it is damaged attention."*

---

## 🧠 The Problem

We live in the most distracted era in human history.

The average knowledge worker switches tasks every **2 minutes**. The average attention span has dropped below **8 seconds**. Social media platforms are engineered to hijack dopamine pathways — making sustained, deep concentration feel physically uncomfortable.

The result:
- **Shrinking attention spans** that make deep work nearly impossible
- **Tab-switching addiction** that breaks flow states before they form
- **Dopamine burnout** from constant notification cycles
- **No visibility** into when you're actually focused vs. just present at a desk

Most productivity apps respond to this with timers and website blockers. That's treating the symptom, not the disease.

---

## 💡 The Solution: DeepPulse

DeepPulse is an **attention recovery platform** — not just a productivity timer.

It helps users understand their focus patterns at a behavioral level, track the quality of their attention (not just time spent), and systematically rebuild deep-work stamina through data-driven coaching.

**DeepPulse is not:**
- A Pomodoro timer
- A website blocker
- A basic to-do list

**DeepPulse is:**
- A real-time focus quality analyzer
- A distraction pattern detector
- An AI-powered focus coach
- An attention stamina trainer

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| ⏱️ **Focus Session Timer** | Distraction-aware sessions with behavioral tracking from second one |
| 🎯 **AI Focus Score** | Real-time 0–100 score based on tab switches, idle time, pause patterns |
| 🔍 **Distraction Tracking** | Auto-detects tab switches, window blur, and idle states — no manual logging |
| 📈 **Deep Work Analytics** | Weekly/monthly dashboards showing focus trends, best hours, stamina growth |
| 💡 **Smart Nudges** | Behavioral micro-alerts triggered by patterns, not timers |
| 🔋 **Attention Recovery** | Science-backed breathing resets, eye breaks, movement prompts |
| 🧠 **AI Insights** | Rule-based focus coach — personalized insights from your session history |
| 😊 **Mood Check-In** | Pre/post session mood logging with correlation analysis |
| 🔥 **Streaks & Achievements** | Gamified habit building with badges and level progression |
| 📊 **Demo Mode** | Full seed data for immediate judge-ready showcase |

---

## 🔄 How It Works

```
1. Start a Session   →   Set task, category, and duration
2. Track Behavior    →   App silently monitors tab switches, blur, idle time
3. Measure Quality   →   Live focus score calculated from behavioral signals
4. Analyze Patterns  →   Post-session analytics reveal your distraction fingerprint
5. Get Insights      →   AI coach generates personalized recommendations
6. Improve Stamina   →   Weekly data shows measurable attention growth
```

---

## 🛠 Tech Stack

### Current (Hackathon Build)
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Custom CSS with CSS Variables, Glassmorphism |
| Charts | Chart.js |
| Fonts | Syne (display), DM Sans (body) |
| Logic | Modular JS — `script.js`, `insights.js`, `demo-data.js` |
| Storage | LocalStorage for session persistence |
| Database Schema | PostgreSQL (Supabase-ready) |
| Hosting | Netlify / GitHub Pages |

### Upgrade Path (Production)
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS + ShadCN + Framer Motion |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google) |
| Charts | Recharts |
| Deployment | Vercel |

---

## 📁 Project Structure

```
deeppulse/
├── index.html        # Landing page — hero, features, how it works, FAQ
├── app.html          # Full app — dashboard, focus session, analytics, insights
├── style.css         # Premium dark SaaS design system
├── script.js         # Core app logic — timer, distraction tracking, scoring
├── demo-data.js      # Hackathon seed data — 18 realistic sessions + analytics
├── insights.js       # Rule-based AI insights engine — generates coaching output
├── database.sql      # Supabase PostgreSQL schema with RLS, indexes, functions
└── README.md         # This file
```

---
## 🔬 The Focus Score Algorithm

```
Score = base_completion_score
      − distraction_penalty   (4 pts per event, max 30)
      − pause_penalty          (3 pts per pause, max 15)
      − idle_penalty           (2 pts per minute idle, max 20)

Labels:
  85–100 → Excellent · Deep Focus
  70–84  → Good Focus
  50–69  → Unstable Focus
  0–49   → Distracted Mode
```

This score is calculated live during sessions and stored per session for trend analysis.

---

## 🤖 The AI Insights Engine

`insights.js` implements a rule-based behavioral analysis system that generates:

- **Pattern insights** — what your session data reveals about your focus behavior
- **Recommendations** — specific, actionable changes to improve scores
- **Recovery protocols** — evidence-based attention restoration techniques

No real ML is needed. The engine analyzes session history for:
- Average attention drop time
- Best focus window by hour
- Strongest session category
- Distraction frequency patterns
- Completion consistency
- Stamina growth over time

---

## 🔭 Future Scope

| Feature | Description |
|---------|-------------|
| 🤖 Real AI/ML | GPT-based insights from full session transcripts |
| 🌐 Browser Extension | Cross-site tab tracking and distraction mapping |
| 📷 Webcam Mode | Privacy-first attention estimation (face presence detection) |
| 📱 Mobile App | React Native companion for session logging |
| 👥 Team Rooms | Shared focus sessions for remote teams |
| 🔗 Calendar Integration | Auto-schedule deep work blocks during predicted peak hours |
| 📊 SaaS Platform | Multi-user dashboard with team analytics |

---

## 🌍 Why This Matters

The global attention crisis is not a personal failure — it's a design problem. Apps, feeds, and notifications are engineered to maximize engagement at the cost of human cognitive health.

DeepPulse is the counter-thesis: technology that strengthens your mind rather than fragmenting it. Every session logged is a data point in a feedback loop that makes sustained attention easier over time.

Attention is the ultimate leverage point. Everything valuable in life — learning, creating, building, connecting — requires it. DeepPulse exists to help people reclaim it.

---


*Built with focus, for focus.*

**[Live Demo](https://deep-pulse-murex.vercel.app/)** · **[GitHub](https://github.com/Biswarup295/Deep-Pulse)**
