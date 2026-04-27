'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthBranding from '@/components/auth/AuthBranding';
import { KeyRound, Loader2, ArrowLeft, RefreshCcw } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email) {
      router.push('/auth/register');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Verifying security code...');
    try {
      await api.post('/api/Users/verify-otp', { email, otp: otpString });
      toast.success('Account verified successfully!', { id: toastId });
      router.push('/auth/login?verified=true');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please try again.', { id: toastId });
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setIsResending(true);
    try {
      await api.post('/api/Users/resend-otp', email);
      toast.success('A new code has been sent to your email.');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
      <div className="w-full max-w-md space-y-8">
        <div className="lg:hidden mb-6">
          <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-outfit text-white">Verify Account</h2>
          <p className="text-gray-500 text-sm">
            We&apos;ve sent a 6-digit verification code to <span className="text-gray-300 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-[#141414] border border-[#222] rounded-xl text-center text-xl font-bold focus:outline-none focus:border-[#F97316] transition-all text-white"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Verify Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isResending}
                className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isResending ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <RefreshCcw size={14} />
                )}
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend Verification Code'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white">
      <AuthBranding 
        title="Security"
        subtitle="Check."
        description="Verify your identity to ensure the security of your vehicle data and service history."
        icon={KeyRound}
      />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#F97316]" size={40} />
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
