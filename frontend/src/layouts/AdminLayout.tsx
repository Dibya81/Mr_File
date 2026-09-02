import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const defaultBreadcrumbs = [
    { label: t('admin.section.main') },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
