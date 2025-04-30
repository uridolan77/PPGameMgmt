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
import { Bonus } from '../types';

// Define form schema with Zod
const bonusFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Bonus name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  bonusType: z.enum(['DEPOSIT', 'FREE_SPINS', 'CASHBACK', 'NO_DEPOSIT', 'LOYALTY']),
  value: z.number().min(0.01, {
    message: 'Value must be greater than 0.',
  }),
  valueType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SPINS']),
  startDate: z.date({
    required_error: 'Start date is required.',
  }),
  endDate: z.date({
    required_error: 'End date is required.',
  }).refine(
    (date) => date > new Date(), 
    { message: 'End date must be in the future.' }
  ),
  maxClaims: z.number().int().min(0).optional(),
  targetSegment: z.string().optional(),
  minDepositAmount: z.number().min(0).optional(),
  wageringRequirement: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  termsAndConditions: z.string().optional(),
});

export type BonusFormValues = z.infer<typeof bonusFormSchema>;

interface StandardBonusFormProps {
  defaultValues?: Partial<BonusFormValues>;
  onSubmit: (data: BonusFormValues) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

/**
 * A standardized form component for creating and editing bonuses
 * Uses the FormWrapper component for consistent form handling
 */
export function StandardBonusForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false,
  isEditing = false,
  onCancel
}: StandardBonusFormProps) {
  // Bonus type options
  const bonusTypeOptions = [
    { label: 'Deposit Bonus', value: 'DEPOSIT' },
    { label: 'Free Spins', value: 'FREE_SPINS' },
    { label: 'Cashback', value: 'CASHBACK' },
    { label: 'No Deposit Bonus', value: 'NO_DEPOSIT' },
    { label: 'Loyalty Bonus', value: 'LOYALTY' }
  ];
  
  // Value type options
  const valueTypeOptions = [
    { label: 'Percentage', value: 'PERCENTAGE' },
    { label: 'Fixed Amount', value: 'FIXED' },
    { label: 'Free Spins', value: 'FREE_SPINS' }
  ];
  
  // Player segment options
  const segmentOptions = [
    { label: 'All Players', value: '' },
    { label: 'VIP', value: 'VIP' },
    { label: 'High Roller', value: 'High Roller' },
    { label: 'Regular', value: 'Regular' },
    { label: 'New Players', value: 'New' }
  ];
  
  // Prepare default values with today and a month from now as default dates
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const formDefaultValues: Partial<BonusFormValues> = {
    name: '',
    description: '',
    bonusType: 'DEPOSIT',
    value: 100,
    valueType: 'PERCENTAGE',
    startDate: today,
    endDate: nextMonth,
    maxClaims: 0, // 0 means unlimited
    targetSegment: '',
    minDepositAmount: 10,
    wageringRequirement: 30,
    isActive: true,
    termsAndConditions: '',
    ...defaultValues
  };
  
  return (
    <FormWrapper
      schema={bonusFormSchema}
      defaultValues={formDefaultValues as any}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Update Bonus' : 'Create Bonus'}
      onCancel={onCancel}
      cancelText="Cancel"
      isSubmitting={isLoading}
      className="space-y-6"
    >
      {(form) => (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                name="name"
                label="Bonus Name"
                placeholder="Enter bonus name"
                required
                form={form}
              />
              
              <TextareaField
                name="description"
                label="Description"
                placeholder="Enter bonus description"
                required
                form={form}
                rows={3}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="bonusType"
                  label="Bonus Type"
                  required
                  form={form}
                  options={bonusTypeOptions}
                />
                
                <SelectField
                  name="targetSegment"
                  label="Target Segment"
                  form={form}
                  options={segmentOptions}
                />
              </div>
              
              <CheckboxField
                name="isActive"
                label="Bonus is active and available to players"
                form={form}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bonus Value & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  name="value"
                  label="Value"
                  placeholder="100"
                  type="number"
                  required
                  form={form}
                />
                
                <SelectField
                  name="valueType"
                  label="Value Type"
                  required
                  form={form}
                  options={valueTypeOptions}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  name="minDepositAmount"
                  label="Minimum Deposit"
                  placeholder="10"
                  type="number"
                  form={form}
                />
                
                <TextField
                  name="wageringRequirement"
                  label="Wagering Requirement"
                  placeholder="30"
                  type="number"
                  form={form}
                />
              </div>
              
              <TextField
                name="maxClaims"
                label="Maximum Claims (0 for unlimited)"
                placeholder="0"
                type="number"
                form={form}
              />
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePickerField
                  name="startDate"
                  label="Start Date"
                  required
                  form={form}
                />
                
                <DatePickerField
                  name="endDate"
                  label="End Date"
                  required
                  form={form}
                />
              </div>
              
              <TextareaField
                name="termsAndConditions"
                label="Terms and Conditions"
                placeholder="Enter terms and conditions for this bonus"
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

export default StandardBonusForm;
