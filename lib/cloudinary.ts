// lib/cloudinary.ts
export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | string;
  context?: { custom?: { name?: string; message?: string } };
  tags?: string[];
};

function sanitize(v: string) {
  // Context ayraçları bozulmasın diye görsel eşdeğeriyle değiştiriyoruz
  return v
    .replace(/\|/g, '¦') // broken bar
    .replace(/&/g, '＆')  // fullwidth ampersand
    .replace(/=/g, '＝'); // fullwidth equals
}

export async function uploadToCloudinarySigned(
  file: File,
  name: string,
  message: string
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
  if (!cloudName || !uploadPreset || !apiKey) {
    throw new Error('Cloudinary config missing (check NEXT_PUBLIC_* envs).');
  }

  // 🔵 HAM UTF-8, encode yok
  const nameClean = sanitize(name.trim());
  const messageClean = sanitize(message.trim());
  const context = `name=${nameClean}|message=${messageClean}`;

  const safe = (name.trim() || 'guest').replace(/\s+/g, '_');
  const folder = `memories/${safe}`;
  const tags = safe;

  // Signature
  const signRes = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_preset: uploadPreset, folder, context, tags }),
  });
  if (!signRes.ok) throw new Error('Signature request failed');
  const { signature, timestamp } = await signRes.json();

  // Upload
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('upload_preset', uploadPreset);
  form.append('signature', signature);
  form.append('context', context); // HAM UTF-8
  form.append('folder', folder);
  form.append('tags', tags);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');

  // Geri dönerken decode yok; direkt ham metin – UI doğrudan gösterecek
  return data as CloudinaryUploadResult;
}
