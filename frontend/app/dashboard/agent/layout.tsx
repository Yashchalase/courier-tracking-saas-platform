import { AgentDashboardLayout } from "@/components/dashboard/agent/agent-dashboard-layout";
import { DashboardRoleGuard } from "@/components/dashboard/dashboard-role-guard";

export default function AgentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleGuard allowedRole="DELIVERY_AGENT">
      <AgentDashboardLayout>{children}</AgentDashboardLayout>
    </DashboardRoleGuard>
  );
}

