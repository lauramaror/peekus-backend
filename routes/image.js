const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const router = Router();

const {
    getImages,
    saveImage
} = require('../controllers/image');

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function(req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// });
// const fileFilter = (req, file, cb) => {
//     var ext = path.extname(file.originalname);
//     if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
//         return cb(new Error('Only images are allowed'))
//     }
//     cb(null, true)
// };
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limit: {
//         fieldSize: 5 * 1024 * 1024
//     }
// });

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getImages);

// router.post('/', upload.single('image'), [validateJWT], saveImage);
router.post('/', [validateJWT], saveImage);

module.exports = router;