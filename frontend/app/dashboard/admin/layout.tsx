import { AdminDashboardLayout } from "@/components/dashboard/admin/admin-dashboard-layout";
import { DashboardRoleGuard } from "@/components/dashboard/dashboard-role-guard";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard allowedRole="SUPER_ADMIN">
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </DashboardRoleGuard>
  );
}

