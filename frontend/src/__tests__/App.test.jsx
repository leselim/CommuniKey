import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SOSButton from '../components/SOSButton';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com', first_name: 'TestUser' },
    activeCommunity: { id: 1, name: 'Test Community' },
    userCommunities: [{ id: 1, name: 'Test Community' }],
    token: 'fake-jwt-token',
    loading: false
  })
}));

describe('SOSButton Component', () => {
  it('renders SOS Panic button', () => {
    render(
      <BrowserRouter>
        <SOSButton />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /sos panic/i });
    expect(button).toBeDefined();
  });
});
