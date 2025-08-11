import { useState } from 'react';
import { uploadToCloudinary } from '../lib/cloudinary';

export default function UploadPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploadUrls, setUploadUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;

    try {
      setLoading(true);
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const uploadedUrl = await uploadToCloudinary(file);
        uploadedUrls.push(uploadedUrl);
      }
      console.log('Tüm dosyalar yüklendi:', uploadedUrls);
      setUploadUrls(uploadedUrls);
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
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Anılarınız kaydedildi!</h2>
            
            {uploadUrls.map((url, index) => (
              <div key={index} className="rounded-xl overflow-hidden border mt-4">
                {url.match(/video/) ? (
                  <video src={url} controls className="w-full max-h-[300px]" />
                ) : (
                  <img src={url} alt={`Uploaded ${index}`} className="w-full" />
                )}
              </div>
            ))}

            <p className="mt-4 text-gray-600">Teşekkür ederiz, {name}!</p>

            {/* Yeniden yükleme butonu */}
            <button
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
              onClick={() => window.location.href = '/upload'}
            >
              Yeni Anı Yükle
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
