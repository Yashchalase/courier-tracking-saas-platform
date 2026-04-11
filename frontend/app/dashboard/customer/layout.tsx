import { CustomerDashboardLayout } from "@/components/dashboard/customer/customer-dashboard-layout";
import { DashboardRoleGuard } from "@/components/dashboard/dashboard-role-guard";

export default function CustomerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard allowedRole="CUSTOMER">
      <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
    </DashboardRoleGuard>
  );
}

