import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, safe);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const mediaFilter = (_req, file, cb) => {
  const ok =
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ||
    /^video\/(mp4|webm|quicktime)$/.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error('Only image or video files are allowed'), false);
};

export const uploadMedia = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: mediaFilter,
});
