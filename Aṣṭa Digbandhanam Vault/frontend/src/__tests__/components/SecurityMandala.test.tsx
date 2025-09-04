import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityMandala } from '@/components/SecurityMandala';
import { SecurityFeature, SecurityDirection } from '@/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockFeatures: SecurityFeature[] = [
  {
    id: '1',
    userId: 'user1',
    direction: SecurityDirection.EAST,
    name: 'Master Password Protection',
    description: 'Argon2id KDF with zero-knowledge architecture',
    enabled: true,
    score: 100,
    maxScore: 100,
    configuration: { algorithm: 'argon2id' },
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    direction: SecurityDirection.SOUTHEAST,
    name: 'Multi-Factor Authentication',
    description: 'TOTP + WebAuthn hardware key support',
    enabled: false,
    score: 0,
    maxScore: 100,
    configuration: { totpEnabled: false },
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('SecurityMandala', () => {
  it('renders the security mandala with features', () => {
    render(<SecurityMandala features={mockFeatures} />);
    
    expect(screen.getByText('Master Password Protection')).toBeInTheDocument();
    expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
  });

  it('displays the security score in the center', () => {
    render(<SecurityMandala features={mockFeatures} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Security Score')).toBeInTheDocument();
  });

  it('shows enabled features with different styling', () => {
    render(<SecurityMandala features={mockFeatures} />);
    
    const enabledFeature = screen.getByText('Master Password Protection').closest('.mandala-direction');
    const disabledFeature = screen.getByText('Multi-Factor Authentication').closest('.mandala-direction');
    
    expect(enabledFeature).toHaveClass('enabled');
    expect(disabledFeature).toHaveClass('disabled');
  });

  it('calls onFeatureClick when a feature is clicked', () => {
    const mockOnFeatureClick = jest.fn();
    render(<SecurityMandala features={mockFeatures} onFeatureClick={mockOnFeatureClick} />);
    
    const featureElement = screen.getByText('Master Password Protection').closest('.mandala-direction');
    fireEvent.click(featureElement!);
    
    expect(mockOnFeatureClick).toHaveBeenCalledWith(mockFeatures[0]);
  });

  it('shows feature details when a feature is selected', () => {
    render(<SecurityMandala features={mockFeatures} />);
    
    const featureElement = screen.getByText('Master Password Protection').closest('.mandala-direction');
    fireEvent.click(featureElement!);
    
    expect(screen.getByText('Master Password Protection')).toBeInTheDocument();
    expect(screen.getByText('Argon2id KDF with zero-knowledge architecture')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('displays the legend correctly', () => {
    render(<SecurityMandala features={mockFeatures} />);
    
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('calculates security score correctly', () => {
    const featuresWithDifferentScores: SecurityFeature[] = [
      {
        ...mockFeatures[0],
        score: 80,
        maxScore: 100,
      },
      {
        ...mockFeatures[1],
        score: 60,
        maxScore: 100,
      },
    ];
    
    render(<SecurityMandala features={featuresWithDifferentScores} />);
    
    // Total score: (80 + 60) / (100 + 100) * 100 = 70%
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('handles empty features array', () => {
    render(<SecurityMandala features={[]} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows configuration details in feature panel', () => {
    render(<SecurityMandala features={mockFeatures} />);
    
    const featureElement = screen.getByText('Master Password Protection').closest('.mandala-direction');
    fireEvent.click(featureElement!);
    
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Algorithm')).toBeInTheDocument();
    expect(screen.getByText('argon2id')).toBeInTheDocument();
  });
});
