import BaseDashboardLayout from '@/components/layouts/BaseDashboardLayout';
import MechanicChatbot from '@/components/customer/MechanicChatbot';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseDashboardLayout>
      {children}
      <MechanicChatbot />
    </BaseDashboardLayout>
  );
}
