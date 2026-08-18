import { useState } from 'react';
import { Home } from './pages/Home';
import { Generate } from './pages/Generate';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { Library } from './pages/Library';
import { Brand } from './pages/Brand';

type Page = 'home' | 'generate' | 'progress' | 'settings' | 'library' | 'brand';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const navigate = (p: Page, jobId?: string) => {
    if (jobId) setActiveJobId(jobId);
    setPage(p);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'generate', label: 'Generate', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'library', label: 'Library', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z' },
    { id: 'brand', label: 'Brand', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a4 4 0 01-4 4z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0b0f]">
      {/* Sidebar */}
      <nav className="w-60 border-r border-zinc-800/60 flex flex-col p-4 gap-1">
        <div className="px-3 py-4 mb-2">
          <h1 className="text-lg font-bold text-white tracking-tight">Framewright</h1>
          <p className="text-xs text-zinc-500 mt-1">AI Video Generator</p>
        </div>
        {[
          { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'generate', label: 'Generate', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { id: 'library', label: 'Library', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z' },
          { id: 'brand', label: 'Brand', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a4 4 0 01-4 4z' },
          { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id as Page)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              page === item.id
                ? 'bg-zinc-800/80 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
        <div className="mt-auto px-3 py-2">
          <p className="text-xs text-zinc-600">v1.0 · Built with Remotion</p>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'generate' && <Generate onNavigate={navigate} />}
        {page === 'progress' && activeJobId && <Progress jobId={activeJobId} onNavigate={navigate} />}
        {page === 'settings' && <Settings />}
        {page === 'library' && <Library onNavigate={navigate} />}
        {page === 'brand' && <Brand />}
      </main>
    </div>
  );
}
