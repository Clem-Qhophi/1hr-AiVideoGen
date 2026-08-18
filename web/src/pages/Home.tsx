interface HomeProps {
  onNavigate: (page: 'home' | 'generate' | 'library' | 'settings' | 'progress', jobId?: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="mb-16">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
          Generate videos from prompts.
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          No camera. No editing. Just describe what you want — AI writes the script,
          generates the voiceover, builds animated visuals, and bakes the final video.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <button
          onClick={() => onNavigate('generate')}
          className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-left hover:border-zinc-700 hover:bg-zinc-900 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Generate a Video</h2>
          <p className="text-sm text-zinc-500">
            Give a topic or prompt. AI writes the script, generates voiceover, builds visuals.
          </p>
        </button>

        <button
          onClick={() => onNavigate('library')}
          className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-left hover:border-zinc-700 hover:bg-zinc-900 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Video Library</h2>
          <p className="text-sm text-zinc-500">
            View, download, and manage videos you've generated.
          </p>
        </button>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Quick start</h3>
        <ol className="space-y-2 text-sm text-zinc-500">
          <li className="flex gap-3"><span className="text-zinc-600 font-mono">1.</span> Go to Settings and add your ElevenLabs API key (for voiceover)</li>
          <li className="flex gap-3"><span className="text-zinc-600 font-mono">2.</span> Optionally add an LLM API key (OpenAI/Anthropic/Google) for AI script writing</li>
          <li className="flex gap-3"><span className="text-zinc-600 font-mono">3.</span> Click Generate, type your topic, and let the pipeline run</li>
        </ol>
        <button
          onClick={() => onNavigate('settings')}
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Go to Settings →
        </button>
      </div>
    </div>
  );
}
