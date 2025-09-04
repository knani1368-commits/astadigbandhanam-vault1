import { create } from 'zustand'
import { SecurityFeature, SecurityDirection, SecurityDashboard, PasswordStrengthAnalysis, BreachCheck } from '@/types'
import { securityService } from '@/services/securityService'
import toast from 'react-hot-toast'

interface SecurityState {
  features: SecurityFeature[]
  dashboard: SecurityDashboard | null
  isLoading: boolean
  error: string | null
  selectedFeature: SecurityFeature | null
}

interface SecurityActions {
  fetchFeatures: () => Promise<void>
  fetchDashboard: () => Promise<void>
  updateFeature: (direction: SecurityDirection, updates: Partial<SecurityFeature>) => Promise<void>
  enableTwoFactor: () => Promise<any>
  verifyTwoFactor: (token: string) => Promise<void>
  disableTwoFactor: () => Promise<void>
  analyzePasswordStrength: (password: string) => Promise<PasswordStrengthAnalysis>
  checkPasswordBreach: (password: string) => Promise<BreachCheck>
  enableVaultEncryption: (algorithm?: 'aes' | 'xchacha') => Promise<void>
  enableWatchtowerAI: () => Promise<void>
  setSelectedFeature: (feature: SecurityFeature | null) => void
  clearError: () => void
}

type SecurityStore = SecurityState & SecurityActions

export const useSecurityStore = create<SecurityStore>((set, get) => ({
  // Initial state
  features: [],
  dashboard: null,
  isLoading: false,
  error: null,
  selectedFeature: null,

  // Actions
  fetchFeatures: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await securityService.getSecurityFeatures()
      
      set({
        features: response.features,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch security features'
      set({
        features: [],
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
    }
  },

  fetchDashboard: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await securityService.getSecurityDashboard()
      
      set({
        dashboard: response,
        features: response.features,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch security dashboard'
      set({
        dashboard: null,
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
    }
  },

  updateFeature: async (direction: SecurityDirection, updates: Partial<SecurityFeature>) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await securityService.updateSecurityFeature(direction, updates)
      
      set((state) => ({
        features: state.features.map(feature => 
          feature.direction === direction ? response.feature : feature
        ),
        dashboard: state.dashboard ? {
          ...state.dashboard,
          securityScore: response.securityScore,
          features: state.dashboard.features.map(feature => 
            feature.direction === direction ? response.feature : feature
          ),
        } : null,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Security feature updated successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update security feature'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  enableTwoFactor: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await securityService.enableTwoFactor()
      
      set({
        isLoading: false,
        error: null,
      })
      
      toast.success('Two-factor authentication setup initiated!')
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to enable two-factor authentication'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  verifyTwoFactor: async (token: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await securityService.verifyTwoFactor(token)
      
      set({
        isLoading: false,
        error: null,
      })
      
      toast.success('Two-factor authentication verified successfully!')
      
      // Refresh features to get updated 2FA status
      await get().fetchFeatures()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify two-factor authentication'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  disableTwoFactor: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await securityService.disableTwoFactor()
      
      set({
        isLoading: false,
        error: null,
      })
      
      toast.success('Two-factor authentication disabled successfully!')
      
      // Refresh features to get updated 2FA status
      await get().fetchFeatures()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to disable two-factor authentication'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  analyzePasswordStrength: async (password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await securityService.analyzePasswordStrength(password)
      
      set({
        isLoading: false,
        error: null,
      })
      
      return response.strength
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze password strength'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  checkPasswordBreach: async (password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await securityService.checkPasswordBreach(password)
      
      set({
        isLoading: false,
        error: null,
      })
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to check password breach'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  enableVaultEncryption: async (algorithm: 'aes' | 'xchacha' = 'aes') => {
    set({ isLoading: true, error: null })
    
    try {
      await securityService.enableVaultEncryption(algorithm)
      
      set({
        isLoading: false,
        error: null,
      })
      
      toast.success('Vault encryption enabled successfully!')
      
      // Refresh features to get updated encryption status
      await get().fetchFeatures()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to enable vault encryption'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  enableWatchtowerAI: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await securityService.enableWatchtowerAI()
      
      set({
        isLoading: false,
        error: null,
      })
      
      toast.success('Watchtower AI enabled successfully!')
      
      // Refresh features to get updated Watchtower status
      await get().fetchFeatures()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to enable Watchtower AI'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  setSelectedFeature: (feature: SecurityFeature | null) => {
    set({ selectedFeature: feature })
  },

  clearError: () => {
    set({ error: null })
  },
}))
