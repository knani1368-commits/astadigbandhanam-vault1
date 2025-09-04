// User types
export interface User {
  id: string
  email: string
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  securityScore: number
  createdAt: string
  lastLoginAt?: string
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
  twoFactorToken?: string
}

export interface RegisterCredentials {
  email: string
  password: string
  masterPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// Vault item types
export enum VaultItemType {
  LOGIN = 'login',
  SECURE_NOTE = 'secureNote',
  PAYMENT_CARD = 'paymentCard',
  IDENTITY = 'identity',
}

export interface VaultItemData {
  // Login type
  username?: string
  password?: string
  url?: string
  notes?: string
  
  // Secure note type
  title?: string
  content?: string
  
  // Payment card type
  cardNumber?: string
  cardholderName?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  notes?: string
  
  // Identity type
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: string
  ssn?: string
  notes?: string
}

export interface VaultItem {
  id: string
  type: VaultItemType
  encryptedData: string
  encryptedDataKey: string
  iv: string
  tag: string
  algorithm: 'aes' | 'xchacha'
  tags: string[]
  favorite: boolean
  isDeleted: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
  decryptedData?: VaultItemData
}

// Security feature types
export enum SecurityDirection {
  EAST = 'east',
  SOUTHEAST = 'southeast',
  SOUTH = 'south',
  SOUTHWEST = 'southwest',
  WEST = 'west',
  NORTHWEST = 'northwest',
  NORTH = 'north',
  NORTHEAST = 'northeast',
  ABOVE = 'above',
  BELOW = 'below',
}

export interface SecurityFeature {
  id: string
  userId: string
  direction: SecurityDirection
  name: string
  description: string
  enabled: boolean
  score: number
  maxScore: number
  configuration: Record<string, any>
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

// Security analysis types
export interface PasswordStrengthAnalysis {
  score: number
  feedback: string[]
  recommendations: string[]
}

export interface BreachCheck {
  isBreached: boolean
  breachCount: number
  recommendations: string[]
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
  twoFactorToken?: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  masterPassword: string
  confirmMasterPassword: string
}

export interface VaultItemForm {
  type: VaultItemType
  data: VaultItemData
  tags: string[]
  favorite: boolean
  masterPassword: string
}

export interface SecurityDashboard {
  securityScore: number
  enabledFeatures: number
  totalFeatures: number
  averageScore: number
  features: SecurityFeature[]
  recommendations: SecurityRecommendation[]
}

export interface SecurityRecommendation {
  direction: SecurityDirection
  name: string
  description: string
  currentScore: number
  maxScore: number
  recommendation: string
}

// Theme types
export type Theme = 'light' | 'dark'

// Navigation types
export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
}

// Error types
export interface AppError {
  message: string
  code?: string
  details?: any
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string
}

// Mandala visualization types
export interface MandalaDirection {
  direction: SecurityDirection
  name: string
  description: string
  color: string
  position: {
    x: number
    y: number
  }
  enabled: boolean
  score: number
  maxScore: number
}

// Two-factor authentication types
export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
}

// Export/Import types
export interface VaultExport {
  version: string
  exportedAt: string
  items: Array<{
    id: string
    type: VaultItemType
    data: VaultItemData
    tags: string[]
    favorite: boolean
    createdAt: string
    updatedAt: string
  }>
}

export interface VaultImport {
  importData: VaultExport
  masterPassword: string
  algorithm?: 'aes' | 'xchacha'
}
