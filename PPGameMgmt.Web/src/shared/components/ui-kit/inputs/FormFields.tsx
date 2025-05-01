import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

export type FormFieldOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type BaseFormFieldProps = {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
  form: UseFormReturn<any>;
};

// Re-usable form field wrapper
const FormFieldWrapper: React.FC<{
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  form: UseFormReturn<any>;
  children: (props: { field: any }) => ReactNode;
}> = ({
  name,
  label,
  description,
  required,
  className,
  labelClassName,
  form,
  children
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        {label && (
          <FormLabel className={labelClassName}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
        )}
        <FormControl>
          {children({ field })}
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

// Text Input Field
export interface TextFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  required,
  className,
  labelClassName,
  controlClassName,
  form,
  type = 'text',
}) => {
  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      labelClassName={labelClassName}
      form={form}
    >
      {({ field }) => (
        <Input
          {...field}
          value={field.value ?? ''}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={controlClassName}
        />
      )}
    </FormFieldWrapper>
  );
};

// Textarea Field
export interface TextareaFieldProps extends BaseFormFieldProps {
  rows?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  required,
  className,
  labelClassName,
  controlClassName,
  form,
  rows = 3,
}) => {
  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      labelClassName={labelClassName}
      form={form}
    >
      {({ field }) => (
        <Textarea
          {...field}
          value={field.value ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={controlClassName}
        />
      )}
    </FormFieldWrapper>
  );
};

// Select Field
export interface SelectFieldProps extends BaseFormFieldProps {
  options: FormFieldOption[];
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  description,
  placeholder = 'Select an option',
  disabled,
  required,
  className,
  labelClassName,
  controlClassName,
  form,
  options,
}) => {
  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      labelClassName={labelClassName}
      form={form}
    >
      {({ field }) => (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          value={field.value}
          disabled={disabled}
        >
          <SelectTrigger className={controlClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormFieldWrapper>
  );
};

// Checkbox Field
export interface CheckboxFieldProps extends Omit<BaseFormFieldProps, 'placeholder'> {}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  description,
  disabled,
  required,
  className,
  labelClassName,
  controlClassName,
  form,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0 p-1', className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={controlClassName}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel className={cn('text-sm font-normal', labelClassName)}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

// Date Picker Field
export interface DatePickerFieldProps extends Omit<BaseFormFieldProps, 'placeholder'> {
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  name,
  label,
  description,
  placeholder = 'Select a date',
  disabled,
  required,
  className,
  labelClassName,
  controlClassName,
  form,
  fromYear,
  toYear,
}) => {
  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      labelClassName={labelClassName}
      form={form}
    >
      {({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground",
                controlClassName
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(field.value, 'PP') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={disabled}
              fromYear={fromYear}
              toYear={toYear}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </FormFieldWrapper>
  );
};

// Number Field
export interface NumberFieldProps extends Omit<BaseFormFieldProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  required,
  className,
  labelClassName,
  controlClassName,
  form,
  min,
  max,
  step = 1,
}) => {
  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      labelClassName={labelClassName}
      form={form}
    >
      {({ field }) => (
        <Input
          {...field}
          value={field.value ?? ''}
          type="number"
          placeholder={placeholder}
          disabled={disabled}
          className={controlClassName}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            field.onChange(value);
          }}
        />
      )}
    </FormFieldWrapper>
  );
};