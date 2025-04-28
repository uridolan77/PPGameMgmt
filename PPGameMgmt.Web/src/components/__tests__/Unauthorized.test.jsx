import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Unauthorized from '../Unauthorized';

describe('Unauthorized Component', () => {
  // Helper function to render the component with Router
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );
  };

  it('renders the Access Denied heading', () => {
    renderComponent();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('displays the lock icon', () => {
    renderComponent();
    const lockIcon = screen.getByText('🔒');
    expect(lockIcon).toBeInTheDocument();
    expect(lockIcon).toHaveClass('unauthorized-icon');
  });

  it('shows the error message', () => {
    renderComponent();
    expect(screen.getByText("Sorry, you don't have permission to access this resource.")).toBeInTheDocument();
    expect(screen.getByText("Please contact your administrator if you believe this is an error.")).toBeInTheDocument();
  });

  it('contains a link to the home page', () => {
    renderComponent();
    const homeLink = screen.getByText('Go to Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.tagName).toBe('A');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});