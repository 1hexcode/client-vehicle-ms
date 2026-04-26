'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/store/AuthContext';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    setError('');
    try {
      console.log('Registering with:', data);
      // Simulate registration
      setTimeout(() => {
        login('dummy-token', {
          id: '2',
          email: data.email,
          name: data.name,
          role: 'Customer'
        });
        setIsSubmitting(false);
      }, 1500);
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
              {...register('name')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
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
              {...register('phone')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="98XXXXXXXX"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
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
              {...register('confirmPassword')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
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
