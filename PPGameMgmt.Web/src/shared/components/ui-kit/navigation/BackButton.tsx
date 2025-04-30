import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';

// Import the new component
import { BackButton as NewBackButton } from '@/lib/ui/navigation';

export interface BackButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string;
  to?: string;
  onBack?: () => void;
}

/**
 * @deprecated Use BackButton from @/lib/ui/navigation instead
 */
export const BackButton: React.FC<BackButtonProps> = (props) => {
  // Log deprecation warning in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'The BackButton component from @/shared/components/ui-kit is deprecated. ' +
      'Please use BackButton from @/lib/ui/navigation instead.'
    );
  }
  
  // Pass through to new component
  return <NewBackButton {...props} />;
};