"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  UserCircle,
  Lock,
  Building,
  Globe,
  DollarSign,
  Percent,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { ApiResponse, MeProfile } from "@/types";
import ProfileForm, { ProfileFormValues } from "@/components/admin/ProfileForm";
import ChangePasswordForm, { ChangePasswordFormValues } from "@/components/admin/ChangePasswordForm";
import SystemSettingsForm, { SystemSettingsFormValues } from "@/components/admin/SystemSettingsForm";

type TabKey = "system" | "profile" | "security";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<TabKey>("system");

  // ── System Settings ──────────────────────────────────────
  const [systemSettings, setSystemSettings] = useState<SystemSettingsFormValues | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSystemSettings = async () => {
    try {
      setSettingsLoading(true);
      const res: ApiResponse<SystemSettingsFormValues> = await api.get("/api/settings");
      if (res.success && res.data) {
        setSystemSettings(res.data);
      } else {
        toast.error(res.message || "Failed to load system settings");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load system settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "system") fetchSystemSettings();
  }, [tab]);

  const handleSaveSettings = async (data: SystemSettingsFormValues) => {
    try {
      setSavingSettings(true);
      const res: ApiResponse<SystemSettingsFormValues> = await api.put("/api/settings", data);
      if (res.success) {
        toast.success(res.message || "System settings updated");
        if (res.data) setSystemSettings(res.data);
        else fetchSystemSettings();
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Profile / Password ───────────────────────────────────
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res: ApiResponse<MeProfile> = await api.get("/api/me");
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        toast.error(res.message || "Failed to load profile");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "profile") fetchProfile();
  }, [tab]);

  const handleSaveProfile = async (data: ProfileFormValues) => {
    try {
      setSavingProfile(true);
      const res: ApiResponse<MeProfile> = await api.put("/api/me", data);
      if (res.success) {
        toast.success(res.message || "Profile updated");
        if (res.data) setProfile(res.data);
        else fetchProfile();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormValues) => {
    try {
      setSavingPassword(true);
      const res: ApiResponse<string> = await api.post("/api/me/change-password", data);
      if (res.success) {
        toast.success(res.message || "Password updated");
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-orange-600 animate-spin-slow" />
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage system configurations and your account profile
        </p>
      </div>

      <div className="flex bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-[#222] rounded-xl p-1 w-fit">
        <TabButton active={tab === "system"} onClick={() => setTab("system")} icon={SettingsIcon}>
          System Settings
        </TabButton>
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={UserCircle}>
          My Profile
        </TabButton>
        <TabButton active={tab === "security"} onClick={() => setTab("security")} icon={Lock}>
          Security
        </TabButton>
      </div>

      {tab === "system" && (
        <div className="max-w-4xl">
          <SectionCard
            title="System Settings"
            description="Configure store settings, tax rates, contact information and currencies used across the platform"
          >
            {settingsLoading && !systemSettings ? (
              <SkeletonRows />
            ) : (
              <SystemSettingsForm
                initialData={systemSettings}
                onSubmit={handleSaveSettings}
                isLoading={savingSettings}
              />
            )}
          </SectionCard>
        </div>
      )}

      {tab === "profile" && (
        <div className="max-w-4xl">
          <SectionCard
            title="Personal Information"
            description="Update your contact info, full name, phone number, and street address"
          >
            {profileLoading && !profile ? (
              <SkeletonRows />
            ) : (
              <ProfileForm
                initialData={profile}
                onSubmit={handleSaveProfile}
                isLoading={savingProfile}
              />
            )}
          </SectionCard>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-4xl">
          <SectionCard
            title="Change Password"
            description="Secure your account using a strong and unique password that you do not reuse elsewhere"
          >
            <ChangePasswordForm onSubmit={handleChangePassword} isLoading={savingPassword} />
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white dark:bg-[#1A1A1A] text-zinc-900 dark:text-white shadow-sm"
          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-zinc-200 dark:border-[#222] p-6 space-y-5 shadow-xl shadow-black/5">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
        )}
      </div>
      <div className="border-t border-zinc-100 dark:border-[#222] pt-5">
        {children}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-32 mt-4" />
    </div>
  );
}
