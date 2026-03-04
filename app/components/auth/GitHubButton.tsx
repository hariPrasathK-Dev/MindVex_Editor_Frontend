import { useState } from 'react';

// Use the configured backend URL from environment
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

export function GitHubButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = () => {
    setIsLoading(true);

    // Redirect to backend OAuth endpoint - backend will handle redirect_uri
    window.location.href = `${API_BASE_URL}/auth/oauth2/authorize/github`;
  };

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={isLoading}
      className="w-full py-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <div className="i-ph:github-logo text-xl" />
      <span>{isLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
    </button>
  );
}
