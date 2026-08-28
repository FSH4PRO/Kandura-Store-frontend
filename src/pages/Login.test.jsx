// eslint-disable-next-line no-unused-vars
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/auth', () => ({
  loginCustomer: vi.fn(),
  registerCustomer: vi.fn(),
  logoutCustomer: vi.fn(),
}));

describe('Login page', () => {
  it('renders login form fields and action', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+971 5X XXX XXXX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
