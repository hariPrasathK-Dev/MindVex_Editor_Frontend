import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Dashboard } from '~/components/dashboard/Dashboard.client';
import { BaseDashboard } from '~/components/dashboard/BaseDashboard';
import { Menu } from '~/components/sidebar/Menu.client';

export const meta: MetaFunction = () => {
  return [
    { title: 'CodeNexus - Dashboard' },
    { name: 'description', content: 'CodeNexus dashboard with code overview' },
  ];
};

export const loader = () => json({});

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full w-full bg-mindvex-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <div className="flex flex-col lg:flex-row h-full">
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div className="flex-1 flex flex-col h-full p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-mindvex-elements-textPrimary mb-2">Project Dashboard</h1>
            <p className="text-mindvex-elements-textSecondary">View code overview and analytics</p>
          </div>
          <ClientOnly fallback={<BaseDashboard />}>{() => <Dashboard />}</ClientOnly>
        </div>
      </div>
    </div>
  );
}
