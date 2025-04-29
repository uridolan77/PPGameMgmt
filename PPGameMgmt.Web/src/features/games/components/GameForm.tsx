import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Import our shadcn/ui components
import { Button } from '../../../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';

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

type GameFormValues = z.infer<typeof formSchema>;

interface GameFormProps {
  defaultValues?: Partial<GameFormValues>;
  onSubmit: (data: GameFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function GameForm({ defaultValues, onSubmit, isLoading = false }: GameFormProps) {
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
      toast.error('Failed to save game.');
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{defaultValues?.title ? 'Edit Game' : 'Add New Game'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter game title" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the game as it will appear to players.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="Game provider" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="slots">Slots</SelectItem>
                        <SelectItem value="table_games">Table Games</SelectItem>
                        <SelectItem value="live_casino">Live Casino</SelectItem>
                        <SelectItem value="jackpot">Jackpot</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a description of the game" 
                      className="min-h-[120px]"
                      {...field} 
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Whether this game is currently active and available to players.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-6 flex justify-between">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Game'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default GameForm;