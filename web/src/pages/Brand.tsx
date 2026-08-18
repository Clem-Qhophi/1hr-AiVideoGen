import { useState, useEffect } from 'react';
import { getBrand, saveBrand, type BrandConfig } from '../lib/api';

const COLOR_FIELDS = [
  { key: 'accent_color', label: 'Primary Accent', desc: 'Key words, highlights, CTAs' },
  { key: 'accent2_color', label: 'Secondary Accent', desc: 'Gradients, secondary emphasis' },
  { key: 'signal_color', label: 'Success / Positive', desc: 'Checkmarks, positive callouts' },
  { key: 'warn_color', label: 'Warning / Attention', desc: 'Highlight sweeps, attention pops' },
  { key: 'danger_color', label: 'Danger / Contrast', desc: 'Errors, negative contrast' },
  { key: 'ink_color', label: 'Ink (Text / Dark BG)', desc: 'Primary text, dark background' },
  { key: 'paper_color', label: 'Paper (Light BG)', desc: 'Light surface, cards' },
] as const;

export function Brand() {
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [form, setForm] = useState<Partial<BrandConfig>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getBrand().then(b => { setBrand(b); setForm(b); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveBrand(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!brand) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Brand</h1>
      <p className="text-zinc-500 mb-10">Customize the look of your videos. Changes apply to all new videos.</p>

      {/* Wordmark */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Wordmark</h2>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <input
              key={i}
              type="text"
              value={(form.wordmark || ['', '', ''])[i] || ''}
              onChange={e => { const wm = [...(form.wordmark || ['', '', ''])]; wm[i] = e.target.value; setForm({ ...form, wordmark: wm }); }}
              placeholder={i === 2 ? '(empty)' : `Part ${i + 1}`}
              className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">The middle part renders in the accent color. Leave part 3 empty for a two-part wordmark.</p>
        {/* Preview */}
        <div className="mt-4 bg-zinc-900/40 border border-zinc-800 rounded-lg px-6 py-4 flex items-center gap-2">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui' }}>
            {(form.wordmark || ['', '', ''])[0]}
          </span>
          <span className="text-2xl font-bold" style={{ color: form.accent_color || '#6366F1', fontFamily: 'system-ui' }}>
            {(form.wordmark || ['', '', ''])[1]}
          </span>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui' }}>
            {(form.wordmark || ['', '', ''])[2]}
          </span>
        </div>
      </section>

      {/* Colors */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Colors</h2>
        <div className="space-y-3">
          {COLOR_FIELDS.map(f => (
            <div key={f.key} className="flex items-center gap-4">
              <input
                type="color"
                value={(form as any)[f.key] || '#6366F1'}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-12 h-12 rounded-lg border border-zinc-800 bg-transparent cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-300">{f.label}</div>
                <div className="text-xs text-zinc-500">{f.desc}</div>
              </div>
              <input
                type="text"
                value={(form as any)[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-24 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Background style */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Background Style</h2>
        <div className="grid grid-cols-3 gap-2">
          {['dark', 'paper', 'ink'].map(bg => (
            <button
              key={bg}
              onClick={() => setForm({ ...form, bg_style: bg })}
              className={`p-3 rounded-lg border transition-all ${(form.bg_style || 'dark') === bg ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}
            >
              <div className={`text-sm font-medium ${(form.bg_style || 'dark') === bg ? 'text-indigo-300' : 'text-zinc-300'}`}>{bg.charAt(0).toUpperCase() + bg.slice(1)}</div>
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
      >
        {saving ? 'Saving...' : saved ? 'Saved! Brand.ts updated' : 'Save Brand'}
      </button>
      <p className="text-xs text-zinc-500 mt-3">Saving rewrites remotion/src/brand.ts. New videos will use the updated brand.</p>
    </div>
  );
}
