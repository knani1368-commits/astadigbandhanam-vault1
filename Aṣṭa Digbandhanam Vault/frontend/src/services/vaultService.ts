import { api } from './api'
import { VaultItem, VaultItemType, VaultItemData } from '@/types'

interface VaultItemFilters {
  type?: VaultItemType
  tags?: string[]
  favorite?: boolean
  search?: string
}

interface CreateVaultItemRequest {
  type: VaultItemType
  data: VaultItemData
  tags: string[]
  favorite: boolean
  masterPassword: string
  algorithm?: 'aes' | 'xchacha'
}

interface UpdateVaultItemRequest {
  data?: VaultItemData
  tags?: string[]
  favorite?: boolean
  masterPassword: string
  algorithm?: 'aes' | 'xchacha'
}

interface ImportVaultRequest {
  importData: any
  masterPassword: string
  algorithm?: 'aes' | 'xchacha'
}

class VaultService {
  async getVaultItems(filters: VaultItemFilters = {}): Promise<{ items: VaultItem[]; count: number }> {
    const params = new URLSearchParams()
    
    if (filters.type) params.append('type', filters.type)
    if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag))
    if (filters.favorite !== undefined) params.append('favorite', filters.favorite.toString())
    if (filters.search) params.append('search', filters.search)
    
    const response = await api.get(`/vault/items?${params.toString()}`)
    return response.data.data
  }

  async getVaultItem(id: string, masterPassword: string): Promise<VaultItem> {
    const response = await api.get(`/vault/items/${id}`, {
      data: { masterPassword }
    })
    return response.data.data
  }

  async createVaultItem(item: CreateVaultItemRequest): Promise<VaultItem> {
    const response = await api.post('/vault/items', item)
    return response.data.data
  }

  async updateVaultItem(id: string, updates: UpdateVaultItemRequest): Promise<VaultItem> {
    const response = await api.put(`/vault/items/${id}`, updates)
    return response.data.data
  }

  async deleteVaultItem(id: string): Promise<void> {
    await api.delete(`/vault/items/${id}`)
  }

  async exportVault(masterPassword: string): Promise<any> {
    const response = await api.get('/vault/export', {
      data: { masterPassword }
    })
    return response.data.data
  }

  async importVault(importRequest: ImportVaultRequest): Promise<{ importedCount: number; items: VaultItem[] }> {
    const response = await api.post('/vault/import', importRequest)
    return response.data.data
  }
}

export const vaultService = new VaultService()
