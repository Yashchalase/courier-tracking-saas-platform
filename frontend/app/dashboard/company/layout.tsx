import { CompanyDashboardLayout } from "@/components/dashboard/company/company-dashboard-layout";
import { DashboardRoleGuard } from "@/components/dashboard/dashboard-role-guard";

export default function CompanySectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard allowedRole="COMPANY_ADMIN">
      <CompanyDashboardLayout>{children}</CompanyDashboardLayout>
    </DashboardRoleGuard>
  );
}