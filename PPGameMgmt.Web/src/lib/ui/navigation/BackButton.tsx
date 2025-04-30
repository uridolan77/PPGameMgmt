import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button, ButtonProps } from '../..'; // Import from centralized UI library
import { BaseProps } from '../types';

export interface BackButtonProps extends Omit<ButtonProps, 'onClick'>, BaseProps {
  /**
   * Text to display on the button
   */
  label?: string;
  
  /**
   * Route to navigate to when clicked
   * If not provided, will go back in history
   */
  to?: string;
  
  /**
   * Custom callback for back button click
   * Takes precedence over 'to' prop
   */
  onBack?: () => void;
}

/**
 * BackButton component for navigation
 * 
 * @example
 * ```tsx
 * // Go back in browser history
 * <BackButton />
 * 
 * // Navigate to specific route
 * <BackButton to="/players" />
 * 
 * // Custom back action
 * <BackButton onBack={() => console.log('Back clicked')} />
 * ```
 */
export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  to,
  onBack,
  className = '',
  variant = 'ghost',
  size = 'sm',
  testId,
  ...rest
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onBack) {
      onBack();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center ${className}`}
      onClick={handleClick}
      data-testid={testId}
      {...rest}
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
};