const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMedicalRecords,
  getMedicalRecord,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  uploadMedicalFile,
  deleteMedicalFile,
  getVaccinations,
  addVaccination,
  updateVaccination,
  deleteVaccination,
} = require('../controllers/medicalController');

const router = express.Router({ mergeParams: true });
router.use(authMiddleware);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// ── Medical Records CRUD ──────────────────────────────────────────────────────
router.get('/',                          getMedicalRecords);
router.get('/:recordId',                 getMedicalRecord);
router.post('/',                         addMedicalRecord);
router.put('/:recordId',                 updateMedicalRecord);
router.delete('/:recordId',              deleteMedicalRecord);

// ── File Uploads ──────────────────────────────────────────────────────────────
const { autoExtractMedicalRecords } = require('../controllers/medicalController');
router.post('/auto-extract',             upload.array('files', 10), autoExtractMedicalRecords);
router.post('/:recordId/files',          upload.single('file'), uploadMedicalFile);
router.delete('/files/:fileId',          deleteMedicalFile);

// ── Vaccinations ──────────────────────────────────────────────────────────────
router.get('/vaccinations/list',         getVaccinations);
router.post('/vaccinations',             addVaccination);
router.put('/vaccinations/:vaccinationId',    updateVaccination);
router.delete('/vaccinations/:vaccinationId', deleteVaccination);

module.exports = router;
