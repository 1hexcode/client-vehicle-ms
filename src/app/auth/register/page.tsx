'use client';

import AuthBranding from '@/components/auth/AuthBranding';
import RegisterForm from '@/components/auth/RegisterForm';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white">
      <AuthBranding 
        title="Join the"
        subtitle="VehicleMS Community."
        description="Register as a customer to manage your vehicles, book appointments, and access premium AI-powered diagnostics."
        icon={UserPlus}
      />
      <RegisterForm />
    </div>
  );
}
