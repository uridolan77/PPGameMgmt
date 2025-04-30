import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';

export interface BackButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string;
  to?: string;
  onBack?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  to,
  onBack,
  className = '',
  variant = 'ghost',
  size = 'sm',
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
      {...rest}
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
};