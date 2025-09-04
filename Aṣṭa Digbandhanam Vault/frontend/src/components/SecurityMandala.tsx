import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SecurityFeature, SecurityDirection } from '@/types'
import { useSecurityStore } from '@/store/securityStore'

interface MandalaDirection {
  direction: SecurityDirection
  name: string
  description: string
  color: string
  position: {
    x: number
    y: number
  }
  icon: string
}

const mandalaDirections: MandalaDirection[] = [
  {
    direction: 'east',
    name: 'Master Password',
    description: 'Argon2id KDF with zero-knowledge architecture',
    color: 'bg-mandala-east',
    position: { x: 0, y: -120 },
    icon: '🔐'
  },
  {
    direction: 'southeast',
    name: 'Multi-Factor Auth',
    description: 'TOTP + WebAuthn hardware key support',
    color: 'bg-mandala-southeast',
    position: { x: 85, y: -85 },
    icon: '🔑'
  },
  {
    direction: 'south',
    name: 'Device Binding',
    description: 'Trusted device registration and jailbreak detection',
    color: 'bg-mandala-south',
    position: { x: 120, y: 0 },
    icon: '📱'
  },
  {
    direction: 'southwest',
    name: 'Vault Encryption',
    description: 'AES-256-GCM or XChaCha20-Poly1305 per secret',
    color: 'bg-mandala-southwest',
    position: { x: 85, y: 85 },
    icon: '🛡️'
  },
  {
    direction: 'west',
    name: 'Secrets Vault',
    description: 'End-to-end encrypted vault storage',
    color: 'bg-mandala-west',
    position: { x: 0, y: 120 },
    icon: '🗄️'
  },
  {
    direction: 'northwest',
    name: 'Network Protection',
    description: 'HTTPS/TLS 1.3 with certificate pinning',
    color: 'bg-mandala-northwest',
    position: { x: -85, y: 85 },
    icon: '🌐'
  },
  {
    direction: 'north',
    name: 'Biometric Unlock',
    description: 'FaceID/TouchID via WebAuthn with fallback',
    color: 'bg-mandala-north',
    position: { x: -120, y: 0 },
    icon: '👆'
  },
  {
    direction: 'northeast',
    name: 'Watchtower AI',
    description: 'Breach alerts and password strength analysis',
    color: 'bg-mandala-northeast',
    position: { x: -85, y: -85 },
    icon: '🤖'
  },
  {
    direction: 'above',
    name: 'Cloud Backup',
    description: 'Optional encrypted sync with Shamir Secret Sharing',
    color: 'bg-mandala-above',
    position: { x: 0, y: -180 },
    icon: '☁️'
  },
  {
    direction: 'below',
    name: 'Local Storage',
    description: 'IndexedDB with OS secure storage fallback',
    color: 'bg-mandala-below',
    position: { x: 0, y: 180 },
    icon: '💾'
  }
]

interface SecurityMandalaProps {
  features: SecurityFeature[]
  onFeatureClick?: (feature: SecurityFeature) => void
  className?: string
}

export const SecurityMandala: React.FC<SecurityMandalaProps> = ({
  features,
  onFeatureClick,
  className = ''
}) => {
  const [selectedFeature, setSelectedFeature] = useState<SecurityFeature | null>(null)
  const [hoveredFeature, setHoveredFeature] = useState<SecurityFeature | null>(null)

  const getFeatureByDirection = (direction: SecurityDirection): SecurityFeature | undefined => {
    return features.find(f => f.direction === direction)
  }

  const calculateSecurityScore = (): number => {
    if (features.length === 0) return 0
    const totalScore = features.reduce((sum, feature) => sum + feature.score, 0)
    const maxScore = features.reduce((sum, feature) => sum + feature.maxScore, 0)
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  }

  const securityScore = calculateSecurityScore()

  const handleFeatureClick = (direction: SecurityDirection) => {
    const feature = getFeatureByDirection(direction)
    if (feature) {
      setSelectedFeature(feature)
      onFeatureClick?.(feature)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Mandala Container */}
      <div className="relative w-96 h-96 mx-auto">
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"></div>
        
        {/* Security Score Center */}
        <motion.div
          className="mandala-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <div className="text-center">
            <div className="security-score">{securityScore}%</div>
            <div className="text-xs opacity-75">Security Score</div>
          </div>
        </motion.div>

        {/* Direction Features */}
        {mandalaDirections.map((direction, index) => {
          const feature = getFeatureByDirection(direction.direction)
          const isEnabled = feature?.enabled || false
          const score = feature?.score || 0
          const isHovered = hoveredFeature?.direction === direction.direction
          const isSelected = selectedFeature?.direction === direction.direction

          return (
            <motion.div
              key={direction.direction}
              className={`absolute mandala-direction ${direction.color} ${
                isEnabled ? 'enabled' : 'disabled'
              } ${isHovered ? 'ring-4 ring-white ring-opacity-50' : ''} ${
                isSelected ? 'ring-4 ring-primary-500 ring-opacity-75' : ''
              }`}
              style={{
                left: `calc(50% + ${direction.position.x}px)`,
                top: `calc(50% + ${direction.position.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isEnabled ? 1.1 : 1,
                opacity: 1,
                rotate: isEnabled ? 360 : 0
              }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                rotate: { duration: 2, ease: "easeInOut" }
              }}
              whileHover={{ 
                scale: 1.2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeatureClick(direction.direction)}
              onMouseEnter={() => setHoveredFeature(feature || null)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="text-2xl">{direction.icon}</div>
              {isEnabled && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
            </motion.div>
          )
        })}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {mandalaDirections.map((direction, index) => {
            const feature = getFeatureByDirection(direction.direction)
            const isEnabled = feature?.enabled || false
            
            return (
              <motion.line
                key={`line-${direction.direction}`}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${direction.position.x}px)`}
                y2={`calc(50% + ${direction.position.y}px)`}
                stroke={isEnabled ? '#10b981' : '#6b7280'}
                strokeWidth={isEnabled ? 3 : 1}
                strokeDasharray={isEnabled ? '0' : '5,5'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3 + index * 0.05, duration: 0.8 }}
              />
            )
          })}
        </svg>
      </div>

      {/* Feature Details Panel */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            className="mt-8 p-6 card max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedFeature.name}
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedFeature.enabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {selectedFeature.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedFeature.description}
            </p>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Security Score</span>
                  <span className="font-medium">{selectedFeature.score}/{selectedFeature.maxScore}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedFeature.score / selectedFeature.maxScore) * 100}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
              </div>
              
              {selectedFeature.configuration && Object.keys(selectedFeature.configuration).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Configuration
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(selectedFeature.configuration).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-8 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Enabled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Disabled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Selected</span>
        </div>
      </div>
    </div>
  )
}
