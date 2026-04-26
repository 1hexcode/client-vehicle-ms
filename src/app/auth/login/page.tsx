'use client';

import AuthBranding from '@/components/auth/AuthBranding';
import LoginForm from '@/components/auth/LoginForm';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white">
      <AuthBranding 
        title="Welcome"
        subtitle="Back."
        description="Access your dashboard to manage inventory, track orders, and monitor vehicle services in real-time."
        icon={Shield}
      />
      <LoginForm />
    </div>
  );
}
