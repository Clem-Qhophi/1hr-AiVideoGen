import { useState, useEffect } from 'react';
import { getSettings, saveSettings, getVoices, type Settings, type Voice } from '../lib/api';

export function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s);
      setForm(s);
    });
    getVoices().then(r => { if (r.voices) setVoices(r.voices); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-zinc-500 mb-10">Configure your API keys and defaults.</p>

      {/* LLM */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">LLM Provider (for script writing)</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Provider</label>
            <select
              value={form.llm_provider || 'openai'}
              onChange={e => setForm({ ...form, llm_provider: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="openai">OpenAI (or OpenAI-compatible)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google Gemini</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">API Key</label>
            <input
              type="password"
              value={form.llm_api_key || ''}
              onChange={e => setForm({ ...form, llm_api_key: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Model</label>
            <input
              type="text"
              value={form.llm_model || ''}
              onChange={e => setForm({ ...form, llm_model: e.target.value })}
              placeholder="gpt-4o / claude-sonnet-4-20250514 / gemini-2.0-flash"
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          {form.llm_provider === 'openai' && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Base URL (optional — for OpenAI-compatible APIs like OpenRouter)</label>
              <input
                type="text"
                value={form.llm_base_url || ''}
                onChange={e => setForm({ ...form, llm_base_url: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          )}
        </div>
      </section>

      {/* ElevenLabs */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">ElevenLabs (voiceover + SFX)</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">API Key</label>
            <input
              type="password"
              value={form.elevenlabs_api_key || ''}
              onChange={e => setForm({ ...form, elevenlabs_api_key: e.target.value })}
              placeholder="Your ElevenLabs API key"
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Default Voice</label>
            <select
              value={form.default_voice || ''}
              onChange={e => setForm({ ...form, default_voice: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">Daniel (default)</option>
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Defaults */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Defaults</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Default Delivery Mode</label>
            <select
              value={form.default_delivery_mode || 'breaking-news'}
              onChange={e => setForm({ ...form, default_delivery_mode: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="breaking-news">Breaking News</option>
              <option value="calm-explainer">Calm Explainer</option>
              <option value="sarcastic-review">Sarcastic Review</option>
              <option value="authoritative">Authoritative</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Default Goal</label>
            <select
              value={form.default_goal || 'followers'}
              onChange={e => setForm({ ...form, default_goal: e.target.value })}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="followers">Followers</option>
              <option value="watch-time">Watch Time</option>
              <option value="authority">Authority</option>
              <option value="views">Views / CTR</option>
            </select>
          </div>
        </div>
      </section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
