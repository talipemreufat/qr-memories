// pages/api/cloudinary-sign.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { upload_preset, folder, context } = req.body as {
    upload_preset: string;
    folder?: string;
    context?: string; // "name=...|message=..."
  };

  // Cloudinary signature'da timestamp zorunlu; server'da üretelim
  const timestamp = Math.floor(Date.now() / 1000);

  // İmzalanacak parametreler (alfabetik sıralı olmalı)
  const params: Record<string, string | number> = { timestamp, upload_preset };
  if (context) params.context = context;
  if (folder) params.folder = folder;

  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  if (!apiSecret) {
    return res.status(500).json({ error: 'CLOUDINARY_API_SECRET missing on server' });
  }

  const signature = crypto
    .createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');

  return res.status(200).json({ signature, timestamp });
}
