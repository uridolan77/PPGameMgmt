import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ActionButtonsProps {
  primaryAction?: {
    label: string;
    onClick?: () => void;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
    type?: 'button' | 'submit' | 'reset';
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    buttonProps?: Omit<ButtonProps, 'onClick' | 'variant'>;
    type?: 'button' | 'submit' | 'reset';
  };
  cancelAction?: {
    label?: string;
    onClick?: () => void;
    buttonProps?: Omit<ButtonProps, 'onClick' | 'variant'>;
    type?: 'button' | 'submit' | 'reset';
  };
  isLoading?: boolean;
  loadingText?: string;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
  reversed?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  primaryAction,
  secondaryAction,
  cancelAction,
  isLoading = false,
  loadingText = 'Loading...',
  align = 'right',
  className = '',
  reversed = false,
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  // Determine the order of buttons based on reversed prop
  const renderButtons = () => {
    const buttons = [];

    if (cancelAction) {
      buttons.push(
        <Button
          key="cancel"
          type={cancelAction.type || 'button'}
          variant="ghost"
          onClick={cancelAction.onClick}
          disabled={isLoading}
          {...cancelAction.buttonProps}
        >
          {cancelAction.label || 'Cancel'}
        </Button>
      );
    }

    if (secondaryAction) {
      buttons.push(
        <Button
          key="secondary"
          type={secondaryAction.type || 'button'}
          variant="outline"
          onClick={secondaryAction.onClick}
          disabled={isLoading}
          {...secondaryAction.buttonProps}
        >
          {secondaryAction.label}
        </Button>
      );
    }

    if (primaryAction) {
      buttons.push(
        <Button
          key="primary"
          type={primaryAction.type || 'button'}
          onClick={primaryAction.onClick}
          disabled={isLoading}
          {...primaryAction.buttonProps}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading && loadingText ? loadingText : primaryAction.label}
        </Button>
      );
    }

    return reversed ? buttons.reverse() : buttons;
  };

  return (
    <div className={cn('flex flex-col sm:flex-row gap-3', alignmentClasses[align], className)}>
      {renderButtons()}
    </div>
  );
};

// Convenience components for common patterns
export const FormActions: React.FC<Omit<ActionButtonsProps, 'primaryAction'> & {
  submitLabel?: string;
  submitProps?: Omit<ButtonProps, 'type'>;
}> = ({
  submitLabel = 'Save',
  submitProps = {},
  ...rest
}) => (
  <ActionButtons
    primaryAction={{
      label: submitLabel,
      type: 'submit',
      buttonProps: submitProps
    }}
    {...rest}
  />
);