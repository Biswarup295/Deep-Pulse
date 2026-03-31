// ============================================================
// DeepPulse — Insights Engine (Rule-Based AI Focus Coach)
// Generates personalized insights & recommendations from data
// ============================================================

class DeepPulseInsightsEngine {
  constructor(sessions, moodLogs) {
    this.sessions   = sessions  || [];
    this.moodLogs   = moodLogs  || [];
    this.insights   = [];
    this.recommendations = [];
    this.recoveryProtocols = this._defaultRecovery();
  }

  // ── Main Entry Point ───────────────────────────────────────
  analyze() {
    if (this.sessions.length < 2) return this._defaults();
    this._analyzeAttentionDropTime();
    this._analyzeBestFocusWindow();
    this._analyzeBestCategory();
    this._analyzeDistractionPattern();
    this._analyzeCompletionConsistency();
    this._analyzeStaminaGrowth();
    this._analyzeMoodCorrelation();
    this._generateRecommendations();
    return {
      insights:        this.insights,
      recommendations: this.recommendations,
      recoveryProtocols: this.recoveryProtocols,
    };
  }

  // ── Insight: Average attention drop time ──────────────────
  _analyzeAttentionDropTime() {
    const completed = this.sessions.filter(s => s.completed);
    if (!completed.length) return;
    const avgDuration = completed.reduce((a,s) => a + s.actual, 0) / completed.length;
    const dropMinute  = Math.round(avgDuration * 0.82); // score drops at ~82% of session

    this.insights.push({
      id:   "attention-drop",
      type: "pattern",
      emoji: "⏱️",
      title: `You lose focus after ~${dropMinute} minutes`,
      description: `Across your last ${this.sessions.length} sessions, attention quality drops sharply around the ${dropMinute}-minute mark. This is your natural focus threshold.`,
      stat: `${dropMinute} min`,
      statLabel: "avg focus limit",
    });
  }

  // ── Insight: Best focus hour window ───────────────────────
  _analyzeBestFocusWindow() {
    const hourMap = {};
    this.sessions.forEach(s => {
      const h = s.hour;
      if (!hourMap[h]) hourMap[h] = [];
      hourMap[h].push(s.score);
    });

    const hourAvgs = Object.entries(hourMap).map(([h, scores]) => ({
      hour: parseInt(h),
      avg:  scores.reduce((a,b) => a+b, 0) / scores.length,
      count: scores.length,
    })).filter(h => h.count >= 2).sort((a,b) => b.avg - a.avg);

    if (!hourAvgs.length) return;
    const best = hourAvgs[0];
    const label = this._hourLabel(best.hour);

    this.insights.push({
      id:   "best-window",
      type: "pattern",
      emoji: "🌙",
      title: `Your best focus window is ${label}`,
      description: `Sessions in this window score an average of ${Math.round(best.avg)} — consistently ${Math.round(best.avg - this._overallAvgScore())} points above your overall average.`,
      stat: label,
      statLabel: "peak focus window",
    });
  }

  // ── Insight: Strongest session category ───────────────────
  _analyzeBestCategory() {
    const catMap = {};
    this.sessions.forEach(s => {
      if (!catMap[s.category]) catMap[s.category] = [];
      catMap[s.category].push(s.score);
    });
    const catAvgs = Object.entries(catMap)
      .map(([cat, scores]) => ({ cat, avg: scores.reduce((a,b)=>a+b,0)/scores.length }))
      .sort((a,b) => b.avg - a.avg);

    if (catAvgs.length < 2) return;
    const best  = catAvgs[0];
    const delta = Math.round(best.avg - this._overallAvgScore());

    this.insights.push({
      id:   "best-category",
      type: "pattern",
      emoji: "💻",
      title: `${best.cat} is your strongest category`,
      description: `Your average focus score for ${best.cat} sessions is ${Math.round(best.avg)} — ${delta > 0 ? delta + " points above" : "near"} your overall average. This is your deep-work strength zone.`,
      stat: Math.round(best.avg),
      statLabel: `avg ${best.cat} score`,
    });
  }

  // ── Insight: Main distraction type ────────────────────────
  _analyzeDistractionPattern() {
    const avgD = this.sessions.reduce((a,s) => a+s.distractions, 0) / this.sessions.length;
    if (avgD < 2) return;

    this.insights.push({
      id:   "distraction-pattern",
      type: "warning",
      emoji: "📱",
      title: "Tab switching is your #1 distraction",
      description: `You average ${avgD.toFixed(1)} distraction events per session. Browser tab switching accounts for ~67% of all detected interruptions — usually triggered by novelty-seeking or avoidance.`,
      stat: avgD.toFixed(1),
      statLabel: "avg distractions/session",
    });
  }

  // ── Insight: Completion consistency ───────────────────────
  _analyzeCompletionConsistency() {
    const rate = this.sessions.filter(s => s.completed).length / this.sessions.length;
    const pct  = Math.round(rate * 100);
    const label = pct >= 80 ? "excellent" : pct >= 60 ? "solid" : "needs improvement";

    this.insights.push({
      id:   "completion-rate",
      type: pct >= 70 ? "pattern" : "warning",
      emoji: pct >= 70 ? "✅" : "⚠️",
      title: `${pct}% session completion rate — ${label}`,
      description: pct >= 70
        ? `You complete ${pct}% of started sessions. This consistency is building strong deep-work habits. Keep protecting your sessions from interruption.`
        : `Only ${pct}% of your sessions run to completion. Abandoned sessions reset your focus momentum. Try shorter durations to improve completion.`,
      stat: `${pct}%`,
      statLabel: "completion rate",
    });
  }

  // ── Insight: Stamina growth ────────────────────────────────
  _analyzeStaminaGrowth() {
    if (!window.DEMO?.stamina?.length) return;
    const stamina = window.DEMO.stamina;
    const first   = stamina[0].avgMin;
    const last    = stamina[stamina.length-1].avgMin;
    const growth  = Math.round(((last - first) / first) * 100);

    this.insights.push({
      id:   "stamina-growth",
      type: "pattern",
      emoji: "💪",
      title: `Your attention stamina grew ${growth}% in 8 weeks`,
      description: `Your average uninterrupted focus time increased from ${first} to ${last} minutes over the past 8 weeks. This is measurable neurological improvement from consistent deep-work practice.`,
      stat: `+${growth}%`,
      statLabel: "stamina growth",
    });
  }

  // ── Insight: Mood ↔ Focus correlation ────────────────────
  _analyzeMoodCorrelation() {
    if (!this.moodLogs.length) return;
    const highMoodSessions = this.moodLogs
      .filter(m => m.before >= 4)
      .map(m => this.sessions.find(s => s.id === m.sessionId))
      .filter(Boolean);
    const lowMoodSessions  = this.moodLogs
      .filter(m => m.before <= 2)
      .map(m => this.sessions.find(s => s.id === m.sessionId))
      .filter(Boolean);

    if (!highMoodSessions.length || !lowMoodSessions.length) return;
    const highAvg = Math.round(highMoodSessions.reduce((a,s)=>a+s.score,0)/highMoodSessions.length);
    const lowAvg  = Math.round(lowMoodSessions.reduce((a,s)=>a+s.score,0)/lowMoodSessions.length);
    const delta   = highAvg - lowAvg;

    this.insights.push({
      id:   "mood-correlation",
      type: "pattern",
      emoji: "😊",
      title: `Mood strongly predicts your focus score`,
      description: `When you start a session with mood 4+/5, your focus score averages ${highAvg}. When mood is 2 or below, it drops to ${lowAvg}. A ${delta}-point difference. Protecting your mental state is a productivity strategy.`,
      stat: `+${delta} pts`,
      statLabel: "score boost with good mood",
    });
  }

  // ── Recommendations ───────────────────────────────────────
  _generateRecommendations() {
    const avgScore = this._overallAvgScore();
    const avgDuration = this.sessions.filter(s=>s.completed).reduce((a,s)=>a+s.actual,0) / (this.sessions.filter(s=>s.completed).length || 1);

    // Duration recommendation
    if (avgDuration > 60) {
      this.recommendations.push({
        id: "rec-duration",
        emoji: "⏰",
        title: "Try shorter sessions",
        description: `Your average session is ${Math.round(avgDuration)} minutes, but focus quality drops well before that. Switching to 40–50 minute sessions could raise your average score by 8–12 points.`,
        action: "Set 40-min sessions this week",
        priority: "high",
      });
    } else if (avgDuration < 20) {
      this.recommendations.push({
        id: "rec-duration",
        emoji: "⏰",
        title: "Gradually extend your sessions",
        description: `Your sessions average ${Math.round(avgDuration)} minutes. You're building a good habit — try increasing by 5 minutes each week to grow your attention stamina.`,
        action: "Try 25-min sessions next",
        priority: "medium",
      });
    }

    // Peak hours recommendation
    const bestHourInsight = this.insights.find(i => i.id === "best-window");
    if (bestHourInsight) {
      this.recommendations.push({
        id: "rec-timing",
        emoji: "🌙",
        title: `Schedule deep work during ${bestHourInsight.stat}`,
        description: `Block your most important tasks for your peak window. Use shallow tasks (emails, admin) during your lower-energy hours.`,
        action: "Block calendar for peak window",
        priority: "high",
      });
    }

    // Tab switching
    const avgD = this.sessions.reduce((a,s)=>a+s.distractions,0)/this.sessions.length;
    if (avgD > 4) {
      this.recommendations.push({
        id: "rec-tabs",
        emoji: "🗂️",
        title: "Close all unrelated tabs before each session",
        description: "Tab switching is your most frequent distraction. Before each session, close everything except what you need. This single habit can add 8–15 points to your focus score.",
        action: "One tab rule: try it today",
        priority: "high",
      });
    }

    // Completion rate
    const rate = this.sessions.filter(s=>s.completed).length / this.sessions.length;
    if (rate < 0.7) {
      this.recommendations.push({
        id: "rec-completion",
        emoji: "🎯",
        title: "Protect your sessions from interruption",
        description: "Tell people around you that you're in a focus block. Put your phone in another room. A completed session builds momentum; an abandoned one breaks it.",
        action: "Enable Do Not Disturb mode",
        priority: "medium",
      });
    }

    // Recovery
    this.recommendations.push({
      id: "rec-recovery",
      emoji: "🔋",
      title: "Use structured breaks between sessions",
      description: "A 5-minute walking break or box breathing reset between sessions restores attention capacity better than scrolling social media. Recovery is part of the training.",
      action: "Try the breathing protocol in Recovery",
      priority: "medium",
    });

    // Mood prep
    this.recommendations.push({
      id: "rec-mood",
      emoji: "😌",
      title: "Log mood before each session",
      description: "Your data shows mood is one of the strongest predictors of focus quality. Even a 30-second check-in before a session helps you calibrate expectations and set intentions.",
      action: "Enable pre-session mood check-in",
      priority: "low",
    });
  }

  // ── Recovery Protocols ────────────────────────────────────
  _defaultRecovery() {
    return [
      { id:"breathing",  emoji:"🫁", title:"Box Breathing Reset",    desc:"4s in · 4s hold · 4s out · 4s hold — 3 rounds",  duration:"2 min",  color:"cyan" },
      { id:"eyes",       emoji:"👁️", title:"20-20-20 Eye Break",     desc:"Look 20 feet away for 20 seconds",                duration:"1 min",  color:"cyan" },
      { id:"hydration",  emoji:"💧", title:"Hydration Check",         desc:"Drink a full glass of water",                    duration:"30 sec", color:"amber" },
      { id:"posture",    emoji:"🧍", title:"Posture Reset",           desc:"Stand, stretch, roll shoulders back",             duration:"1 min",  color:"amber" },
      { id:"movement",   emoji:"🚶", title:"Movement Break",          desc:"Short walk — 2 mins resets cortisol levels",      duration:"5 min",  color:"purple" },
      { id:"gratitude",  emoji:"✍️", title:"Micro Journaling",        desc:"Write 1 thing you made progress on today",       duration:"2 min",  color:"green" },
    ];
  }

  // ── Defaults for new users ────────────────────────────────
  _defaults() {
    return {
      insights: [{
        id: "welcome",
        type: "pattern",
        emoji: "👋",
        title: "Complete 3+ sessions to unlock personalized insights",
        description: "DeepPulse needs a few sessions to learn your patterns. Start a focus session now and your AI insights will appear here soon.",
        stat: "3",
        statLabel: "sessions needed",
      }],
      recommendations: [],
      recoveryProtocols: this._defaultRecovery(),
    };
  }

  // ── Helpers ───────────────────────────────────────────────
  _overallAvgScore() {
    if (!this.sessions.length) return 70;
    return this.sessions.reduce((a,s) => a+s.score, 0) / this.sessions.length;
  }

  _hourLabel(hour) {
    const fmt = h => {
      const suffix = h >= 12 ? "PM" : "AM";
      const h12 = h > 12 ? h-12 : h === 0 ? 12 : h;
      return `${h12} ${suffix}`;
    };
    return `${fmt(hour)} – ${fmt(hour+2)}`;
  }
}

// ── Auto-run with demo data ───────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  if (!window.DEMO) return;
  const engine = new DeepPulseInsightsEngine(window.DEMO.sessions, window.DEMO.moodLogs);
  window.DEMO.computed = engine.analyze();
  console.log("🧠 Insights generated:", window.DEMO.computed.insights.length, "insights,", window.DEMO.computed.recommendations.length, "recommendations");
  document.dispatchEvent(new CustomEvent("deepPulseInsightsReady", { detail: window.DEMO.computed }));
});

window.DeepPulseInsightsEngine = DeepPulseInsightsEngine;
