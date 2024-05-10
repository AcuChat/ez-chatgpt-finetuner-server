require('dotenv').config();
const https = require('https');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const cors = require('cors');

const sql = require('./utils/sql');

/**
 * Import endpoint libraries
 */
const create = require('./endpoints/create')
const getProjects = require('./endpoints/getProjects');
const getNextAvailablePair = require('./endpoints/getNextAvailablePair');
const submission = require('./endpoints/submission');
const updateProjectStatus = require('./endpoints/updateProjectStatus');

app.use(express.static('public'));
app.use(express.json({limit: '200mb'})); 
app.use(cors());

/**
 * Clear out expired edits so that they can be reassigned
 */
const { MAX_EDIT_TIME_IN_SECONDS } = process.env; 
const expirationIntervalTime = (MAX_EDIT_TIME_IN_SECONDS + 1) * 1000;
const resetExpired = async () => {
  const curSeconds = new Date().getTime() / 1000;
  const expirationSeconds = curSeconds - MAX_EDIT_TIME_IN_SECONDS;
  const q = `UPDATE responses SET editor_id='', ts=${sql.tsDefault} WHERE ts <= ${expirationSeconds}`;
  const r = await sql.query(q);
  console.log('Expiration Interval', r);
}
setInterval(resetExpired, expirationIntervalTime);
resetExpired();
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

app.get('/getProjects', (req, res) => statbilityService(req, res, getProjects.getProjects));

app.post('/create', upload.single('file1'), (req, res) => statbilityService(req, res, create.create));
app.post('/nextAvailablePair', (req, res) => statbilityService(req, res, getNextAvailablePair.getNextAvailablePair));
app.post('/submission', (req, res) => statbilityService(req, res, submission.submission));
app.post('/update-project-status', (req, res) => statbilityService(req, res, updateProjectStatus.updateProjectStatus));

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
