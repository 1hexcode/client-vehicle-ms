import React, { useState } from 'react';
import { X, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/store/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The API endpoint for customer updates is typically /api/Customers/{id} based on the role separation
      await api.put(`/api/Customers/${user.id}`, formData);
      await refreshUser();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserIcon className="text-[#F97316]" />
            Edit Profile
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
            <input
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
              placeholder="e.g. 9840000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
              placeholder="Your address"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F97316] hover:bg-[#ea580c] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-[#F97316]/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
