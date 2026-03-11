import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { GitUrlImport } from '~/components/git/GitUrlImport.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { ProjectAwareLayout } from '~/components/ui/ProjectAwareLayout';

export const meta: MetaFunction = () => {
  return [{ title: 'CodeNexus - Git' }, { name: 'description', content: 'Clone repositories from GitHub' }];
};

export async function loader(args: LoaderFunctionArgs) {
  return json({ url: args.params.url });
}

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-mindvex-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <div className="flex flex-col lg:flex-row h-full">
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <ProjectAwareLayout>
          <ClientOnly fallback={<div className="flex items-center justify-center h-full" />}>
            {() => <GitUrlImport />}
          </ClientOnly>
        </ProjectAwareLayout>
        <ClientOnly>{() => <Workbench chatStarted={true} isStreaming={false} />}</ClientOnly>
      </div>
    </div>
  );
}
