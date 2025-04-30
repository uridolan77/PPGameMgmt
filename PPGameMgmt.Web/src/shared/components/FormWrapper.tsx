/**
 * Standardized Form Wrapper Component
 * 
 * Provides a consistent pattern for form handling using react-hook-form
 * with Zod validation and shadcn/ui Form components.
 */
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { ErrorBoundary } from '@/core/error';

// Props for the FormWrapper component
interface FormWrapperProps<T extends z.ZodType> {
  // Schema for form validation
  schema: T;
  
  // Default values for the form
  defaultValues: DefaultValues<z.infer<T>>;
  
  // Submit handler
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  
  // Function that renders the form fields using the form methods
  children: (methods: UseFormReturn<z.infer<T>>) => React.ReactNode;
  
  // Optional submit button text
  submitText?: string;
  
  // Optional cancel handler
  onCancel?: () => void;
  
  // Optional cancel button text
  cancelText?: string;
  
  // Whether the form is currently submitting
  isSubmitting?: boolean;
  
  // Whether to show the form footer with submit/cancel buttons
  showFooter?: boolean;
  
  // Optional className for the form
  className?: string;
  
  // Optional form ID
  id?: string;
  
  // Optional reset handler
  onReset?: () => void;
}

/**
 * Form wrapper component that provides standardized form handling
 * 
 * @example
 * <FormWrapper
 *   schema={gameSchema}
 *   defaultValues={defaultValues}
 *   onSubmit={handleSubmit}
 * >
 *   {(form) => (
 *     <>
 *       <FormField
 *         control={form.control}
 *         name="title"
 *         render={({ field }) => (
 *           <FormItem>
 *             <FormLabel>Game Title</FormLabel>
 *             <FormControl>
 *               <Input {...field} />
 *             </FormControl>
 *             <FormMessage />
 *           </FormItem>
 *         )}
 *       />
 *       
 *       {/* More form fields */}
 *     </>
 *   )}
 * </FormWrapper>
 */
export function FormWrapper<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitText = 'Submit',
  onCancel,
  cancelText = 'Cancel',
  isSubmitting = false,
  showFooter = true,
  className = '',
  id,
  onReset
}: FormWrapperProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validate on change for better user experience
  });
  
  const handleSubmit = async (data: z.infer<T>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Log error and show form error
      console.error('Form submission error:', error);
      form.setError('root', { 
        type: 'manual',
        message: error instanceof Error ? error.message : 'An error occurred during form submission'
      });
    }
  };
  
  const resetForm = () => {
    form.reset(defaultValues);
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <ErrorBoundary>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)}
          className={className}
          id={id}
          onReset={resetForm}
        >
          {/* Form error message */}
          {form.formState.errors.root && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
              {form.formState.errors.root.message}
            </div>
          )}
          
          {/* Form fields */}
          <div className="space-y-4">
            {children(form)}
          </div>
          
          {/* Form footer */}
          {showFooter && (
            <div className="flex justify-end gap-2 mt-6">
              {onCancel && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {cancelText}
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? 'Submitting...' : submitText}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </ErrorBoundary>
  );
}

/**
 * A simplified form wrapper for quick forms
 * 
 * @example
 * <SimpleForm
 *   schema={loginSchema}
 *   defaultValues={{ email: '', password: '' }}
 *   onSubmit={handleLogin}
 *   fields={[
 *     { name: 'email', label: 'Email', type: 'email' },
 *     { name: 'password', label: 'Password', type: 'password' }
 *   ]}
 *   submitText="Log In"
 * />
 */
interface FormField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
}

interface SimpleFormProps<T extends z.ZodType> extends Omit<FormWrapperProps<T>, 'children'> {
  fields: FormField[];
}

export function SimpleForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  fields,
  ...rest
}: SimpleFormProps<T>) {
  return (
    <FormWrapper
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      {...rest}
    >
      {(form) => (
        <>
          {/* Generate form fields automatically from the fields array */}
          {/* This would need to be implemented based on your UI components */}
          <p>Form field implementation would go here</p>
        </>
      )}
    </FormWrapper>
  );
}