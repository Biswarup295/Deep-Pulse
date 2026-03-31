// ============================================================
// Supabase Client Configuration
// ============================================================

const supabaseUrl = 'https://xrvjjcfecjyeidlhujfk.supabase.co'
const supabaseAnonKey = 'sb_publishable_alkhTOsQZcVlk6esMhQ_Yw_9o0ZA2yz'

// Initialize Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)

// Auth Helpers
const SupabaseAuth = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async signOut() {
    await supabase.auth.signOut()
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async onAuthChange(callback) {
    supabase.auth.onAuthStateChange(callback)
  }
}

// Session Management
const SupabaseStorage = {
  async saveSession(userId, sessionData) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        title: sessionData.title,
        category: sessionData.category,
        planned_minutes: sessionData.planned,
        actual_minutes: Math.floor(sessionData.elapsed / 60),
        distractions: sessionData.distractions,
        pauses: sessionData.pauses,
        idle_seconds: sessionData.idleSeconds,
        score: sessionData.score,
        completed: sessionData.status === 'ended',
        start_time: new Date(sessionData.startTime),
        created_at: new Date()
      }])
    
    if (error) console.error('Error saving session:', error)
    return { data, error }
  },

  async getSessions(userId, limit = 100) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) console.error('Error fetching sessions:', error)
    return data || []
  },

  async getMoodLogs(userId) {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching mood logs:', error)
    return data || []
  },

  async saveMoodLog(userId, mood, energy, notes) {
    const { data, error } = await supabase
      .from('mood_logs')
      .insert([{
        user_id: userId,
        mood: mood,
        energy: energy,
        notes: notes,
        created_at: new Date()
      }])
    
    if (error) console.error('Error saving mood log:', error)
    return { data, error }
  }
}

export { supabase, SupabaseAuth, SupabaseStorage }
