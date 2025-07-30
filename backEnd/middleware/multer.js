
import multer from "multer";
import path from "path";
import fs from "fs";


const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;
