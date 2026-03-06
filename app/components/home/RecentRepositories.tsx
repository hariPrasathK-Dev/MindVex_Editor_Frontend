import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { repositoryHistoryStore, type RepositoryHistoryItem } from '~/lib/stores/repositoryHistory';
import { classNames } from '~/utils/classNames';
import { Clock, GitBranch, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface RecentRepositoriesProps {
  onClone?: (url: string) => void;
  limit?: number;
  className?: string;
}

/**
 * Component to display recent repositories on the homepage.
 * Shows the most recently accessed repositories with options to clone or remove.
 */
export function RecentRepositories({ onClone, limit = 5, className }: RecentRepositoriesProps) {
  const historyMap = useStore(repositoryHistoryStore.repositoryHistory);
  const isLoading = useStore(repositoryHistoryStore.isLoading);
  const [recentRepos, setRecentRepos] = useState<RepositoryHistoryItem[]>([]);

  useEffect(() => {
    // Initialize store and sync with backend
    repositoryHistoryStore.initialize();
  }, []);

  useEffect(() => {
    const repos = repositoryHistoryStore.getRecentRepositories(limit);
    setRecentRepos(repos);
  }, [historyMap, limit]);

  const handleRemove = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await repositoryHistoryStore.removeRepository(id);
      toast.success('Repository removed from history');
    } catch (error) {
      console.error('Failed to remove repository:', error);
      toast.error('Failed to remove repository');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return then.toLocaleDateString();
    }
  };

  const extractRepoInfo = (url: string) => {
    try {
      const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);

      if (match) {
        return { owner: match[1], repo: match[2].replace('.git', '') };
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={classNames('w-full', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-mindvex-elements-textSecondary" />
          <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Recent Repositories</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-mindvex-elements-borderColorActive border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (recentRepos.length === 0) {
    return null; // Don't show the section if there are no recent repos
  }

  return (
    <div className={classNames('w-full', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-mindvex-elements-textSecondary" />
        <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Recent Repositories</h3>
      </div>

      <div className="space-y-2">
        {recentRepos.map((repo) => {
          const repoInfo = extractRepoInfo(repo.url);

          return (
            <div
              key={repo.id}
              className={classNames(
                'group flex items-center justify-between',
                'p-3 rounded-lg',
                'bg-mindvex-elements-background-depth-2',
                'border border-mindvex-elements-borderColor',
                'hover:border-mindvex-elements-borderColorActive',
                'transition-all duration-200',
                'cursor-pointer',
              )}
              onClick={() => onClone?.(repo.url)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-mindvex-elements-textPrimary truncate">{repo.name}</span>
                    {repoInfo && (
                      <span className="text-xs text-mindvex-elements-textTertiary truncate">
                        {repoInfo.owner}/{repoInfo.repo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-mindvex-elements-textSecondary">
                    <span>{formatTimeAgo(repo.timestamp)}</span>
                    {repo.branch && (
                      <>
                        <span>•</span>
                        <span className="truncate">{repo.branch}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(repo.url.replace('.git', ''), '_blank');
                  }}
                  className="p-1.5 rounded-md hover:bg-mindvex-elements-background-depth-3 text-mindvex-elements-textSecondary hover:text-mindvex-elements-textPrimary transition-colors"
                  title="Open in GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleRemove(repo.id, e)}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-mindvex-elements-textSecondary hover:text-red-500 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
