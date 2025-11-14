// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
export const getUserByTelegramId = async (telegramId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()
  return { data, error }
}

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  return { data, error }
}

export const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}
