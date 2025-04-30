import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BonusForm } from './BonusForm';

// Mock the FormWrapper component
jest.mock('../../../../shared/components/FormWrapper', () => ({
  FormWrapper: ({ children, onSubmit, submitText, onCancel, cancelText }: any) => {
    const form = {
      control: {},
      formState: { errors: {} }
    };
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name: 'Test Bonus', description: 'Test Description' }); }}>
        {children(form)}
        <button type="submit">{submitText}</button>
        {onCancel && <button type="button" onClick={onCancel}>{cancelText}</button>}
      </form>
    );
  }
}));

// Mock the form field components
jest.mock('../../../../shared/components/ui-kit/inputs/FormFields', () => ({
  TextField: ({ name, label, placeholder, required }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}{required && '*'}</label>
      <input type="text" name={name} placeholder={placeholder} />
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
  DatePickerField: ({ name, label }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input type="date" name={name} />
    </div>
  ),
  NumberField: ({ name, label, placeholder }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input type="number" name={name} placeholder={placeholder} />
    </div>
  ),
}));

describe('BonusForm', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields correctly', () => {
    render(<BonusForm onSubmit={mockSubmit} />);
    
    // Basic Information section
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByTestId('field-name')).toBeInTheDocument();
    expect(screen.getByTestId('field-description')).toBeInTheDocument();
    expect(screen.getByTestId('field-bonusType')).toBeInTheDocument();
    expect(screen.getByTestId('field-targetSegment')).toBeInTheDocument();
    expect(screen.getByTestId('field-isActive')).toBeInTheDocument();
    
    // Bonus Value section
    expect(screen.getByText('Bonus Value')).toBeInTheDocument();
    expect(screen.getByTestId('field-value')).toBeInTheDocument();
    expect(screen.getByTestId('field-valueType')).toBeInTheDocument();
    expect(screen.getByTestId('field-minDepositAmount')).toBeInTheDocument();
    expect(screen.getByTestId('field-wageringRequirement')).toBeInTheDocument();
    expect(screen.getByTestId('field-maxClaims')).toBeInTheDocument();
    
    // Validity Period section
    expect(screen.getByText('Validity Period')).toBeInTheDocument();
    expect(screen.getByTestId('field-startDate')).toBeInTheDocument();
    expect(screen.getByTestId('field-endDate')).toBeInTheDocument();
    
    // Terms and Conditions section
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    expect(screen.getByTestId('field-termsAndConditions')).toBeInTheDocument();
  });

  test('shows correct submit button text based on isEditing prop', () => {
    const { rerender } = render(<BonusForm onSubmit={mockSubmit} isEditing={false} />);
    
    expect(screen.getByText('Create Bonus')).toBeInTheDocument();
    
    rerender(<BonusForm onSubmit={mockSubmit} isEditing={true} />);
    
    expect(screen.getByText('Update Bonus')).toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted', async () => {
    render(<BonusForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByText('Create Bonus'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith({ name: 'Test Bonus', description: 'Test Description' });
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<BonusForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  test('does not render cancel button when onCancel is not provided', () => {
    render(<BonusForm onSubmit={mockSubmit} />);
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
