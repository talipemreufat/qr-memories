import { useState } from 'react';
import { uploadToCloudinary } from '../lib/cloudinary';

export default function UploadPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      const uploadedUrl = await uploadToCloudinary(file);
      console.log('Yüklendi:', uploadedUrl);
      setUploadUrl(uploadedUrl);
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
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Anınız kaydedildi!</h2>
            {uploadUrl && (
              <div className="rounded-xl overflow-hidden border mt-4">
                {uploadUrl.match(/video/) ? (
                  <video src={uploadUrl} controls className="w-full max-h-[300px]" />
                ) : (
                  <img src={uploadUrl} alt="Uploaded" className="w-full" />
                )}
              </div>
            )}
            <p className="mt-4 text-gray-600">Teşekkür ederiz, {name}!</p>

            {/* Ana sayfaya dön butonu */}
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

              <label>Fotoğraf veya Video *</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />

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
