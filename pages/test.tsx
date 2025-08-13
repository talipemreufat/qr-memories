export default function Test() {
  return (
    <div>
      <p>{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</p>
    </div>
  );
}
