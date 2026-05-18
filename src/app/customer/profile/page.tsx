'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/store/AuthContext';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';
import { User, Mail, Phone, MapPin, Shield, Car, Calendar, Settings, Activity, Camera } from 'lucide-react';
import AddVehicleModal from '@/components/dashboard/customer/AddVehicleModal';
import EditProfileModal from '@/components/dashboard/customer/EditProfileModal';

export default function ProfilePage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/api/Vehicles');
        setVehicles(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch vehicles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    
    // Check local storage for mocked profile image
    if (user) {
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        // Mock save to local storage
        localStorage.setItem(`profile_image_${user.id}`, base64String);
        
        // In a real app, you would upload this to an endpoint:
        // api.post(`/api/Users/${user.id}/profile-picture`, formData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
  };

  if (!user) {
    return <div className="p-8 text-center text-zinc-400">Loading user profile...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-white">My Profile</h2>
          <p className="text-zinc-500 mt-1">Manage your personal information and registered vehicles.</p>
        </div>
        <button 
          onClick={() => setIsEditProfileOpen(true)}
          className="bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Settings size={16} className="text-[#F97316]" />
          Account Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
            <div className="h-24 bg-gradient-to-r from-[#F97316] to-[#ea580c] relative"></div>
            <div className="px-6 pb-6 pt-0 relative">
              <div className="relative inline-block -mt-10 mb-4">
                <div className="w-20 h-20 bg-[#1A1A1A] border-4 border-[#141414] rounded-2xl flex items-center justify-center shadow-lg overflow-hidden group">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[#F97316] uppercase">{user.fullName?.[0] || 'U'}</span>
                  )}
                  
                  {/* Image Upload Overlay */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={20} className="text-white" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white font-outfit">{user.fullName}</h3>
              <p className="text-[#F97316] text-sm font-medium mb-6">{user.role}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-500 text-xs mb-0.5">Email Address</p>
                    <p className="text-zinc-200 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-500 text-xs mb-0.5">Phone Number</p>
                    <p className="text-zinc-200">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-500 text-xs mb-0.5">Address</p>
                    <p className="text-zinc-200">{user.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                    <Shield size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-500 text-xs mb-0.5">Account Status</p>
                    <p className="text-zinc-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {/* {user.isActive ? 'Active' : 'Inactive'} */}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full mt-6 py-2.5 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#F97316]/50 transition-colors rounded-xl text-sm font-semibold text-white"
              >
                Edit Profile Info
              </button>
            </div>
          </div>

          <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
            <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#F97316]" />
              Account Activity
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-[#222] pb-3">
                <span className="text-zinc-400">Total Vehicles</span>
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">{vehicles.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[#222] pb-3">
                <span className="text-zinc-400">Member Since</span>
                <span className="font-medium text-white">2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Vehicles & Other Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
                <Car className="text-[#F97316]" />
                Registered Vehicles
              </h3>
              <div className="flex items-center gap-3">
                <span className="bg-[#F97316]/10 text-[#F97316] text-xs font-bold px-3 py-1 rounded-full border border-[#F97316]/20">
                  {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                </span>
                <button 
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-[#F97316]/20"
                >
                  Add Vehicle
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-zinc-500">Loading vehicles...</p>
              </div>
            ) : vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-[#1A1A1A] border border-[#333] hover:border-[#F97316]/50 transition-colors rounded-xl p-5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#F97316]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          {vehicle.make || 'Unknown Make'} {vehicle.model || ''}
                        </h4>
                        <p className="text-sm text-zinc-400 mt-1">{vehicle.type || 'Standard Vehicle'}</p>
                      </div>
                      <div className="bg-[#141414] border border-[#333] px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold font-mono text-[#F97316] uppercase">
                          {vehicle.vehicleNumber}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-zinc-500 text-xs mb-1">Year</p>
                        <p className="text-zinc-200 font-medium flex items-center gap-1">
                          <Calendar size={12} className="text-zinc-400" />
                          {vehicle.year || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-zinc-500 text-xs mb-1">Color</p>
                        <p className="text-zinc-200 font-medium flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full border border-white/20 inline-block shadow-inner"
                            style={{ backgroundColor: vehicle.color || 'transparent' }}
                          ></span>
                          <span className="capitalize">{vehicle.color || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-dashed border-[#333]">
                <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#222]">
                  <Car size={32} className="text-zinc-500" />
                </div>
                <h4 className="font-bold text-white mb-2">No Vehicles Registered</h4>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                  You haven't added any vehicles to your profile yet. Add a vehicle to start booking services.
                </p>
                <button 
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Add New Vehicle
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <AddVehicleModal 
        isOpen={isAddVehicleOpen} 
        onClose={() => setIsAddVehicleOpen(false)} 
        onSuccess={handleVehicleAdded} 
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={() => {
          // Success handled in modal by refreshing user context
        }}
      />
    </div>
  );
}
