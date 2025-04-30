import React from 'react';
import { z } from 'zod';
import { FormWrapper } from '../../../shared/components/FormWrapper';
import { 
  TextField, 
  TextareaField, 
  SelectField, 
  CheckboxField,
  DatePickerField
} from '../../../shared/components/ui-kit/inputs/FormFields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Player } from '../types';

// Define form schema with Zod
const playerFormSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  playerLevel: z.number().min(1).max(100).default(1),
  segment: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.date().optional(),
  registrationDate: z.date().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface StandardPlayerFormProps {
  defaultValues?: Partial<PlayerFormValues>;
  onSubmit: (data: PlayerFormValues) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

/**
 * A standardized form component for creating and editing players
 * Uses the FormWrapper component for consistent form handling
 */
export function StandardPlayerForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false,
  isEditing = false,
  onCancel
}: StandardPlayerFormProps) {
  // Player segments
  const segmentOptions = [
    { label: 'VIP', value: 'VIP' },
    { label: 'High Roller', value: 'High Roller' },
    { label: 'Regular', value: 'Regular' },
    { label: 'Casual', value: 'Casual' },
    { label: 'New', value: 'New' }
  ];
  
  // Country options (simplified list)
  const countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
    { label: 'Australia', value: 'AU' },
    { label: 'Germany', value: 'DE' },
    { label: 'France', value: 'FR' },
    { label: 'Spain', value: 'ES' },
    { label: 'Italy', value: 'IT' },
    { label: 'Japan', value: 'JP' },
    { label: 'Other', value: 'Other' }
  ];
  
  // Prepare default values
  const formDefaultValues: Partial<PlayerFormValues> = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    playerLevel: 1,
    segment: 'New',
    country: '',
    isActive: true,
    ...defaultValues
  };
  
  return (
    <FormWrapper
      schema={playerFormSchema}
      defaultValues={formDefaultValues as any}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Update Player' : 'Create Player'}
      onCancel={onCancel}
      cancelText="Cancel"
      isSubmitting={isLoading}
      className="space-y-6"
    >
      {(form) => (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  name="username"
                  label="Username"
                  placeholder="Enter username"
                  required
                  form={form}
                />
                
                <TextField
                  name="email"
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  required
                  form={form}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  form={form}
                />
                
                <TextField
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  form={form}
                />
              </div>
              
              <CheckboxField
                name="isActive"
                label="Account is active"
                form={form}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Player Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  name="playerLevel"
                  label="Player Level"
                  placeholder="1"
                  type="number"
                  form={form}
                />
                
                <SelectField
                  name="segment"
                  label="Player Segment"
                  form={form}
                  options={segmentOptions}
                />
                
                <SelectField
                  name="country"
                  label="Country"
                  form={form}
                  options={countryOptions}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePickerField
                  name="birthDate"
                  label="Birth Date"
                  form={form}
                  fromYear={1900}
                  toYear={new Date().getFullYear() - 18}
                />
                
                {isEditing && (
                  <DatePickerField
                    name="registrationDate"
                    label="Registration Date"
                    form={form}
                    disabled
                  />
                )}
              </div>
              
              <Separator className="my-4" />
              
              <TextareaField
                name="notes"
                label="Notes"
                placeholder="Enter any additional notes about this player"
                form={form}
                rows={4}
              />
            </CardContent>
          </Card>
        </>
      )}
    </FormWrapper>
  );
}

export default StandardPlayerForm;
