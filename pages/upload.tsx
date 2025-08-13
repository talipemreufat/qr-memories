// pages/upload.tsx
import { useState } from 'react';
import { uploadToCloudinarySigned, type CloudinaryUploadResult } from '../lib/cloudinary';

export default function UploadPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<CloudinaryUploadResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;

    const MAX_MB = 20;
    for (const f of files) {
      if (f.size > MAX_MB * 1024 * 1024) {
        alert(`'${f.name}' ${MAX_MB}MB sınırını aşıyor.`);
        return;
      }
    }

    try {
      setLoading(true);
      const uploaded: CloudinaryUploadResult[] = [];
      for (const f of files) {
        const res = await uploadToCloudinarySigned(f, name, message);
        uploaded.push(res);
      }
      setResults(uploaded);
      setSubmitted(true);
    } catch (err) {
      console.error('Yükleme hatası:', err);
      alert('Yükleme başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-tr from-purple-200 via-blue-100 to-white">
      <div className="upload-container">
        {submitted ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Anılarınız kaydedildi!</h2>

            {/* Ad & Mesaj (formdan) */}
            <div className="mx-auto mb-4 inline-block text-left bg-white/80 border rounded-xl p-4">
              <p className="text-sm text-gray-600"><span className="font-semibold">Ad:</span> {name}</p>
              {message && <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Mesaj:</span> {message}</p>}
            </div>

            {/* Yüklenen dosyalar */}
            {results.map((r, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border mt-4">
                {r.resource_type === 'video' ? (
                  <video src={r.secure_url} controls className="w-full max-h-[300px]" />
                ) : (
                  <img src={r.secure_url} alt={`Uploaded ${idx}`} className="w-full" />
                )}

                {/* Cloudinary metadata (decode edilmiş halde geliyor) */}
                <div className="px-3 py-2 text-sm text-gray-600">
                  {r.context?.custom?.name && (
                    <p><span className="font-semibold">Ad:</span> {r.context.custom.name}</p>
                  )}
                  {r.context?.custom?.message && (
                    <p><span className="font-semibold">Mesaj:</span> {r.context.custom.message}</p>
                  )}
                  {r.public_id && (
                    <p><span className="font-semibold">Klasör:</span> {r.public_id.split('/').slice(0, -1).join('/')}</p>
                  )}
                </div>
              </div>
            ))}

            <button
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
              onClick={() => window.location.href = '/upload'}
            >
              Yeni Bir Anı Yükle
            </button>
          </div>
        ) : (
          <>
            <h1>✨ Anılarını Paylaş</h1>
            <form onSubmit={handleSubmit}>
              <label>Adınız *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Mesaj (isteğe bağlı)</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <label>Fotoğraf veya Video (Birden Fazla Seçebilirsiniz) *</label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                required
              />
              {files.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">Seçilen dosya: {files.length}</p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? 'Yükleniyor...' : 'Gönder 📤'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
