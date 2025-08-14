// pages/api/cloudinary-sign.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { upload_preset, folder, context, tags } = req.body as {
    upload_preset?: string;
    folder?: string;
    context?: string; // "name=...|message=..." (HAM UTF-8)
    tags?: string;
  };

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) return res.status(500).json({ error: 'Cloudinary API secret missing' });

  const timestamp = Math.floor(Date.now() / 1000);

  // SADECE dolu olanları dahil et, alfabetik sırayla imzala
  const params: Record<string, string> = {
    ...(context ? { context } : {}),
    ...(folder ? { folder } : {}),
    ...(tags ? { tags } : {}),
    timestamp: String(timestamp),
    ...(upload_preset ? { upload_preset } : {}),
  };

  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

  return res.status(200).json({ signature, timestamp });
}
