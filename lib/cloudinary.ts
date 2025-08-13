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

  // Context artık JSON formatında (Türkçe karakter desteği için)
  const contextObj = { custom: { name, message } };

  // Kullanıcıya özel klasör / tag
  const safe = name.trim().length ? name.trim().replace(/\s+/g, '_') : 'guest';
  const folder = `memories/${safe}`;
  const tags = safe;

  // 1) İmza isteği (server: /api/cloudinary-sign aynı parametreleri imzalamalı)
  const signRes = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_preset: uploadPreset, folder, context: contextObj, tags }),
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
  form.append('context', JSON.stringify(contextObj));
  form.append('folder', folder);
  form.append('tags', tags);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');

  return data as CloudinaryUploadResult;
}
