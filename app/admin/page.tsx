import React from 'react';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const metadata = {
  title: 'Admin Operations — Palette Hubb',
  description: 'Manage dropship fulfillment, inventory, and supplier operations.',
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
