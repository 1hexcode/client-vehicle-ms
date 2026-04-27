"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/store/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordVerify: z.string(),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
}).refine((data) => data.password === data.passwordVerify, {
  message: "Passwords don't match",
  path: ["passwordVerify"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { register: registerAction } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Initializing registry protocol...');
    try {
      const { vehicleNumber, ...userData } = data;
      await registerAction(userData);
      try {
        await api.post('/api/Vehicles', { vehicleNumber, type: 'Car' });
        toast.success('Registration successful! Please verify your email.', { id: toastId });
        router.push(`/auth/verify?email=${data.email}`);
      } catch (vErr) {
        toast.success('Registration successful! Please verify your email.', { id: toastId });
        router.push(`/auth/verify?email=${data.email}`);
        console.error('User registered but vehicle failed:', vErr);
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F97316] transition-colors placeholder-gray-600 text-white";

  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
      <div className="w-full max-w-xl space-y-8 py-8">
        <div className="lg:hidden mb-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-outfit text-white">Create Account</h2>
          <p className="text-gray-500 text-sm">Fill in your details to register as a customer</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <input {...register('fullName')} className={inputClass} placeholder="John Doe" />
            {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input {...register('email')} type="email" className={inputClass} placeholder="name@example.com" />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Phone Number</label>
            <input {...register('phoneNumber')} className={inputClass} placeholder="98XXXXXXXX" />
            {errors.phoneNumber && <p className="text-red-400 text-xs">{errors.phoneNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Address</label>
            <input {...register('address')} className={inputClass} placeholder="Kathmandu, Nepal" />
            {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Vehicle Number</label>
            <input {...register('vehicleNumber')} className={inputClass} placeholder="BA 1 PA 1234" />
            {errors.vehicleNumber && <p className="text-red-400 text-xs">{errors.vehicleNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input {...register('password')} type="password" className={inputClass} placeholder="••••••••" />
            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
            <input {...register('passwordVerify')} type="password" className={inputClass} placeholder="••••••••" />
            {errors.passwordVerify && <p className="text-red-400 text-xs">{errors.passwordVerify.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#F97316] hover:underline font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
