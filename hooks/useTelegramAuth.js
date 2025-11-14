// hooks/useTelegramAuth.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useTelegramAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [telegramData, setTelegramData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkTelegramAuth()
  }, [])

  const checkTelegramAuth = async () => {
    try {
      // Wait for Telegram Web App to initialize
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        
        // Initialize Telegram Web App
        tg.expand()
        tg.enableClosingConfirmation()
        
        // Get init data
        const initData = tg.initDataUnsafe
        console.log('Telegram Init Data:', initData)
        
        if (initData?.user) {
          setTelegramData(initData)
          await handleTelegramUser(initData.user)
        } else {
          // No user data - not launched from Telegram
          console.log('Not launched from Telegram Mini App')
          setLoading(false)
        }
      } else {
        // Telegram Web App not available
        console.log('Telegram Web App not available')
        setLoading(false)
      }
    } catch (error) {
      console.error('Telegram auth error:', error)
      setLoading(false)
    }
  }

  const handleTelegramUser = async (tgUser) => {
    try {
      setLoading(true)
      
      // Check if user exists in database
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tgUser.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // User doesn't exist - create new user
        console.log('Creating new user...')
        const newUser = await createNewUser(tgUser)
        setUser(newUser)
        toast.success('Welcome! Account created successfully.')
      } else if (existingUser) {
        // User exists - check if blocked
        if (existingUser.is_blocked) {
          toast.error('Your account has been blocked. Contact support.')
          setLoading(false)
          return
        }
        console.log('User exists:', existingUser)
        setUser(existingUser)
        toast.success(`Welcome back, ${existingUser.first_name}!`)
      } else if (error) {
        throw error
      }
    } catch (error) {
      console.error('User handling error:', error)
      toast.error('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createNewUser = async (tgUser) => {
    const referCode = generateReferCode()
    
    const userData = {
      telegram_id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name || '',
      photo_url: tgUser.photo_url,
      refer_code: referCode,
      is_admin: tgUser.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME
    }

    console.log('Creating user with data:', userData)

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`User creation failed: ${error.message}`)
    }

    return newUser
  }

  const generateReferCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const logout = () => {
    setUser(null)
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close()
    }
  }

  const refreshUser = async () => {
    if (user) {
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.telegram_id)
        .single()
      setUser(updatedUser)
    }
  }

  return {
    user,
    telegramData,
    loading,
    logout,
    refreshUser,
    isAuthenticated: !!user
  }
                    }
