import { useState, useEffect } from 'react';
import { getJobs, videoUrl, type Job } from '../lib/api';

interface LibraryProps {
  onNavigate: (page: 'home' | 'generate' | 'library' | 'settings' | 'progress', jobId?: string) => void;
}

export function Library({ onNavigate }: LibraryProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs().then(r => {
      setJobs(r.jobs || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Video Library</h1>
          <p className="text-zinc-500">Your generated videos</p>
        </div>
        <button
          onClick={() => onNavigate('generate')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Video
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">No videos yet.</p>
          <button
            onClick={() => onNavigate('generate')}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Generate your first video →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{job.prompt}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span className={`px-2 py-0.5 rounded-full ${
                      job.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
                      job.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                      'bg-indigo-500/15 text-indigo-400'
                    }`}>{job.status}</span>
                    <span>{job.delivery_mode}</span>
                    <span>{job.goal}</span>
                    <span>{new Date(job.created_at * 1000).toLocaleString()}</span>
                  </div>
                </div>
                {job.status === 'done' && job.video_path && (
                  <a
                    href={videoUrl(job.id)}
                    download
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Download
                  </a>
                )}
              </div>
              {job.status === 'failed' && job.error && (
                <p className="text-xs text-red-400/80 mt-2 truncate">{job.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
