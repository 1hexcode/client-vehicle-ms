'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { api } from '@/lib/api';
import { Car, Calendar, Star, ShoppingBag } from 'lucide-react';
import WelcomeBanner from '@/components/dashboard/customer/WelcomeBanner';
import DashboardStats from '@/components/dashboard/customer/DashboardStats';
import UpcomingAppointments from '@/components/dashboard/customer/UpcomingAppointments';
import ProfileCard from '@/components/dashboard/customer/ProfileCard';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [partRequests, setPartRequests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/Vehicles').then(r => setVehicles(r.data || [])).catch(() => {});
    api.get('/api/Appointments').then(r => setAppointments(r.data || [])).catch(() => {});
    api.get('/api/part-requests').then(r => setPartRequests(r.data || [])).catch(() => {});
    api.get('/api/Reviews').then(r => setReviews(r.data || [])).catch(() => {});
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  const stats = [
    { label: 'Registered Vehicles', value: vehicles.length, icon: Car, color: '#F97316' },
    { label: 'Active Appointments', value: appointments.filter((a: any) => a.status === 'Confirmed' || a.status === 'Pending').length, icon: Calendar, color: '#22C55E' },
    { label: 'Part Requests', value: partRequests.length, icon: ShoppingBag, color: '#3B82F6' },
    { label: 'Avg Rating Given', value: avgRating, icon: Star, color: '#EAB308' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <WelcomeBanner userName={user?.fullName} />
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingAppointments appointments={appointments} />
        </div>
        <div>
          <ProfileCard user={user} />
        </div>
      </div>
    </div>
  );
}
