"use client";

import Link from "next/link";

interface ProfileCardProps {
  user: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
  } | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-outfit">My Profile</h3>
      <div className="bg-[#141414] rounded-2xl border border-[#222] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#F97316] rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {user?.fullName?.[0]}
          </div>
          <div>
            <h4 className="font-bold">{user?.fullName}</h4>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-[#222]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-300">{user?.phoneNumber || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Source</span>
            <span className="text-gray-400 text-xs text-right">System Seed</span>
          </div>
        </div>
        <Link href="/customer/profile" className="block w-full text-center py-3 bg-[#1A1A1A] border border-[#222] rounded-xl text-sm font-semibold hover:border-[#F97316]/40 transition-colors text-white">
          Edit Profile Info
        </Link>
      </div>
    </div>
  );
}
