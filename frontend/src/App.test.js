import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const SEED = {
  id: 1,
  email: 'thabo@example.com',
  first_name: 'Thabo',
  last_name: 'Mokoena',
  role: 'Resident',
  address: '22 Riverside Drive, Section A',
  community_name: 'Riverside Estate',
  status: 'Verified',
};

afterEach(() => {
  window.localStorage.clear();
});

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

test('sign in offers a demonstration account for every role', () => {
  render(<App />);
  ['Resident', 'Estate Administrator', 'Safety Volunteer', 'Security Guard'].forEach((role) => {
    expect(screen.getByText(role)).toBeInTheDocument();
  });
});

test('a wrong password is reported and does not sign the person in', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'thabo@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'not-the-password' } });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: /sign in/i })).toBeInTheDocument();
});

test('a signed in resident lands on the estate shell with their own sections', () => {
  window.localStorage.setItem('ccp_auth_user', JSON.stringify(SEED));
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: /home/i })).toBeInTheDocument();

  const sidebar = screen.getByRole('navigation', { name: /sections/i });
  expect(within(sidebar).getByRole('link', { name: /incidents/i })).toBeInTheDocument();
  expect(within(sidebar).queryByRole('link', { name: /reporting/i })).not.toBeInTheDocument();
});

test('a resident cannot reach an administrator only address', () => {
  window.localStorage.setItem('ccp_auth_user', JSON.stringify(SEED));
  window.history.pushState({}, '', '/admin');
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: /home/i })).toBeInTheDocument();
  window.history.pushState({}, '', '/');
});
