import React, { useEffect, useState } from 'react'
import { useSecurityStore } from '@/store/securityStore'
import { SecurityMandala } from '@/components/SecurityMandala'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'

export const SecurityPage: React.FC = () => {
  const {
    dashboard,
    isLoading,
    fetchDashboard,
    enableTwoFactor,
    disableTwoFactor,
    updateFeature
  } = useSecurityStore()

  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; qrCodeUrl: string } | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleEnableTwoFactor = async () => {
    try {
      const data = await enableTwoFactor()
      setTwoFactorData(data)
      setShowTwoFactorSetup(true)
    } catch (error) {
      console.error('Failed to enable two-factor authentication:', error)
    }
  }

  const handleDisableTwoFactor = async () => {
    try {
      await disableTwoFactor()
      setShowTwoFactorSetup(false)
      setTwoFactorData(null)
    } catch (error) {
      console.error('Failed to disable two-factor authentication:', error)
    }
  }

  const handleFeatureToggle = async (direction: string, enabled: boolean) => {
    try {
      await updateFeature(direction as any, { enabled })
    } catch (error) {
      console.error('Failed to update feature:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security Center
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your eight-directional security protection
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="security-score text-4xl mb-2">
              {dashboard?.securityScore || 0}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overall Security Score
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {dashboard?.enabledFeatures || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Features Enabled
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {dashboard?.totalFeatures || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Features
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {dashboard?.averageScore || 0}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Score
            </p>
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
            Click on any direction to view and configure security features
          </p>
        </div>
        <div className="card-body">
          <SecurityMandala 
            features={dashboard?.features || []}
            className="flex justify-center"
          />
        </div>
      </div>

      {/* Security Features List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Security Features
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {dashboard?.features.map((feature) => (
              <div key={feature.direction} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    feature.enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {feature.enabled ? '✓' : '○'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${(feature.score / feature.maxScore) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {feature.score}/{feature.maxScore}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleFeatureToggle(feature.direction, !feature.enabled)}
                    className={`btn ${feature.enabled ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {feature.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn-secondary">
                    <CogIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                TOTP Authentication
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security with time-based one-time passwords
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {dashboard?.features.find(f => f.direction === 'southeast')?.enabled ? (
                <button
                  onClick={handleDisableTwoFactor}
                  className="btn-danger"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleEnableTwoFactor}
                  className="btn-primary"
                >
                  Enable 2FA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      {dashboard?.recommendations && dashboard.recommendations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Security Recommendations
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {dashboard.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {recommendation.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {recommendation.recommendation}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Current Score: {recommendation.currentScore}/{recommendation.maxScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Setup Modal */}
      {showTwoFactorSetup && twoFactorData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Setup Two-Factor Authentication
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code with your authenticator app:
              </p>
              <div className="flex justify-center">
                <img src={twoFactorData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Or enter this secret key manually:
              </p>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">
                {twoFactorData.secret}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTwoFactorSetup(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
