import { api } from './api'
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    return response.data.data
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/register', credentials)
    return response.data.data
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data.data
  }

  async getProfile(): Promise<any> {
    const response = await api.get('/auth/me')
    return response.data.data.user
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  }

  async changeMasterPassword(currentMasterPassword: string, newMasterPassword: string): Promise<void> {
    await api.put('/auth/change-master-password', {
      currentMasterPassword,
      newMasterPassword,
    })
  }
}

export const authService = new AuthService()
