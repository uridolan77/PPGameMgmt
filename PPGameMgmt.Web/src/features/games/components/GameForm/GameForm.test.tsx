import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameForm } from './GameForm';
import { toast } from 'sonner';

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the form components to simplify testing
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormDescription: ({ children }: any) => <p>{children}</p>,
  FormMessage: () => null,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid={`input-${props.placeholder}`} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} data-testid={`textarea-${props.placeholder}`} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      <select onChange={(e) => onValueChange(e.target.value)} data-testid="select">
        <option value="">Select...</option>
        <option value="Slots">Slots</option>
        <option value="Table Games">Table Games</option>
      </select>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onCheckedChange(e.target.checked)} 
      data-testid="switch"
    />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} data-testid={`button-${children}`}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock useForm
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault();
      return fn({
        title: 'Test Game',
        provider: 'Test Provider',
        category: 'Slots',
        description: 'Test Description',
        isActive: true,
      });
    },
  }),
}));

describe('GameForm', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    render(<GameForm onSubmit={mockSubmit} />);
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Game Title')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Active Status')).toBeInTheDocument();
    
    expect(screen.getByTestId('input-Enter game title')).toBeInTheDocument();
    expect(screen.getByTestId('input-Enter provider name')).toBeInTheDocument();
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-Enter game description')).toBeInTheDocument();
    expect(screen.getByTestId('switch')).toBeInTheDocument();
    
    expect(screen.getByTestId('button-Save Game')).toBeInTheDocument();
  });

  test('renders cancel button when onCancel is provided', () => {
    render(<GameForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    expect(screen.getByTestId('button-Cancel')).toBeInTheDocument();
  });

  test('does not render cancel button when onCancel is not provided', () => {
    render(<GameForm onSubmit={mockSubmit} />);
    
    expect(screen.queryByTestId('button-Cancel')).not.toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(<GameForm onSubmit={mockSubmit} isLoading={true} />);
    
    expect(screen.getByTestId('button-Saving...')).toBeInTheDocument();
    expect(screen.getByTestId('button-Saving...')).toBeDisabled();
  });

  test('calls onSubmit when form is submitted', async () => {
    render(<GameForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByTestId('button-Save Game'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Test Game',
        provider: 'Test Provider',
        category: 'Slots',
        description: 'Test Description',
        isActive: true,
      });
    });
  });

  test('shows success toast when submission succeeds', async () => {
    mockSubmit.mockResolvedValueOnce(undefined);
    
    render(<GameForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByTestId('button-Save Game'));
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Game saved successfully!');
    });
  });

  test('shows error toast when submission fails', async () => {
    mockSubmit.mockRejectedValueOnce(new Error('Test error'));
    
    render(<GameForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByTestId('button-Save Game'));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save game.');
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<GameForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    fireEvent.click(screen.getByTestId('button-Cancel'));
    
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});
