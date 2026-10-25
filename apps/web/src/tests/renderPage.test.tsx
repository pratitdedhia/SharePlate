import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DonationDetailPage } from '../pages/DonationDetailPage';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';

describe('DonationDetailPage Server Render Test', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };
  });

  it('renders DonationDetailPage without throwing any error', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/donations/d0000000-0000-0000-0000-000000000002']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/donations/:id" element={<DonationDetailPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(html).toBeDefined();
    expect(html).toContain('animate-pulse'); // initial loading skeleton renders cleanly!
  });
});
