// middleware/multer-config.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // dossier de destination
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = path.extname(file.originalname);
    callback(null, name + Date.now() + extension);
  }
});

module.exports = multer({ storage }).single('file');
