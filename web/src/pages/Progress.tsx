import { useState, useEffect } from 'react';
import { getJob, videoUrl, generateCaptions, youtubeUpload, generateThumbnail, type Job } from '../lib/api';

interface ProgressProps {
  jobId: string;
  onNavigate: (page: 'home' | 'generate' | 'library' | 'settings' | 'progress', jobId?: string) => void;
}

const STEPS = [
  { label: 'Writing script', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { label: 'Generating voiceover', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { label: 'Creating master video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { label: 'Planning visual beats', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Generating visual shots', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Rendering shots', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { label: 'Baking final video', icon: 'M12 2v6m0 0a3 3 0 100 6 3 3 0 000-6zm0 0V2m0 20v-6m0 0a3 3 0 100-6 3 3 0 000 6z' },
];

export function Progress({ jobId, onNavigate }: ProgressProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [captionStatus, setCaptionStatus] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [thumbStatus, setThumbStatus] = useState('');

  useEffect(() => {
    const poll = setInterval(() => {
      getJob(jobId).then(j => {
        setJob(j);
        if (j.status === 'done' || j.status === 'failed') {
          clearInterval(poll);
        }
      }).catch(() => {});
    }, 2000);
    return () => clearInterval(poll);
  }, [jobId]);

  if (!job) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => job.step?.toLowerCase().includes(s.label.toLowerCase().split(' ')[0].toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">
        {job.status === 'done' ? 'Video Ready' : job.status === 'failed' ? 'Generation Failed' : 'Generating...'}
      </h1>
      <p className="text-zinc-500 mb-2 truncate max-w-full">{job.prompt}</p>

      {/* Progress bar */}
      <div className="mb-8 mt-6">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>{job.step || 'Queued'}</span>
          <span>{job.progress}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {job.status !== 'done' && (
        <div className="space-y-2 mb-8">
          {STEPS.map((step, i) => {
            const done = job.progress > (i + 1) * 12;
            const active = currentStepIndex === i || (job.progress >= i * 12 && job.progress < (i + 1) * 12 + 12);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  done ? 'opacity-50' : active ? 'bg-zinc-900/60' : 'opacity-30'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  done ? 'bg-emerald-500/20 text-emerald-400' : active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="text-xs">{i + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${done || active ? 'text-zinc-300' : 'text-zinc-600'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {job.status === 'failed' && (
        <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {job.error || 'Unknown error'}
        </div>
      )}

      {/* Video preview + post-generation actions */}
      {job.status === 'done' && job.video_path && (
        <div className="mb-6">
          <video
            src={videoUrl(jobId)}
            controls
            className="w-full rounded-xl border border-zinc-800 bg-black"
          />
          <div className="flex gap-3 mt-4">
            <a
              href={videoUrl(jobId)}
              download
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg text-center transition-colors"
            >
              Download Video
            </a>
            <button
              onClick={() => onNavigate('generate')}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Generate Another
            </button>
          </div>

          {/* Post-generation actions */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">Post-production</h3>

            {/* Captions */}
            <button
              onClick={async () => { setCaptionStatus('Generating...'); try { const r = await generateCaptions(jobId); setCaptionStatus(r.message || 'Done'); } catch { setCaptionStatus('Failed'); } }}
              className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 text-left text-sm text-zinc-300 transition-colors flex justify-between items-center"
            >
              <span>Add Auto-Captions (word-level subtitles)</span>
              <span className="text-xs text-zinc-500">{captionStatus}</span>
            </button>

            {/* Thumbnail */}
            <button
              onClick={async () => { setThumbStatus('Generating...'); try { const r = await generateThumbnail(jobId, job.prompt.slice(0, 80)); setThumbStatus(r.status === 'ok' ? 'Done' : r.status === 'error' ? r.error?.slice(0, 50) : 'Needs Gemini key'); } catch { setThumbStatus('Failed'); } }}
              className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 text-left text-sm text-zinc-300 transition-colors flex justify-between items-center"
            >
              <span>Generate YouTube Thumbnail</span>
              <span className="text-xs text-zinc-500">{thumbStatus}</span>
            </button>

            {/* YouTube Upload */}
            <button
              onClick={async () => { setUploadStatus('Uploading...'); try { const r = await youtubeUpload(jobId, job.prompt.slice(0, 100), '', [], 'private'); setUploadStatus(r.status === 'dry-run-ok' ? 'Ready (dry run)' : r.status === 'needs-oauth' ? 'Needs OAuth setup' : 'Done'); } catch { setUploadStatus('Failed'); } }}
              className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 text-left text-sm text-zinc-300 transition-colors flex justify-between items-center"
            >
              <span>Upload to YouTube (private draft)</span>
              <span className="text-xs text-zinc-500">{uploadStatus}</span>
            </button>
          </div>
        </div>
      )}

      {/* Script preview */}
      {job.script && (
        <details className="mt-6">
          <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-300">View Script</summary>
          <pre className="mt-3 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{job.script}</pre>
        </details>
      )}
    </div>
  );
}
