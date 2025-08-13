// lib/cloudinary.ts
export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | string;
  context?: { custom?: { name?: string; message?: string } };
  tags?: string[];
};

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

  // Context: encode ederek yolla (Cloudinary böyle saklıyor)
  const context = `custom[name]=${encodeURIComponent(name)}|custom[message]=${encodeURIComponent(message)}`;

  // Kullanıcıya özel klasör / tag (güvenli isim)
  const safe = name.trim().length ? encodeURIComponent(name.trim()).replace(/%20/g, '_') : 'guest';
  const folder = `memories/${safe}`;
  const tags = safe;

  // 1) İmza isteği (server: /api/cloudinary-sign aynı parametreleri imzalamalı)
  const signRes = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_preset: uploadPreset, folder, context, tags }),
  });
  if (!signRes.ok) throw new Error('Signature request failed');
  const { signature, timestamp } = await signRes.json();

  // 2) Upload
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('upload_preset', uploadPreset);
  form.append('signature', signature);
  form.append('context', context);
  form.append('folder', folder);
  form.append('tags', tags);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');

  // 🔑 DÖNERKEN decode et → UI tarafı direkt gösterir
  if (data?.context?.custom) {
    if (typeof data.context.custom.name === 'string') {
      try { data.context.custom.name = decodeURIComponent(data.context.custom.name); } catch {}
    }
    if (typeof data.context.custom.message === 'string') {
      try { data.context.custom.message = decodeURIComponent(data.context.custom.message); } catch {}
    }
  }

  return data as CloudinaryUploadResult;
}
