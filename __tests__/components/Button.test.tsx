/**
 * Button Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/loading button/i)).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200');
  });

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Danger button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies small size', () => {
    render(<Button size="sm">Small button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');
  });

  it('applies large size', () => {
    render(<Button size="lg">Large button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-11');
  });
});