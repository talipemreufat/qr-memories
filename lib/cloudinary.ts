// lib/cloudinary.ts

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log("Cloudinary Config:", { cloudName, uploadPreset });

  // Hata kontrolü
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary yapılandırması eksik. .env.local dosyanızı kontrol edin.");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Cloudinary Hatası:", data);
    throw new Error(data.error?.message || "Yükleme başarısız");
  }

  return data.secure_url;
}
