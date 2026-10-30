import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DonationDetailPage } from '../pages/DonationDetailPage';
import { ClaimCard } from '../components/claims/ClaimCard';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { Claim } from '../types';

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

  it('enforces two-party PIN protection: recipient does not see donor pickup PIN', () => {
    // Set recipient as active user
    localStorage.setItem(
      'shareplate_current_user',
      JSON.stringify({
        id: 'b0000000-0000-0000-0000-000000000001',
        email: 'rajesh@robinhoodarmy.org',
        full_name: 'Rajesh Kumar',
        role: 'recipient',
      })
    );

    const mockClaim: Claim = {
      id: 'claim-test-01',
      donation_id: 'd001',
      recipient_id: 'b0000000-0000-0000-0000-000000000001',
      quantity_claimed: 30,
      status: 'claimed',
      pickup_code: '4821',
      delivery_code: '7392',
      claimed_at: new Date().toISOString(),
      donation: {
        id: 'd001',
        donor_id: 'donor-01',
        title: 'Fresh Bread Loaves',
        description: 'Fresh multigrain bakery bread',
        category: 'bakery',
        quantity_total: 50,
        quantity_available: 20,
        quantity_unit: 'portions',
        status: 'reserved',
        pickup_deadline: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
        city: 'Delhi NCR',
        location_label: 'DTU Campus',
      },
    };

    const html = renderToString(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <ClaimCard
              claim={mockClaim}
              onCancel={async () => {}}
              onCollect={async () => {}}
              onDeliver={async () => {}}
            />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Recipient must see their delivery code (7392)
    expect(html).toContain('7392');
    expect(html).toContain('Delivery Code:');
    // Recipient must NOT see the donor's private pickup code (4821)
    expect(html).not.toContain('4821');
    expect(html).toContain('Protected PIN (Held by Donor Kitchen)');
  });

  it('enforces two-party PIN protection: donor does not see recipient delivery PIN', () => {
    // Set donor as active user
    localStorage.setItem(
      'shareplate_current_user',
      JSON.stringify({
        id: 'a0000000-0000-0000-0000-000000000001',
        email: 'priya@dtucanteen.org',
        full_name: 'Priya Sharma',
        role: 'donor',
      })
    );

    const mockClaim: Claim = {
      id: 'claim-test-02',
      donation_id: 'd001',
      recipient_id: 'b0000000-0000-0000-0000-000000000001',
      quantity_claimed: 30,
      status: 'claimed',
      pickup_code: '4821',
      delivery_code: '7392',
      claimed_at: new Date().toISOString(),
      donation: {
        id: 'd001',
        donor_id: 'a0000000-0000-0000-0000-000000000001',
        title: 'Fresh Bread Loaves',
        description: 'Fresh multigrain bakery bread',
        category: 'bakery',
        quantity_total: 50,
        quantity_available: 20,
        quantity_unit: 'portions',
        status: 'reserved',
        pickup_deadline: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
        city: 'Delhi NCR',
        location_label: 'DTU Campus',
      },
    };

    const html = renderToString(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <ClaimCard
              claim={mockClaim}
              onCancel={async () => {}}
              onCollect={async () => {}}
              onDeliver={async () => {}}
            />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Donor must see their pickup code (4821)
    expect(html).toContain('4821');
    expect(html).toContain('Pickup Code:');
    // Donor must NOT see the recipient's private delivery code (7392)
    expect(html).not.toContain('7392');
    expect(html).toContain('Protected PIN (Held by Recipient Shelter)');
  });
});
