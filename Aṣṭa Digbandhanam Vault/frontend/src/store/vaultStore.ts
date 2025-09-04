import { create } from 'zustand'
import { VaultItem, VaultItemType, VaultItemData } from '@/types'
import { vaultService } from '@/services/vaultService'
import toast from 'react-hot-toast'

interface VaultState {
  items: VaultItem[]
  isLoading: boolean
  error: string | null
  selectedItem: VaultItem | null
  searchQuery: string
  selectedType: VaultItemType | null
  selectedTags: string[]
  showFavoritesOnly: boolean
}

interface VaultActions {
  fetchItems: () => Promise<void>
  getItem: (id: string, masterPassword: string) => Promise<VaultItem | null>
  createItem: (item: Partial<VaultItem>, masterPassword: string) => Promise<void>
  updateItem: (id: string, updates: Partial<VaultItem>, masterPassword: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  setSelectedItem: (item: VaultItem | null) => void
  setSearchQuery: (query: string) => void
  setSelectedType: (type: VaultItemType | null) => void
  setSelectedTags: (tags: string[]) => void
  setShowFavoritesOnly: (show: boolean) => void
  clearError: () => void
  exportVault: (masterPassword: string) => Promise<any>
  importVault: (importData: any, masterPassword: string) => Promise<void>
}

type VaultStore = VaultState & VaultActions

export const useVaultStore = create<VaultStore>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,
  searchQuery: '',
  selectedType: null,
  selectedTags: [],
  showFavoritesOnly: false,

  // Actions
  fetchItems: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await vaultService.getVaultItems({
        type: get().selectedType,
        tags: get().selectedTags,
        favorite: get().showFavoritesOnly ? true : undefined,
        search: get().searchQuery,
      })
      
      set({
        items: response.items,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch vault items'
      set({
        items: [],
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
    }
  },

  getItem: async (id: string, masterPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await vaultService.getVaultItem(id, masterPassword)
      
      set({
        selectedItem: response,
        isLoading: false,
        error: null,
      })
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get vault item'
      set({
        selectedItem: null,
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      return null
    }
  },

  createItem: async (item: Partial<VaultItem>, masterPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await vaultService.createVaultItem({
        ...item,
        masterPassword,
      } as any)
      
      set((state) => ({
        items: [response, ...state.items],
        isLoading: false,
        error: null,
      }))
      
      toast.success('Vault item created successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create vault item'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  updateItem: async (id: string, updates: Partial<VaultItem>, masterPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await vaultService.updateVaultItem(id, {
        ...updates,
        masterPassword,
      } as any)
      
      set((state) => ({
        items: state.items.map(item => 
          item.id === id ? response : item
        ),
        selectedItem: state.selectedItem?.id === id ? response : state.selectedItem,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Vault item updated successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update vault item'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await vaultService.deleteVaultItem(id)
      
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Vault item deleted successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete vault item'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  setSelectedItem: (item: VaultItem | null) => {
    set({ selectedItem: item })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setSelectedType: (type: VaultItemType | null) => {
    set({ selectedType: type })
  },

  setSelectedTags: (tags: string[]) => {
    set({ selectedTags: tags })
  },

  setShowFavoritesOnly: (show: boolean) => {
    set({ showFavoritesOnly: show })
  },

  clearError: () => {
    set({ error: null })
  },

  exportVault: async (masterPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await vaultService.exportVault(masterPassword)
      
      set({
        isLoading: false,
        error: null,
      })
      
      toast.success('Vault exported successfully!')
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to export vault'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  importVault: async (importData: any, masterPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await vaultService.importVault({
        importData,
        masterPassword,
      })
      
      set({
        items: [...get().items, ...response.items],
        isLoading: false,
        error: null,
      })
      
      toast.success(`Vault imported successfully! ${response.importedCount} items imported.`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to import vault'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },
}))
