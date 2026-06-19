import { render, screen } from '@testing-library/react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  test('shows Enter password when no password is provided', () => {
    render(<PasswordStrengthIndicator password="" />);
    expect(screen.getByText('Enter password')).toBeInTheDocument();
  });

  test('shows Weak for a weak password', () => {
    render(<PasswordStrengthIndicator password="abc" />);
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  test('shows Strong for a strong password', () => {
    render(<PasswordStrengthIndicator password="Abcdef1@" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
});
