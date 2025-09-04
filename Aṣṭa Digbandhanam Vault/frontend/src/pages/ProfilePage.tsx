import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const changeMasterPasswordSchema = z.object({
  currentMasterPassword: z.string().min(1, 'Current master password is required'),
  newMasterPassword: z.string()
    .min(8, 'Master password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
      'Master password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  confirmMasterPassword: z.string(),
}).refine((data) => data.newMasterPassword === data.confirmMasterPassword, {
  message: "Master passwords don't match",
  path: ["confirmMasterPassword"],
})

type ChangePasswordForm = z.infer<typeof changePasswordSchema>
type ChangeMasterPasswordForm = z.infer<typeof changeMasterPasswordSchema>

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'master-password'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCurrentMasterPassword, setShowCurrentMasterPassword] = useState(false)
  const [showNewMasterPassword, setShowNewMasterPassword] = useState(false)
  const [showConfirmMasterPassword, setShowConfirmMasterPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const masterPasswordForm = useForm<ChangeMasterPasswordForm>({
    resolver: zodResolver(changeMasterPasswordSchema),
  })

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true)
    try {
      // Implement password change
      console.log('Changing password:', data)
      // await authService.changePassword(data.currentPassword, data.newPassword)
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onMasterPasswordSubmit = async (data: ChangeMasterPasswordForm) => {
    setIsLoading(true)
    try {
      // Implement master password change
      console.log('Changing master password:', data)
      // await authService.changeMasterPassword(data.currentMasterPassword, data.newMasterPassword)
    } catch (error) {
      console.error('Failed to change master password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'password', name: 'Password', icon: ShieldCheckIcon },
    { id: 'master-password', name: 'Master Password', icon: LockClosedIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and security preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Account Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Account Information
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{user?.email}</span>
                    {user?.isEmailVerified ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  {!user?.isEmailVerified && (
                    <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                      Email not verified
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Security Score
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {user?.securityScore || 0}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Two-Factor Authentication
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {user?.twoFactorEnabled ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Member Since
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Statistics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Security Statistics
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {user?.securityScore || 0}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Security Score
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user?.twoFactorEnabled ? '1' : '0'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Security Features
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user?.lastLoginAt ? '1' : '0'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recent Logins
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Change Password
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update your account password
            </p>
          </div>
          <div className="card-body">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...passwordForm.register('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordForm.formState.errors.currentPassword ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...passwordForm.register('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordForm.formState.errors.newPassword ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordForm.formState.errors.confirmPassword ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Password Tab */}
      {activeTab === 'master-password' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Change Master Password
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update your master password used for vault encryption
            </p>
          </div>
          <div className="card-body">
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important Security Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Changing your master password will re-encrypt all vault items. 
                      Make sure you remember your new master password, as losing it will 
                      result in permanent data loss.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={masterPasswordForm.handleSubmit(onMasterPasswordSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Master Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...masterPasswordForm.register('currentMasterPassword')}
                    type={showCurrentMasterPassword ? 'text' : 'password'}
                    className={`input pr-10 ${masterPasswordForm.formState.errors.currentMasterPassword ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentMasterPassword(!showCurrentMasterPassword)}
                  >
                    {showCurrentMasterPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {masterPasswordForm.formState.errors.currentMasterPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {masterPasswordForm.formState.errors.currentMasterPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Master Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...masterPasswordForm.register('newMasterPassword')}
                    type={showNewMasterPassword ? 'text' : 'password'}
                    className={`input pr-10 ${masterPasswordForm.formState.errors.newMasterPassword ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewMasterPassword(!showNewMasterPassword)}
                  >
                    {showNewMasterPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {masterPasswordForm.formState.errors.newMasterPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {masterPasswordForm.formState.errors.newMasterPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Master Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...masterPasswordForm.register('confirmMasterPassword')}
                    type={showConfirmMasterPassword ? 'text' : 'password'}
                    className={`input pr-10 ${masterPasswordForm.formState.errors.confirmMasterPassword ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmMasterPassword(!showConfirmMasterPassword)}
                  >
                    {showConfirmMasterPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {masterPasswordForm.formState.errors.confirmMasterPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {masterPasswordForm.formState.errors.confirmMasterPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-danger"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Change Master Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
