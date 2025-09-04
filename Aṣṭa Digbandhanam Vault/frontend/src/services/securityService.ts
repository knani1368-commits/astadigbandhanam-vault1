import { api } from './api'
import { SecurityFeature, SecurityDirection, SecurityDashboard, PasswordStrengthAnalysis, BreachCheck } from '@/types'

interface UpdateSecurityFeatureRequest {
  enabled?: boolean
  score?: number
  configuration?: Record<string, any>
}

class SecurityService {
  async getSecurityFeatures(): Promise<{ features: SecurityFeature[]; securityScore: number }> {
    const response = await api.get('/security/features')
    return response.data.data
  }

  async getSecurityDashboard(): Promise<SecurityDashboard> {
    const response = await api.get('/security/dashboard')
    return response.data.data
  }

  async updateSecurityFeature(direction: SecurityDirection, updates: UpdateSecurityFeatureRequest): Promise<{ feature: SecurityFeature; securityScore: number }> {
    const response = await api.put(`/security/features/${direction}`, updates)
    return response.data.data
  }

  async enableTwoFactor(): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await api.post('/security/two-factor/enable')
    return response.data.data
  }

  async verifyTwoFactor(token: string): Promise<void> {
    await api.post('/security/two-factor/verify', { token })
  }

  async disableTwoFactor(): Promise<void> {
    await api.delete('/security/two-factor/disable')
  }

  async analyzePasswordStrength(password: string): Promise<{ strength: PasswordStrengthAnalysis; breach: BreachCheck }> {
    const response = await api.post('/security/analyze-password', { password })
    return response.data.data
  }

  async checkPasswordBreach(password: string): Promise<BreachCheck> {
    const response = await api.post('/security/check-breach', { password })
    return response.data.data
  }

  async enableVaultEncryption(algorithm: 'aes' | 'xchacha' = 'aes'): Promise<void> {
    await api.post('/security/vault-encryption/enable', { algorithm })
  }

  async enableWatchtowerAI(): Promise<void> {
    await api.post('/security/watchtower/enable')
  }
}

export const securityService = new SecurityService()
