const https = require('https');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const cors = require('cors');

/**
 * Endpoints
 */
const create = require('./endpoints/create')

app.use(express.static('public'));
app.use(express.json({limit: '200mb'})); 
app.use(cors());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

// Set server-wide stability service to prevent crashes

const statbilityService = async (req, res, endpoint) => {
  try {
    await endpoint(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal server error');
  }
}

const upload = multer({ storage: storage });

// Handle file upload POST request
app.post('/create', upload.single('file1'), (req, res) => statbilityService(req, res, create.create));

app.post('/test', (req, res) => res.status(200).json(req.body))

// Load SSL certificates
const options = {
  key: fs.readFileSync('/etc/ssl-keys/acur.ai/acur.ai.key'),
  cert: fs.readFileSync('/etc/ssl-keys/acur.ai/acur.ai.pem'),
};

console.log('here')
// Create HTTPS server
https.createServer(options, app).listen(6100, () => {
  console.log('Server is running on port 6100');
});
