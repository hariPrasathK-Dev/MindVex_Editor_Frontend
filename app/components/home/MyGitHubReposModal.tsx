import React, { useState, useEffect } from 'react';
import { Dialog, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { classNames } from '~/utils/classNames';
import {
  Github,
  X,
  Search,
  GitBranch,
  Star,
  GitFork,
  RefreshCw,
  ExternalLink,
  DownloadCloud,
  Loader2,
} from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  default_branch: string;
  updated_at: string;
  size: number;
}

interface MyGitHubReposModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (repoUrl: string) => void;
}

export function MyGitHubReposModal({ isOpen, onClose, onClone }: MyGitHubReposModalProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the configured backend URL from environment
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Not authenticated');
      }

      const connRes = await fetch(`${API_BASE_URL}/users/me/github-connection`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!connRes.ok) {
        throw new Error('Failed to fetch GitHub connection');
      }

      const connData: any = await connRes.json();

      if (!connData.connected || !connData.accessToken) {
        throw new Error('GitHub account not connected or access token missing');
      }

      const ghRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${connData.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!ghRes.ok) {
        throw new Error('Failed to fetch repositories from GitHub');
      }

      const reposData: any = await ghRes.json();
      setRepos(reposData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred fetching repositories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRepos();
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const formatSize = (kb: number) => {
    if (kb < 1024) {
      return `${kb} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Dialog
        showCloseButton={false}
        className="w-[850px] max-w-[95vw] h-[80vh] bg-[#0a0a0a] border border-white/10 !rounded-2xl !p-0 overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Github className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white mb-0">My GitHub Repositories</DialogTitle>
              <p className="text-xs text-gray-400 mt-1">Select a repository to clone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="p-6 pt-4 pb-4 border-b border-white/5 flex-shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400">
              {filteredRepos.length} of {repos.length} repositories
            </span>
            <button
              onClick={fetchRepos}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={classNames('w-3.5 h-3.5', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <select className="bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer">
              <option>Recently updated</option>
              <option>Alphabetical</option>
            </select>
            <select className="bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer">
              <option>All repositories</option>
              <option>Public</option>
              <option>Private</option>
            </select>
          </div>
        </div>

        {/* Repository Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          {loading && repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading repositories...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <Github className="w-12 h-12 opacity-20" />
              <p className="text-sm">No repositories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex flex-col bg-[#121212] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-white truncate pr-2 flex-1" title={repo.name}>
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {repo.forks_count}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 truncate">
                        <GitBranch className="w-3 h-3" /> {repo.default_branch}
                      </span>
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="truncate">{formatDate(repo.updated_at)}</span>
                    </div>
                    <div>Size: {formatSize(repo.size)}</div>
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                    <button
                      onClick={() => onClone(repo.html_url)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500/[0.15] hover:bg-orange-500/25 text-orange-500 border border-orange-500/20 text-xs font-semibold transition-colors"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      Clone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </DialogRoot>
  );
}
