const API = 'http://localhost:8000';

export interface Job {
  id: string;
  project: string;
  prompt: string;
  delivery_mode: string;
  goal: string;
  status: string;
  progress: number;
  step: string;
  video_path: string | null;
  script: string | null;
  error: string | null;
  created_at: number;
}

export interface Settings {
  llm_provider: string;
  llm_api_key: string;
  llm_model: string;
  llm_base_url: string;
  elevenlabs_api_key: string;
  gemini_api_key: string;
  default_voice: string;
  default_delivery_mode: string;
  default_goal: string;
}

export interface Voice {
  id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
}

export async function getSettings(): Promise<Settings> {
  const r = await fetch(`${API}/api/settings`);
  return r.json();
}

export async function saveSettings(data: Partial<Settings>): Promise<any> {
  const r = await fetch(`${API}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function getVoices(): Promise<{ voices: Voice[]; error?: string }> {
  const r = await fetch(`${API}/api/voices`);
  return r.json();
}

export async function generateVideo(data: {
  prompt: string;
  delivery_mode: string;
  goal: string;
  voice: string;
  duration_minutes: number;
  urls?: string[];
  improved_prompt?: string;
}): Promise<{ job_id: string; status: string }> {
  const r = await fetch(`${API}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function improvePrompt(data: {
  prompt: string;
  delivery_mode: string;
  goal: string;
}): Promise<{ improved_prompt: string }> {
  const r = await fetch(`${API}/api/improve-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function fetchUrl(url: string): Promise<{
  url: string; title: string; text: string; screenshot: string; source_label: string;
}> {
  const r = await fetch(`${API}/api/fetch-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function uploadRecording(
  file: File,
  description: string,
  deliveryMode: string,
  goal: string,
  voice: string,
): Promise<{ job_id: string; status: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  formData.append('delivery_mode', deliveryMode);
  formData.append('goal', goal);
  formData.append('voice', voice);
  const r = await fetch(`${API}/api/upload-recording`, {
    method: 'POST',
    body: formData,
  });
  return r.json();
}

export async function translateScript(script: string, targetLanguage: string): Promise<{
  translated_script: string; language: string;
}> {
  const r = await fetch(`${API}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script, target_language: targetLanguage }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function voicePreview(text: string, voice: string, speed: number = 1.0): Promise<{
  url: string; provider: string;
}> {
  const r = await fetch(`${API}/api/voice-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, speed }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function generateCaptions(jobId: string): Promise<{ status: string; message: string }> {
  const r = await fetch(`${API}/api/captions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId }),
  });
  return r.json();
}

export async function youtubeUpload(jobId: string, title: string, description: string, tags: string[], privacy: string): Promise<any> {
  const r = await fetch(`${API}/api/youtube-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, title, description, tags, privacy }),
  });
  return r.json();
}

export async function generateThumbnail(jobId: string, title: string): Promise<any> {
  const r = await fetch(`${API}/api/thumbnail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, title }),
  });
  return r.json();
}

export interface BrandConfig {
  wordmark: string[];
  accent_color: string;
  accent2_color: string;
  signal_color: string;
  warn_color: string;
  danger_color: string;
  ink_color: string;
  paper_color: string;
  bg_style: string;
}

export async function getBrand(): Promise<BrandConfig> {
  const r = await fetch(`${API}/api/brand`);
  return r.json();
}

export async function saveBrand(data: Partial<BrandConfig>): Promise<{ status: string; brand: BrandConfig }> {
  const r = await fetch(`${API}/api/brand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function getJob(jobId: string): Promise<Job> {
  const r = await fetch(`${API}/api/jobs/${jobId}`);
  return r.json();
}

export async function getJobs(): Promise<{ jobs: Job[] }> {
  const r = await fetch(`${API}/api/jobs`);
  return r.json();
}

export function videoUrl(jobId: string): string {
  return `${API}/api/video/${jobId}`;
}
