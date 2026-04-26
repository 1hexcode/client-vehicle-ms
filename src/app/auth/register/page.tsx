'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/store/AuthContext';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordVerify: z.string(),
  // vehicleNumber is not in RegisterUserDto, we'll handle it separately or keep it for later
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
}).refine((data) => data.password === data.passwordVerify, {
  message: "Passwords don't match",
  path: ["passwordVerify"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerAction } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    setError('');
    try {
      // 1. Register User
      const { vehicleNumber, ...userData } = data;
      await registerAction(userData);
      
      // 2. Register Vehicle (Optional if you want to do it immediately)
      try {
        await api.post('/api/Vehicles', {
          vehicleNumber: vehicleNumber,
          type: 'Car' // Default type or add select
        });
      } catch (vErr) {
        console.error('User registered but vehicle failed:', vErr);
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.1),transparent)]">
      <div className="glass w-full max-w-lg p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-outfit mb-2">Join VehicleMS</h2>
          <p className="text-zinc-400">Register as a customer to manage your vehicle</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-zinc-300">Full Name</label>
            <input
              {...register('fullName')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Phone Number</label>
            <input
              {...register('phoneNumber')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="98XXXXXXXX"
            />
            {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-zinc-300">Address</label>
            <input
              {...register('address')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Kathmandu, Nepal"
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-zinc-300">Vehicle Number</label>
            <input
              {...register('vehicleNumber')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="BA 1 PA 1234"
            />
            {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1">{errors.vehicleNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Confirm Password</label>
            <input
              {...register('passwordVerify')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
            {errors.passwordVerify && <p className="text-red-400 text-xs mt-1">{errors.passwordVerify.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
