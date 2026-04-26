"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/store/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Attempting to sign in...');
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
      <div className="w-full max-w-md space-y-8">
        <div className="lg:hidden mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-outfit text-white">Sign In</h2>
          <p className="text-gray-500 text-sm">Enter your credentials to access the portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F97316] transition-colors placeholder-gray-600 text-white"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-[#F97316] transition-colors placeholder-gray-600 text-white"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#F97316] hover:underline font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
