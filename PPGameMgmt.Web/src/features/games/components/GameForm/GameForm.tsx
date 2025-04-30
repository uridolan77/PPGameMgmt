import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { handleApiError, ErrorDomain } from '../../../../core/error';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define form schema with Zod
const formSchema = z.object({
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
  isActive: z.boolean().default(true),
});

export type GameFormValues = z.infer<typeof formSchema>;

interface GameFormProps {
  defaultValues?: Partial<GameFormValues>;
  onSubmit: (data: GameFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

/**
 * A form component for creating and editing games
 */
export function GameForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  onCancel
}: GameFormProps) {
  // Initialize the form
  const form = useForm<GameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      provider: '',
      category: '',
      description: '',
      isActive: true,
      ...defaultValues,
    },
  });

  // Handle form submission
  async function handleSubmit(values: GameFormValues) {
    try {
      await onSubmit(values);
      toast.success('Game saved successfully!');
    } catch (error) {
      handleApiError(error as Error, 'Failed to save game', {
        domain: ErrorDomain.GAME,
        action: 'save'
      });
    }
  }

  // Game categories
  const categories = [
    { label: 'Slots', value: 'Slots' },
    { label: 'Table Games', value: 'Table Games' },
    { label: 'Live Casino', value: 'Live Casino' },
    { label: 'Jackpot', value: 'Jackpot' },
    { label: 'Other', value: 'Other' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter game title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter provider name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter game description"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Inactive games will not be visible to players
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
