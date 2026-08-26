import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders CommuniKey brand header or sign in screen', () => {
  render(<App />);
  const brandElement = screen.getByText(/CommuniKey/i);
  expect(brandElement).toBeInTheDocument();
});

test('renders sign in screen by default when unauthenticated', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { level: 1 });
  expect(headingElement).toBeInTheDocument();
});
