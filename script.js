// ============================================================
// DeepPulse — Main App Logic
// Focus timer, distraction tracking, scoring, nudges, storage
// ============================================================

// ── State ─────────────────────────────────────────────────────
const State = {
  session: {
    title:        "",
    category:     "Coding",
    planned:      25,       // minutes
    seconds:      0,        // countdown
    totalSeconds: 0,
    elapsed:      0,
    status:       "idle",   // idle | active | paused | ended
    distractions: 0,
    pauses:       0,
    idleSeconds:  0,
    score:        100,
    startTime:    null,
  },
  ui: { page: "dashboard" },
  nudgeQueue: [],
  nudgeTimer: null,
  tickInterval: null,
  idleTimer: null,
  IDLE_THRESHOLD: 120, // seconds of no interaction = idle
};

// ── Focus Score Calculator ─────────────────────────────────────
const FocusScorer = {
  calculate(s) {
    const completionPct = Math.min(s.elapsed / (s.totalSeconds || 1), 1);
    let score = 100 * (0.5 + 0.5 * completionPct);
    score -= Math.min(s.distractions * 4, 30);
    score -= Math.min(s.pauses * 3, 15);
    score -= Math.min((s.idleSeconds / 60) * 2, 20);
    return Math.max(Math.round(score), 0);
  },
  label(score) {
    if (score >= 85) return { text:"Excellent · Deep Focus",   color:"#38bdf8" };
    if (score >= 70) return { text:"Good Focus",               color:"#34d399" };
    if (score >= 50) return { text:"Unstable Focus",           color:"#fbbf24" };
    return               { text:"Distracted Mode",             color:"#f87171" };
  },
};

// ── Timer ──────────────────────────────────────────────────────
const Timer = {
  start(minutes) {
    State.session.totalSeconds = minutes * 60;
    State.session.seconds      = minutes * 60;
    State.session.elapsed      = 0;
    State.session.startTime    = Date.now();
    State.session.status       = "active";
    State.tickInterval = setInterval(() => Timer.tick(), 1000);
    DistractionTracker.attach();
    Nudge.schedule();
    UI.updateTimerDisplay();
    Storage.saveSession();
  },

  tick() {
    if (State.session.status !== "active") return;
    State.session.seconds--;
    State.session.elapsed++;
    State.session.score = FocusScorer.calculate(State.session);
    UI.updateTimerDisplay();
    if (State.session.seconds <= 0) Timer.complete();
  },

  pause() {
    if (State.session.status !== "active") return;
    State.session.status = "paused";
    State.session.pauses++;
    clearInterval(State.tickInterval);
    DistractionTracker.detach();
    UI.updateTimerDisplay();
    Nudge.cancel();
  },

  resume() {
    if (State.session.status !== "paused") return;
    State.session.status = "active";
    State.tickInterval = setInterval(() => Timer.tick(), 1000);
    DistractionTracker.attach();
    Nudge.schedule();
    UI.updateTimerDisplay();
  },

  complete() {
    State.session.status = "ended";
    Timer._cleanup();
    UI.showSessionResult(true);
    Storage.saveSessionHistory();
    Achievements.check();
  },

  end() {
    State.session.status = "ended";
    Timer._cleanup();
    UI.showSessionResult(false);
    Storage.saveSessionHistory();
    Achievements.check();
  },

  reset() {
    State.session = { ...State.session, status:"idle", seconds:0, elapsed:0,
      distractions:0, pauses:0, idleSeconds:0, score:100, startTime:null };
    Timer._cleanup();
    UI.showSetupPanel();
  },

  _cleanup() {
    clearInterval(State.tickInterval);
    DistractionTracker.detach();
    Nudge.cancel();
  },
};

// ── Distraction Tracker ────────────────────────────────────────
const DistractionTracker = {
  _onHide: null,
  _onBlur: null,

  attach() {
    this._onHide = () => { if (document.hidden) this._record("tab_hidden"); };
    this._onBlur = () => this._record("window_blur");
    document.addEventListener("visibilitychange", this._onHide);
    window.addEventListener("blur", this._onBlur);
  },

  detach() {
    if (this._onHide) document.removeEventListener("visibilitychange", this._onHide);
    if (this._onBlur) window.removeEventListener("blur", this._onBlur);
  },

  _record(type) {
    if (State.session.status !== "active") return;
    State.session.distractions++;
    State.session.score = FocusScorer.calculate(State.session);
    UI.updateLiveStats();
    EventLog.add(type);

    if (State.session.distractions % 3 === 0) {
      Nudge.show("tab-switch");
    }
  },
};

// ── Event Log ──────────────────────────────────────────────────
const EventLog = {
  events: [],
  add(type, value = "") {
    this.events.push({ type, value, ts: Date.now() });
    UI.updateEventLog();
  },
  clear() { this.events = []; },
};

// ── Nudge System ──────────────────────────────────────────────
const NUDGE_MESSAGES = {
  "tab-switch": { title:"Focus Drift Detected",     msg:"You've switched tabs multiple times. Try staying in one window for the next 10 minutes.",   icon:"⚠️" },
  "time-check": { title:"Attention Check-In",        msg:"How's your focus? If you feel your mind wandering, take a 2-minute breathing reset.",        icon:"🧠" },
  "idle":       { title:"Idle Time Detected",        msg:"Looks like you stepped away. Ready to re-enter deep work mode?",                            icon:"⏸️" },
  "halfway":    { title:"Halfway There!",             msg:"You're halfway through your session. Keep your momentum going — you're doing well.",         icon:"🔥" },
  "comeback":   { title:"Stay With It",              msg:"Focus naturally dips at this point. Take one deep breath and return to your task.",           icon:"💡" },
};

const Nudge = {
  schedule() {
    const delays = [
      45000  + Math.random() * 20000,  // ~1 min
      State.session.totalSeconds * 500, // halfway
      90000  + Math.random() * 30000,  // ~2 min
    ];
    const types = ["time-check", "halfway", "comeback"];
    delays.forEach((d, i) => {
      setTimeout(() => {
        if (State.session.status === "active") Nudge.show(types[i]);
      }, d);
    });
  },

  show(type) {
    const n = NUDGE_MESSAGES[type] || NUDGE_MESSAGES["time-check"];
    const el = document.getElementById("nudge-popup");
    if (!el) return;
    el.querySelector(".nudge-icon").textContent  = n.icon;
    el.querySelector(".nudge-title").textContent = n.title;
    el.querySelector(".nudge-msg").textContent   = n.msg;
    el.classList.add("show");
    EventLog.add("nudge", type);
    clearTimeout(State.nudgeTimer);
    State.nudgeTimer = setTimeout(() => Nudge.dismiss(), 7000);
  },

  dismiss() {
    const el = document.getElementById("nudge-popup");
    if (el) el.classList.remove("show");
  },

  cancel() {
    clearTimeout(State.nudgeTimer);
    Nudge.dismiss();
  },
};

// ── UI Controller ─────────────────────────────────────────────
const UI = {
  updateTimerDisplay() {
    const s = State.session;
    const rem = s.seconds;
    const m   = Math.floor(rem / 60).toString().padStart(2,"0");
    const sec = (rem % 60).toString().padStart(2,"0");
    const el  = document.getElementById("focus-timer");
    if (el) el.textContent = `${m}:${sec}`;

    // Ring
    const ring = document.getElementById("focus-ring");
    if (ring) {
      const pct    = s.seconds / (s.totalSeconds || 1);
      const circ   = 603;
      ring.style.strokeDashoffset = circ * (1 - pct);
    }

    this.updateLiveStats();
  },

  updateLiveStats() {
    const s = State.session;
    const el = id => document.getElementById(id);

    if (el("live-score"))        el("live-score").textContent        = s.score;
    if (el("live-distractions")) el("live-distractions").textContent = s.distractions;

    const elapsed = s.elapsed;
    const em = Math.floor(elapsed / 60);
    const es = elapsed % 60;
    if (el("live-elapsed")) el("live-elapsed").textContent = `${em}:${es.toString().padStart(2,"0")}`;

    const lbl = FocusScorer.label(s.score);
    if (el("score-label")) {
      el("score-label").textContent  = lbl.text;
      el("score-label").style.color  = lbl.color;
    }
  },

  updateEventLog() {
    const el = document.getElementById("event-log");
    if (!el) return;
    const last5 = EventLog.events.slice(-5).reverse();
    el.innerHTML = last5.map(e => {
      const icons = { tab_hidden:"📑", window_blur:"🔲", idle:"💤", nudge:"💡", pause:"⏸️", resume:"▶️" };
      const t = new Date(e.ts);
      return `<div class="event-row">${icons[e.type]||"•"} <span>${e.type.replace("_"," ")}</span> <small>${t.getHours()}:${t.getMinutes().toString().padStart(2,"0")}</small></div>`;
    }).join("");
  },

  showSessionResult(completed) {
    const s = State.session;
    const lbl = FocusScorer.label(s.score);
    const el  = id => document.getElementById(id);

    if (el("result-score"))     el("result-score").textContent    = s.score;
    if (el("result-label"))     { el("result-label").textContent  = lbl.text; el("result-label").style.color = lbl.color; }
    if (el("result-dist"))      el("result-dist").textContent     = s.distractions;
    if (el("result-completed")) el("result-completed").textContent = completed ? "Yes ✓" : "Partial";
    if (el("session-result"))   el("session-result").style.display = "block";

    // Hide timer, show result
    const hide = ["session-ring-wrap","live-stats-wrap","session-actions-wrap","session-mode-badge"];
    hide.forEach(id => { const e = document.getElementById(id); if (e) e.style.display = "none"; });
  },

  showSetupPanel() {
    document.getElementById("setup-panel").style.display  = "block";
    document.getElementById("active-session").style.display = "none";
    const restore = ["session-ring-wrap","live-stats-wrap","session-actions-wrap","session-mode-badge"];
    restore.forEach(id => { const e = document.getElementById(id); if (e) e.style.display = ""; });
    const result = document.getElementById("session-result");
    if (result) result.style.display = "none";
    EventLog.clear();
  },
};

// ── Local Storage ─────────────────────────────────────────────
const Storage = {
  KEY_SESSIONS: "dp_sessions",
  KEY_SETTINGS: "dp_settings",
  KEY_STREAK:   "dp_streak",

  saveSession() {
    const s = State.session;
    localStorage.setItem("dp_active_session", JSON.stringify({ ...s, savedAt: Date.now() }));
  },

  saveSessionHistory() {
    const history = this.getSessionHistory();
    const s = State.session;
    history.unshift({
      id:           `s_${Date.now()}`,
      title:        s.title,
      category:     s.category,
      planned:      s.planned,
      actual:       Math.round(s.elapsed / 60),
      score:        s.score,
      label:        FocusScorer.label(s.score).text,
      distractions: s.distractions,
      pauses:       s.pauses,
      completed:    s.status === "ended" && s.seconds <= 0,
      date:         new Date().toISOString(),
    });
    localStorage.setItem(this.KEY_SESSIONS, JSON.stringify(history.slice(0, 100)));
    this.updateStreak();
  },

  getSessionHistory() {
    try { return JSON.parse(localStorage.getItem(this.KEY_SESSIONS)) || []; }
    catch { return []; }
  },

  updateStreak() {
    const today    = new Date().toDateString();
    const streak   = JSON.parse(localStorage.getItem(this.KEY_STREAK) || "{}");
    const last     = streak.lastDate;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (last === today) return;
    streak.current  = (last === yesterday) ? (streak.current || 0) + 1 : 1;
    streak.longest  = Math.max(streak.longest || 0, streak.current);
    streak.lastDate = today;
    localStorage.setItem(this.KEY_STREAK, JSON.stringify(streak));
  },

  getStreak() {
    try { return JSON.parse(localStorage.getItem(this.KEY_STREAK)) || { current:0, longest:0 }; }
    catch { return { current:0, longest:0 }; }
  },
};

// ── Achievements Checker ───────────────────────────────────────
const Achievements = {
  check() {
    const s   = State.session;
    const all = Storage.getSessionHistory();

    if (s.score >= 95) this._unlock("flow_state", "Flow State", "Scored 95+ on a session", "⚡");
    if (all.length >= 10) this._unlock("ten_sessions", "Committed", "Completed 10 sessions", "🎯");
    if (s.planned >= 90 && s.status === "ended" && s.seconds <= 0) this._unlock("deep_diver", "Deep Diver", "Completed a 90-min session", "🚀");
  },

  _unlock(key, name, desc, emoji) {
    const stored = JSON.parse(localStorage.getItem("dp_achievements") || "{}");
    if (stored[key]) return;
    stored[key] = { name, desc, emoji, unlockedAt: new Date().toISOString() };
    localStorage.setItem("dp_achievements", JSON.stringify(stored));
    this._showBanner(name, emoji);
  },

  _showBanner(name, emoji) {
    const banner = document.createElement("div");
    banner.innerHTML = `<div style="position:fixed;top:1.5rem;left:50%;transform:translateX(-50%);background:#0d1320;border:0.5px solid rgba(56,189,248,0.4);border-radius:12px;padding:0.9rem 1.4rem;display:flex;align-items:center;gap:0.75rem;z-index:9999;animation:slideUp 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5)">
      <span style="font-size:1.4rem">${emoji}</span>
      <div><div style="font-family:'Syne',sans-serif;font-size:0.85rem;font-weight:700;color:#38bdf8">Achievement Unlocked!</div>
      <div style="font-size:0.8rem;color:#94a3b8">${name}</div></div></div>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 4000);
  },
};

// ── Global API (called from HTML) ─────────────────────────────
window.DP = {
  startSession(title, category, minutes) {
    State.session.title    = title;
    State.session.category = category;
    State.session.planned  = minutes;
    State.session.distractions = 0;
    State.session.pauses   = 0;
    State.session.idleSeconds  = 0;
    State.session.score    = 100;

    document.getElementById("setup-panel").style.display   = "none";
    document.getElementById("active-session").style.display = "block";

    const titleEl = document.getElementById("session-task-title");
    if (titleEl) titleEl.textContent = title;

    Timer.start(minutes);
  },

  pause()  { Timer.pause();  document.getElementById("pause-btn").textContent = "▶ Resume";  },
  resume() { Timer.resume(); document.getElementById("pause-btn").textContent = "⏸ Pause";   },
  togglePause() {
    if (State.session.status === "active")  this.pause();
    else if (State.session.status === "paused") this.resume();
  },
  end()    { Timer.end();   },
  reset()  { Timer.reset(); },
  dismissNudge() { Nudge.dismiss(); },

  getScore()  { return State.session.score; },
  getStatus() { return State.session.status; },
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DeepPulse script.js loaded");
});
