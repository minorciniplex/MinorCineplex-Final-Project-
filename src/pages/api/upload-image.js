import cloudinary from 'cloudinary';
import { IncomingForm } from 'formidable';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // ต้องปิด bodyParser เพื่อใช้ formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing form' });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'Missing required parameter - file' });
    }
    try {
      const result = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'profile_images', // จะเก็บในโฟลเดอร์นี้
      });
      return res.status(200).json({ secure_url: result.secure_url });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
} 