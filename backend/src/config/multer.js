const multer = require('multer');
const path = require('path');
const constants = require('../utils/constants');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'documents';
    if (file.fieldname === 'avatar') folder = 'avatars';
    cb(null, path.join(__dirname, '../../uploads', folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (file.fieldname === 'avatar')
    ? constants.FILE_LIMITS.AVATAR.ALLOWED_TYPES
    : constants.FILE_LIMITS.DOCUMENTS.ALLOWED_TYPES;
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const limits = {
  fileSize: constants.FILE_LIMITS.DOCUMENTS.MAX_SIZE,
  files: 10
};

const avatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: constants.FILE_LIMITS.AVATAR.MAX_SIZE, files: 1 },
}).single('avatar');

const documents = multer({
  storage,
  fileFilter,
  limits
}).array('documents', 10);

module.exports = {
  avatar,
  documents,
  any: multer({ storage, fileFilter, limits }).any()
};
