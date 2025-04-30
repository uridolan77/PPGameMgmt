import React from 'react';
import { z } from 'zod';
import { FormWrapper } from '../../../shared/components/FormWrapper';
import { 
  TextField, 
  TextareaField, 
  SelectField, 
  CheckboxField 
} from '../../../shared/components/ui-kit/inputs/FormFields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Game } from '../types';

// Define form schema with Zod
const gameFormSchema = z.object({
  title: z.string().min(3, {
    message: 'Game title must be at least 3 characters.',
  }),
  provider: z.string().min(2, {
    message: 'Provider name is required.',
  }),
  category: z.string({
    required_error: 'Please select a game category.',
  }),
  description: z.string().optional(),
  rtp: z.number().min(1).max(100).optional(),
  volatility: z.enum(['Low', 'Medium', 'High', 'Very High']).optional(),
  minBet: z.number().min(0.01).optional(),
  maxBet: z.number().min(0.01).optional(),
  platforms: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;

interface StandardGameFormProps {
  defaultValues?: Partial<GameFormValues>;
  onSubmit: (data: GameFormValues) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

/**
 * A standardized form component for creating and editing games
 * Uses the FormWrapper component for consistent form handling
 */
export function StandardGameForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false,
  isEditing = false,
  onCancel
}: StandardGameFormProps) {
  // Game categories
  const categoryOptions = [
    { label: 'Slots', value: 'Slots' },
    { label: 'Table Games', value: 'Table Games' },
    { label: 'Live Casino', value: 'Live Casino' },
    { label: 'Jackpot', value: 'Jackpot' },
    { label: 'Other', value: 'Other' }
  ];
  
  // Volatility options
  const volatilityOptions = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Very High', value: 'Very High' }
  ];
  
  // Prepare default values
  const formDefaultValues: Partial<GameFormValues> = {
    title: '',
    provider: '',
    category: '',
    description: '',
    rtp: 96,
    volatility: 'Medium',
    minBet: 0.1,
    maxBet: 100,
    platforms: ['Desktop', 'Mobile', 'Tablet'],
    languages: ['English'],
    isActive: true,
    ...defaultValues
  };
  
  return (
    <FormWrapper
      schema={gameFormSchema}
      defaultValues={formDefaultValues as any}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Update Game' : 'Create Game'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  name="title"
                  label="Game Title"
                  placeholder="Enter game title"
                  required
                  form={form}
                />
                
                <TextField
                  name="provider"
                  label="Provider"
                  placeholder="Enter game provider"
                  required
                  form={form}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="category"
                  label="Category"
                  placeholder="Select a category"
                  required
                  form={form}
                  options={categoryOptions}
                />
                
                <CheckboxField
                  name="isActive"
                  label="Game is active and available to players"
                  form={form}
                />
              </div>
              
              <TextareaField
                name="description"
                label="Description"
                placeholder="Enter game description"
                form={form}
                rows={4}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  name="rtp"
                  label="RTP (%)"
                  placeholder="96"
                  type="number"
                  form={form}
                />
                
                <SelectField
                  name="volatility"
                  label="Volatility"
                  form={form}
                  options={volatilityOptions}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    name="minBet"
                    label="Min Bet"
                    placeholder="0.10"
                    type="number"
                    form={form}
                  />
                  
                  <TextField
                    name="maxBet"
                    label="Max Bet"
                    placeholder="100"
                    type="number"
                    form={form}
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {['Desktop', 'Mobile', 'Tablet'].map(platform => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Platform selection will be implemented in a future update
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {['English', 'Spanish', 'French', 'German'].map(language => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Language selection will be implemented in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </FormWrapper>
  );
}

export default StandardGameForm;
