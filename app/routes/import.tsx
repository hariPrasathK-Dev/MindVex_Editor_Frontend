import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Import } from '~/components/import/Import.client';
import { BaseImport } from '~/components/import/BaseImport';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { ProjectAwareLayout } from '~/components/ui/ProjectAwareLayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'CodeNexus - Import Folder' },
    { name: 'description', content: 'Import folders into your workspace' },
  ];
};

export const loader = () => json({});

export default function ImportPage() {
  return (
    <div className="flex flex-col h-full w-full bg-mindvex-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <div className="flex flex-col lg:flex-row h-full">
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <ProjectAwareLayout title="Import Project" description="Import files and start working with AI">
          <ClientOnly fallback={<BaseImport />}>{() => <Import />}</ClientOnly>
        </ProjectAwareLayout>
        <ClientOnly>{() => <Workbench chatStarted={true} isStreaming={false} />}</ClientOnly>
      </div>
    </div>
  );
}
