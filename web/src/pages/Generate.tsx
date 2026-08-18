import { useState, useEffect, useRef } from 'react';
import { generateVideo, getVoices, getSettings, improvePrompt, uploadRecording, voicePreview, type Voice } from '../lib/api';

interface GenerateProps {
  onNavigate: (page: 'home' | 'generate' | 'library' | 'settings' | 'progress', jobId?: string) => void;
}

const DELIVERY_MODES = [
  { id: 'breaking-news', label: 'Breaking News', desc: 'Urgent, fast-paced, punchy' },
  { id: 'calm-explainer', label: 'Calm Explainer', desc: 'Measured, educational, clear' },
  { id: 'sarcastic-review', label: 'Sarcastic Review', desc: 'Dry, opinionated, witty' },
  { id: 'authoritative', label: 'Authoritative', desc: 'Confident, declarative, no hedging' },
];

const GOALS = [
  { id: 'followers', label: 'Followers', desc: 'Aggressive CTA, irresistible hook' },
  { id: 'watch-time', label: 'Watch Time', desc: 'Open loops, payoff at end' },
  { id: 'authority', label: 'Authority', desc: 'Cite sources, measured tone' },
  { id: 'views', label: 'Views / CTR', desc: 'Bold claims, controversy' },
];

export function Generate({ onNavigate }: GenerateProps) {
  const [mode, setMode] = useState<'prompt' | 'upload'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [improving, setImproving] = useState(false);
  const [useImproved, setUseImproved] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('breaking-news');
  const [goal, setGoal] = useState('followers');
  const [voice, setVoice] = useState('');
  const [duration, setDuration] = useState(3);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceError, setVoiceError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSettings().then(s => {
      if (s.default_voice) setVoice(s.default_voice);
      if (s.default_delivery_mode) setDeliveryMode(s.default_delivery_mode);
      if (s.default_goal) setGoal(s.default_goal);
    });
    getVoices().then(r => {
      if (r.voices) setVoices(r.voices);
      if (r.error) setVoiceError(r.error);
    });
  }, []);

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    if (!u.startsWith('http')) { setError('URL must start with http:// or https://'); return; }
    setUrls([...urls, u]);
    setUrlInput('');
    setError('');
  };

  const removeUrl = (i: number) => setUrls(urls.filter((_, idx) => idx !== i));

  const handleImprove = async () => {
    if (!prompt.trim()) return;
    setImproving(true);
    setError('');
    try {
      const result = await improvePrompt({ prompt, delivery_mode: deliveryMode, goal });
      setImprovedPrompt(result.improved_prompt);
      setUseImproved(true);
    } catch { setError('Prompt improvement failed. Check your LLM API key in Settings.'); }
    setImproving(false);
  };

  const handleGenerate = async () => {
    const finalPrompt = useImproved && improvedPrompt ? improvedPrompt : prompt;
    if (!finalPrompt.trim()) { setError('Enter a topic or prompt first'); return; }
    setGenerating(true);
    setError('');
    try {
      const result = await generateVideo({
        prompt: finalPrompt, delivery_mode: deliveryMode, goal,
        voice: voice || 'onwK4e9ZLuTAKqWW03F9', duration_minutes: duration, urls,
        improved_prompt: useImproved ? improvedPrompt : undefined,
      });
      onNavigate('progress', result.job_id);
    } catch { setError('Failed to start generation. Is the backend running?'); setGenerating(false); }
  };

  const handleUploadGenerate = async () => {
    if (!uploadFile) { setError('Upload a screen recording first'); return; }
    if (!uploadDescription.trim()) { setError('Describe what the recording shows'); return; }
    setGenerating(true);
    setError('');
    try {
      const result = await uploadRecording(uploadFile, uploadDescription, deliveryMode, goal, voice);
      onNavigate('progress', result.job_id);
    } catch { setError('Failed to upload. Is the backend running?'); setGenerating(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setUploadFile(f);
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Generate a Video</h1>
      <p className="text-zinc-500 mb-8">Describe a topic, drop links, or upload a screen recording.</p>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-8 bg-zinc-900/40 border border-zinc-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('prompt')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${mode === 'prompt' ? 'bg-zinc-700/80 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >From Prompt</button>
        <button
          onClick={() => setMode('upload')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${mode === 'upload' ? 'bg-zinc-700/80 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >From Screen Recording</button>
      </div>

      {mode === 'prompt' && (
        <>
          {/* Prompt */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-zinc-300">Topic / Prompt</label>
              <button onClick={handleImprove} disabled={!prompt.trim() || improving}
                className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed">
                {improving ? 'Improving...' : 'Improve Prompt →'}
              </button>
            </div>
            <textarea value={prompt} onChange={e => { setPrompt(e.target.value); setUseImproved(false); }}
              placeholder="e.g., Google's Gemini 3.5 Pro was supposed to launch in June but still isn't out..."
              rows={4}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
          </div>

          {improvedPrompt && (
            <div className="mb-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-indigo-300">Improved Prompt</span>
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={useImproved} onChange={e => setUseImproved(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-900 text-indigo-500" /> Use this version
                </label>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{improvedPrompt}</p>
            </div>
          )}

          {/* URLs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Reference Links <span className="text-zinc-600 font-normal">(optional — we'll fetch + screenshot them)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addUrl()}
                placeholder="https://example.com/article"
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50" />
              <button onClick={addUrl} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 rounded-lg transition-colors">Add</button>
            </div>
            {urls.length > 0 && (
              <div className="space-y-1">
                {urls.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-zinc-400 truncate flex-1">{u}</span>
                    <button onClick={() => removeUrl(i)} className="text-zinc-600 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'upload' && (
        <>
          {/* File upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Screen Recording</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500/50 transition-colors"
            >
              {uploadFile ? (
                <div>
                  <p className="text-sm text-zinc-300">{uploadFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB — click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-zinc-400">Click to upload a screen recording</p>
                  <p className="text-xs text-zinc-600 mt-1">MP4, MOV, or WebM</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What does the recording show? <span className="text-zinc-600 font-normal">(be specific — AI writes the script from this)</span>
            </label>
            <textarea value={uploadDescription} onChange={e => setUploadDescription(e.target.value)}
              placeholder="e.g., Walking through the settings panel of an app — showing how to configure API keys, change the model, and set up custom rules."
              rows={3}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
          </div>
        </>
      )}

      {/* Delivery mode */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3">Delivery Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {DELIVERY_MODES.map(m => (
            <button key={m.id} onClick={() => setDeliveryMode(m.id)}
              className={`text-left p-3 rounded-lg border transition-all ${deliveryMode === m.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}>
              <div className={`text-sm font-medium ${deliveryMode === m.id ? 'text-indigo-300' : 'text-zinc-300'}`}>{m.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3">Goal</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className={`text-left p-3 rounded-lg border transition-all ${goal === g.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}>
              <div className={`text-sm font-medium ${goal === g.id ? 'text-emerald-300' : 'text-zinc-300'}`}>{g.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice + Duration (duration only for prompt mode) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Voice</label>
          {voiceError && <div className="text-xs text-amber-400/80 mb-2">{voiceError}</div>}
          <div className="flex gap-2">
            <select value={voice} onChange={e => setVoice(e.target.value)}
              className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50">
              <option value="">Default</option>
              {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button
              onClick={async () => { setPreviewing(true); setPreviewUrl(''); try { const r = await voicePreview('This is a voice preview for Framewright.', voice || 'en-US-GuyNeural', 1.0); setPreviewUrl(r.url); } catch { setPreviewUrl(''); } setPreviewing(false); }}
              disabled={previewing}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 rounded-lg transition-colors whitespace-nowrap"
            >
              {previewing ? '...' : 'Preview'}
            </button>
          </div>
          {previewUrl && (
            <audio src={`http://localhost:8000${previewUrl}`} controls className="w-full mt-2 h-8" />
          )}
        </div>
        {mode === 'prompt' && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Duration (minutes)</label>
            <input type="range" min={1} max={10} value={duration} onChange={e => setDuration(Number(e.target.value))}
              className="w-full mt-3 accent-indigo-500" />
            <div className="text-sm text-zinc-400 mt-1">{duration} min</div>
          </div>
        )}
      </div>

      {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>}

      {/* Generate button */}
      <button
        onClick={mode === 'prompt' ? handleGenerate : handleUploadGenerate}
        disabled={generating || (mode === 'prompt' ? !prompt.trim() && !useImproved : !uploadFile || !uploadDescription.trim())}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
        {generating ? (
          <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>Starting...</>
        ) : (mode === 'prompt' ? 'Generate Video' : 'Upload & Generate')}
      </button>
    </div>
  );
}
