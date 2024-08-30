import multer from "multer";
import fs from "fs";
import path from "path";

const directory = path.resolve("images");

if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: directory,
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

export default upload;
