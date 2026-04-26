import BaseDashboardLayout from '@/components/layouts/BaseDashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <BaseDashboardLayout>{children}</BaseDashboardLayout>;
}
