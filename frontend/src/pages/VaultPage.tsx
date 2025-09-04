import React, { useState, useEffect } from 'react'
import { useVaultStore } from '@/store/vaultStore'
import { VaultItemType } from '@/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export const VaultPage: React.FC = () => {
  const {
    items,
    isLoading,
    searchQuery,
    selectedType,
    selectedTags,
    showFavoritesOnly,
    fetchItems,
    setSearchQuery,
    setSelectedType,
    setShowFavoritesOnly,
    deleteItem
  } = useVaultStore()

  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchItems()
  }

  const handleTypeFilter = (type: VaultItemType | null) => {
    setSelectedType(type)
    fetchItems()
  }

  const handleFavoritesFilter = (show: boolean) => {
    setShowFavoritesOnly(show)
    fetchItems()
  }

  const getItemIcon = (type: VaultItemType) => {
    const icons = {
      [VaultItemType.LOGIN]: '🔐',
      [VaultItemType.SECURE_NOTE]: '📝',
      [VaultItemType.PAYMENT_CARD]: '💳',
      [VaultItemType.IDENTITY]: '👤',
    }
    return icons[type] || '🔒'
  }

  const getItemTypeLabel = (type: VaultItemType) => {
    const labels = {
      [VaultItemType.LOGIN]: 'Login',
      [VaultItemType.SECURE_NOTE]: 'Secure Note',
      [VaultItemType.PAYMENT_CARD]: 'Payment Card',
      [VaultItemType.IDENTITY]: 'Identity',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vault
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your encrypted secrets and passwords
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vault items..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={selectedType || ''}
                onChange={(e) => handleTypeFilter(e.target.value as VaultItemType || null)}
                className="input"
              >
                <option value="">All Types</option>
                <option value={VaultItemType.LOGIN}>Logins</option>
                <option value={VaultItemType.SECURE_NOTE}>Secure Notes</option>
                <option value={VaultItemType.PAYMENT_CARD}>Payment Cards</option>
                <option value={VaultItemType.IDENTITY}>Identities</option>
              </select>
            </div>

            {/* Favorites Filter */}
            <button
              onClick={() => handleFavoritesFilter(!showFavoritesOnly)}
              className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
            >
              <StarIcon className={`h-5 w-5 mr-2 ${showFavoritesOnly ? 'text-yellow-500' : ''}`} />
              Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Vault Items Grid */}
      {items.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              🔒
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No vault items found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedType || showFavoritesOnly
                ? 'Try adjusting your filters to see more items.'
                : 'Get started by adding your first secure item to the vault.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="vault-item">
              <div className="card-body">
                <div className="vault-item-header">
                  <div className="flex items-center space-x-3">
                    <div className="vault-item-icon bg-primary-500">
                      <span className="text-lg">{getItemIcon(item.type)}</span>
                    </div>
                    <div>
                      <h3 className="vault-item-title">
                        {getItemTypeLabel(item.type)}
                      </h3>
                      <p className="vault-item-subtitle">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.favorite && (
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {item.tags.length > 0 && (
                  <div className="vault-item-tags">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="vault-item-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Last updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  <span className="capitalize">{item.algorithm}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New Vault Item
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature will be implemented in the full version.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-primary"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
