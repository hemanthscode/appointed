const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = 'uploads';
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'documents');

[UPLOAD_DIR, AVATAR_DIR, DOCUMENTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = UPLOAD_DIR;

    if (file.fieldname === 'avatar') {
      uploadDir = AVATAR_DIR;
    } else if (file.fieldname === 'documents') {
      uploadDir = DOCUMENTS_DIR;
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, baseName + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const acceptImage = file.mimetype.startsWith('image/');
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (file.fieldname === 'avatar') {
    cb(acceptImage ? null : new Error('Avatar must be an image file'), acceptImage);
  } else if (file.fieldname === 'documents') {
    cb(docTypes.includes(file.mimetype) ? null : new Error('Invalid document file type'), docTypes.includes(file.mimetype));
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  }
});

module.exports = {
  avatar: upload.single('avatar'),
  documents: upload.array('documents', 5),
  any: upload.any()
};
