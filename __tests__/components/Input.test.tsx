/**
 * Input Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test input');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test input');
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300');
  });

  it('handles password type with toggle', () => {
    render(<Input type="password" showPasswordToggle />);
    
    // Password input has no role="textbox", use different selector
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    const toggleButton = screen.getByRole('button');
    
    expect(input).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows email icon for email type', () => {
    render(<Input type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input.parentElement).toHaveClass('relative');
  });

  it('applies disabled state', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('focuses input when clicked', async () => {
    const user = userEvent.setup();
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    expect(input).toHaveFocus();
  });
});