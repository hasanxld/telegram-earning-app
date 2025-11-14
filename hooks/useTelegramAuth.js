// hooks/useTelegramAuth.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUserByTelegramId, createUser } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useTelegramAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [telegramUser, setTelegramUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    initTelegramAuth()
  }, [])

  const initTelegramAuth = async () => {
    try {
      // Wait for Telegram Web App to load
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.expand()
        tg.enableClosingConfirmation()

        const initData = tg.initDataUnsafe
        if (initData?.user) {
          setTelegramUser(initData.user)
          await handleTelegramLogin(initData.user)
        } else {
          // Not in Telegram context, show login page
          setLoading(false)
        }
      } else {
        // Not in Telegram context
        setLoading(false)
      }
    } catch (error) {
      console.error('Telegram auth error:', error)
      setLoading(false)
    }
  }

  const handleTelegramLogin = async (tgUser) => {
    try {
      setLoading(true)
      
      // Check if user exists
      const { data: existingUser, error } = await getUserByTelegramId(tgUser.id)

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create new user
        const newUser = await createNewUser(tgUser)
        setUser(newUser)
        toast.success('Account created successfully!')
      } else if (existingUser) {
        // User exists
        if (existingUser.is_blocked) {
          toast.error('Your account has been blocked')
          return
        }
        setUser(existingUser)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
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
      last_name: tgUser.last_name,
      photo_url: tgUser.photo_url,
      refer_code: referCode,
      is_admin: tgUser.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME
    }

    const { data: newUser, error } = await createUser(userData)
    
    if (error) {
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
    setTelegramUser(null)
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close()
    }
  }

  const refreshUser = async () => {
    if (user) {
      const { data: updatedUser } = await getUserByTelegramId(user.telegram_id)
      setUser(updatedUser)
    }
  }

  return {
    user,
    telegramUser,
    loading,
    logout,
    refreshUser,
    isAuthenticated: !!user
  }
      }
