const https = require('https');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const cors = require('cors');

/**
 * Import endpoint libraries
 */
const create = require('./endpoints/create')

app.use(express.static('public'));
app.use(express.json({limit: '200mb'})); 
app.use(cors());

/**
 * Configure multer for file uploads
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: storage });

/** 
 * Endpoint stability service to prevent crashes
 */ 

const statbilityService = async (req, res, endpoint) => {
  try {
    await endpoint(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal server error');
  }
}

/**
 * Endpoints
 */
app.post('/create', upload.single('file1'), (req, res) => statbilityService(req, res, create.create));


/**
 * Launch SSL Server
 */
const options = {
  key: fs.readFileSync('/etc/ssl-keys/acur.ai/acur.ai.key'),
  cert: fs.readFileSync('/etc/ssl-keys/acur.ai/acur.ai.pem'),
};

https.createServer(options, app).listen(6100, () => {
  console.log('Server is running on port 6100');
});
