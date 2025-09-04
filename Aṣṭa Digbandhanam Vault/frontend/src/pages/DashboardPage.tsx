import React, { useEffect, useState } from 'react'
import { useSecurityStore } from '@/store/securityStore'
import { useVaultStore } from '@/store/vaultStore'
import { useAuthStore } from '@/store/authStore'
import { SecurityMandala } from '@/components/SecurityMandala'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { 
    dashboard, 
    isLoading: securityLoading, 
    fetchDashboard 
  } = useSecurityStore()
  const { 
    items, 
    isLoading: vaultLoading, 
    fetchItems 
  } = useVaultStore()

  useEffect(() => {
    fetchDashboard()
    fetchItems()
  }, [fetchDashboard, fetchItems])

  const isLoading = securityLoading || vaultLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600 dark:text-green-400', icon: CheckCircleIcon }
    if (score >= 60) return { level: 'Good', color: 'text-blue-600 dark:text-blue-400', icon: ShieldCheckIcon }
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', icon: ExclamationTriangleIcon }
    return { level: 'Poor', color: 'text-red-600 dark:text-red-400', icon: ExclamationTriangleIcon }
  }

  const securityLevel = getSecurityLevel(dashboard?.securityScore || 0)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Your digital fortress is protected by Aṣṭa Digbandhanam
        </p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Security Score
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${securityLevel.color}`}>
                    {dashboard?.securityScore || 0}%
                  </span>
                  <securityLevel.icon className={`h-5 w-5 ${securityLevel.color}`} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {securityLevel.level} protection level
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LockClosedIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Vault Items
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {items.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Securely stored secrets
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Active Features
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboard?.enabledFeatures || 0}/{dashboard?.totalFeatures || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Security features enabled
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Mandala */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Aṣṭa Digbandhanam Security Mandala
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Interactive visualization of your eight-directional security protection
          </p>
        </div>
        <div className="card-body">
          <SecurityMandala 
            features={dashboard?.features || []}
            className="flex justify-center"
          />
        </div>
      </div>

      {/* Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vault Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Vault Items
            </h3>
          </div>
          <div className="card-body">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No vault items yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start by adding your first secure item to the vault.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {item.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.type}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {item.favorite && (
                      <div className="flex-shrink-0">
                        <span className="text-yellow-500">★</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Security Recommendations
            </h3>
          </div>
          <div className="card-body">
            {dashboard?.recommendations && dashboard.recommendations.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recommendations.slice(0, 5).map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {recommendation.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {recommendation.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  All security features optimized
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your security configuration is excellent!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-primary">
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Add Vault Item
            </button>
            <button className="btn-secondary">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Security Settings
            </button>
            <button className="btn-secondary">
              <ClockIcon className="h-5 w-5 mr-2" />
              View Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
