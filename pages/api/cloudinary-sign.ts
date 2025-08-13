import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { upload_preset, folder, context } = req.body;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) return res.status(500).json({ error: 'Missing API secret' });

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = [
    `context=${context}`,
    `folder=${folder}`,
    `timestamp=${timestamp}`,
    `upload_preset=${upload_preset}`,
  ]
    .sort()
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  res.status(200).json({ timestamp, signature });
}
