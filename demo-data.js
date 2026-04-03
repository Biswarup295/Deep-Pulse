// ============================================================
// DeepPulse — Demo Data (Hackathon Judge Mode)
// Loads realistic session history, analytics, and user profile
// ============================================================

const DEMO_USER = {
  id: "demo-user-001",
  name: "Biswarup Mondal",
  email: "biswarupmondal295@gmail.com",
  avatar: "BM",
  joinedDate: "2025-01-10",
  level: 7,
  levelName: "Deep Focuser",
  xp: 1240,
  xpToNext: 2000,
  dailyGoalMinutes: 300,
  preferredDuration: 25,
  timezone: "Asia/Kolkata"
};

const DEMO_SESSIONS = [
  { id:"s01", title:"Landing Page Design", category:"Coding",   planned:50, actual:50, score:91, label:"Excellent", distractions:2,  pauses:0, idle:45,  completed:true,  date:"2025-03-30", hour:20 },
  { id:"s02", title:"Research: Focus Techniques", category:"Research", planned:25, actual:25, score:78, label:"Good",      distractions:4,  pauses:1, idle:120, completed:true,  date:"2025-03-30", hour:14 },
  { id:"s03", title:"System Architecture Doc",    category:"Writing",  planned:90, actual:87, score:72, label:"Good",      distractions:6,  pauses:2, idle:200, completed:true,  date:"2025-03-29", hour:21 },
  { id:"s04", title:"Chapter 4 Reading",          category:"Study",    planned:25, actual:18, score:54, label:"Fair",      distractions:9,  pauses:3, idle:310, completed:false, date:"2025-03-29", hour:11 },
  { id:"s05", title:"API Route Development",      category:"Coding",   planned:50, actual:50, score:94, label:"Excellent", distractions:1,  pauses:0, idle:20,  completed:true,  date:"2025-03-28", hour:20 },
  { id:"s06", title:"Database Schema Design",     category:"Coding",   planned:25, actual:25, score:88, label:"Excellent", distractions:2,  pauses:0, idle:40,  completed:true,  date:"2025-03-28", hour:19 },
  { id:"s07", title:"Essay Draft - Chapter 2",    category:"Writing",  planned:50, actual:42, score:66, label:"Good",      distractions:7,  pauses:2, idle:180, completed:false, date:"2025-03-27", hour:15 },
  { id:"s08", title:"Data Structures Revision",   category:"Study",    planned:25, actual:25, score:81, label:"Good",      distractions:3,  pauses:1, idle:90,  completed:true,  date:"2025-03-27", hour:20 },
  { id:"s09", title:"React Component Library",    category:"Coding",   planned:90, actual:90, score:89, label:"Excellent", distractions:3,  pauses:1, idle:60,  completed:true,  date:"2025-03-26", hour:21 },
  { id:"s10", title:"Market Research Notes",      category:"Research", planned:25, actual:20, score:61, label:"Fair",      distractions:8,  pauses:2, idle:230, completed:false, date:"2025-03-26", hour:13 },
  { id:"s11", title:"Algorithm Practice",         category:"Coding",   planned:50, actual:50, score:92, label:"Excellent", distractions:2,  pauses:0, idle:30,  completed:true,  date:"2025-03-25", hour:20 },
  { id:"s12", title:"Technical Blog Post",        category:"Writing",  planned:50, actual:48, score:75, label:"Good",      distractions:5,  pauses:1, idle:140, completed:true,  date:"2025-03-25", hour:17 },
  { id:"s13", title:"Machine Learning Paper",     category:"Research", planned:25, actual:25, score:83, label:"Good",      distractions:3,  pauses:0, idle:70,  completed:true,  date:"2025-03-24", hour:21 },
  { id:"s14", title:"JavaScript Deep Dive",       category:"Study",    planned:90, actual:75, score:70, label:"Good",      distractions:8,  pauses:3, idle:250, completed:false, date:"2025-03-24", hour:10 },
  { id:"s15", title:"Backend API Testing",        category:"Coding",   planned:25, actual:25, score:87, label:"Excellent", distractions:2,  pauses:0, idle:50,  completed:true,  date:"2025-03-23", hour:20 },
  { id:"s16", title:"Creative Brief Writing",     category:"Writing",  planned:25, actual:22, score:68, label:"Good",      distractions:6,  pauses:1, idle:160, completed:false, date:"2025-03-23", hour:14 },
  { id:"s17", title:"Product Roadmap Reading",    category:"Reading",  planned:25, actual:25, score:79, label:"Good",      distractions:4,  pauses:0, idle:80,  completed:true,  date:"2025-03-22", hour:19 },
  { id:"s18", title:"UI Component Design",        category:"Coding",   planned:50, actual:50, score:90, label:"Excellent", distractions:2,  pauses:0, idle:35,  completed:true,  date:"2025-03-22", hour:21 },
];

const DEMO_WEEKLY_FOCUS = [
  { day:"Mon", hours:2.5, score:71 },
  { day:"Tue", hours:3.8, score:79 },
  { day:"Wed", hours:1.2, score:58 },
  { day:"Thu", hours:4.1, score:83 },
  { day:"Fri", hours:3.3, score:77 },
  { day:"Sat", hours:2.9, score:75 },
  { day:"Sun", hours:3.5, score:84 },
];

const DEMO_STAMINA = [
  { week:"W1", avgMin:18 },
  { week:"W2", avgMin:22 },
  { week:"W3", avgMin:20 },
  { week:"W4", avgMin:28 },
  { week:"W5", avgMin:31 },
  { week:"W6", avgMin:35 },
  { week:"W7", avgMin:38 },
  { week:"W8", avgMin:44 },
];

const DEMO_HEATMAP = [3,7,1,5,4,2,6,8,2,4,6,3,7,5,1,3,9,4,2,6,3,4,2,5,7,3,1,4];

const DEMO_MOOD_LOGS = [
  { date:"2025-03-30", sessionId:"s01", before:4, after:5, energy:4, note:"Great session, felt in flow" },
  { date:"2025-03-30", sessionId:"s02", before:3, after:4, energy:3, note:"Started slow but got into it" },
  { date:"2025-03-29", sessionId:"s03", before:4, after:4, energy:4, note:"Solid writing session" },
  { date:"2025-03-29", sessionId:"s04", before:2, after:3, energy:2, note:"Tired, too many distractions" },
  { date:"2025-03-28", sessionId:"s05", before:5, after:5, energy:5, note:"Peak performance evening" },
];

const DEMO_STREAK = {
  current: 4,
  longest: 9,
  lastFocusDate: "2025-03-30",
  history: [true, true, true, true, false, false, false], // Mon–Sun this week
};

const DEMO_ACHIEVEMENTS = [
  { key:"early_bird",    name:"Early Bird",     emoji:"🌅", desc:"5 sessions before 9 AM",    unlocked:true,  unlockedAt:"2025-02-14" },
  { key:"on_fire",       name:"On Fire",        emoji:"🔥", desc:"7-day streak",               unlocked:true,  unlockedAt:"2025-03-01" },
  { key:"flow_state",    name:"Flow State",     emoji:"⚡", desc:"Score 95+ on a session",     unlocked:true,  unlockedAt:"2025-03-15" },
  { key:"diamond_focus", name:"Diamond Focus",  emoji:"💎", desc:"10+ hours in one week",      unlocked:true,  unlockedAt:"2025-03-22" },
  { key:"deep_diver",    name:"Deep Diver",     emoji:"🚀", desc:"Complete a 90-min session",  unlocked:false, unlockedAt:null },
  { key:"mind_master",   name:"Mind Master",    emoji:"🧠", desc:"Average score 90+ for a week", unlocked:false, unlockedAt:null },
  { key:"night_owl",     name:"Night Owl",      emoji:"🌙", desc:"10 sessions after 10 PM",    unlocked:false, unlockedAt:null },
  { key:"summit",        name:"Summit",         emoji:"🏔️", desc:"30-day streak",              unlocked:false, unlockedAt:null },
];

// ── Computed Stats ───────────────────────────────────────────
const DEMO_STATS = (() => {
  const completed = DEMO_SESSIONS.filter(s => s.completed);
  const totalMin = DEMO_SESSIONS.reduce((a,s) => a + s.actual, 0);
  const avgScore = Math.round(DEMO_SESSIONS.reduce((a,s) => a + s.score, 0) / DEMO_SESSIONS.length);
  const completionRate = Math.round((completed.length / DEMO_SESSIONS.length) * 100);
  const longestSession = Math.max(...DEMO_SESSIONS.map(s => s.actual));
  const totalDistractions = DEMO_SESSIONS.reduce((a,s) => a + s.distractions, 0);
  const avgDistractions = (totalDistractions / DEMO_SESSIONS.length).toFixed(1);

  // Category breakdown
  const cats = {};
  DEMO_SESSIONS.forEach(s => {
    if (!cats[s.category]) cats[s.category] = { count:0, totalScore:0 };
    cats[s.category].count++;
    cats[s.category].totalScore += s.score;
  });
  const categoryStats = Object.entries(cats).map(([cat, d]) => ({
    category: cat, count: d.count, avgScore: Math.round(d.totalScore / d.count)
  })).sort((a,b) => b.avgScore - a.avgScore);

  // Best focus hour
  const hourScores = {};
  DEMO_SESSIONS.forEach(s => {
    if (!hourScores[s.hour]) hourScores[s.hour] = [];
    hourScores[s.hour].push(s.score);
  });
  const bestHour = Object.entries(hourScores)
    .map(([h, scores]) => ({ hour: parseInt(h), avg: scores.reduce((a,b)=>a+b,0)/scores.length }))
    .sort((a,b) => b.avg - a.avg)[0];

  return {
    totalMinutes: totalMin,
    totalHours: (totalMin / 60).toFixed(1),
    avgScore,
    completionRate,
    longestSession,
    avgDistractions,
    categoryStats,
    bestHour: bestHour?.hour,
    todayFocusMin: 195,   // 3h 20m seeded
    todayDistractions: 7,
    todayScore: 84,
  };
})();

// ── Export ───────────────────────────────────────────────────
window.DEMO = {
  user:      DEMO_USER,
  sessions:  DEMO_SESSIONS,
  weekly:    DEMO_WEEKLY_FOCUS,
  stamina:   DEMO_STAMINA,
  heatmap:   DEMO_HEATMAP,
  moodLogs:  DEMO_MOOD_LOGS,
  streak:    DEMO_STREAK,
  achievements: DEMO_ACHIEVEMENTS,
  stats:     DEMO_STATS,
};

console.log("✅ DeepPulse demo data loaded:", DEMO.stats);
