import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayerForm } from './PlayerForm';
import { createMockPlayer } from '../../utils/testUtils';

// Mock the FormWrapper component
jest.mock('../../../../shared/components/FormWrapper', () => ({
  FormWrapper: ({ children, onSubmit, submitText, onCancel, cancelText }: any) => {
    const form = {
      control: {},
      formState: { errors: {} }
    };
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ username: 'test', email: 'test@example.com' }); }}>
        {children(form)}
        <button type="submit">{submitText}</button>
        {onCancel && <button type="button" onClick={onCancel}>{cancelText}</button>}
      </form>
    );
  }
}));

// Mock the form field components
jest.mock('../../../../shared/components/ui-kit/inputs/FormFields', () => ({
  TextField: ({ name, label, placeholder, required, type }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}{required && '*'}</label>
      <input type={type || 'text'} name={name} placeholder={placeholder} />
    </div>
  ),
  TextareaField: ({ name, label, placeholder }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <textarea name={name} placeholder={placeholder} />
    </div>
  ),
  SelectField: ({ name, label, options }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <select name={name}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  ),
  CheckboxField: ({ name, label, description }: any) => (
    <div data-testid={`field-${name}`}>
      <input type="checkbox" name={name} id={name} />
      <label htmlFor={name}>{label}</label>
      {description && <p>{description}</p>}
    </div>
  ),
  DatePickerField: ({ name, label, disabled }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input type="date" name={name} disabled={disabled} />
    </div>
  ),
}));

describe('PlayerForm', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();
  const mockPlayer = createMockPlayer();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields correctly', () => {
    render(<PlayerForm onSubmit={mockSubmit} />);
    
    // Account Information section
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByTestId('field-username')).toBeInTheDocument();
    expect(screen.getByTestId('field-email')).toBeInTheDocument();
    expect(screen.getByTestId('field-firstName')).toBeInTheDocument();
    expect(screen.getByTestId('field-lastName')).toBeInTheDocument();
    expect(screen.getByTestId('field-isActive')).toBeInTheDocument();
    
    // Player Details section
    expect(screen.getByText('Player Details')).toBeInTheDocument();
    expect(screen.getByTestId('field-playerLevel')).toBeInTheDocument();
    expect(screen.getByTestId('field-segment')).toBeInTheDocument();
    expect(screen.getByTestId('field-country')).toBeInTheDocument();
    expect(screen.getByTestId('field-birthDate')).toBeInTheDocument();
    
    // Additional Information section
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByTestId('field-notes')).toBeInTheDocument();
  });

  test('shows registration date field when in edit mode', () => {
    render(<PlayerForm onSubmit={mockSubmit} isEditing={true} />);
    
    expect(screen.getByTestId('field-registrationDate')).toBeInTheDocument();
  });

  test('does not show registration date field when in create mode', () => {
    render(<PlayerForm onSubmit={mockSubmit} isEditing={false} />);
    
    expect(screen.queryByTestId('field-registrationDate')).not.toBeInTheDocument();
  });

  test('shows correct submit button text based on isEditing prop', () => {
    const { rerender } = render(<PlayerForm onSubmit={mockSubmit} isEditing={false} />);
    
    expect(screen.getByText('Create Player')).toBeInTheDocument();
    
    rerender(<PlayerForm onSubmit={mockSubmit} isEditing={true} />);
    
    expect(screen.getByText('Update Player')).toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted', async () => {
    render(<PlayerForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByText('Create Player'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({ username: 'test', email: 'test@example.com' });
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<PlayerForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  test('does not render cancel button when onCancel is not provided', () => {
    render(<PlayerForm onSubmit={mockSubmit} />);
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
