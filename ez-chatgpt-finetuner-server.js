const https = require('https');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const cors = require('cors');

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
const upload = multer({ storage: storage });

// Handle file upload POST request
app.post('/create', upload.single('file1'), (req, res) => {
  const { name, systemPrompt, userPrompt, model } = req.body;
  const files = req.file;

  // Process the received data
  console.log('Name:', name);
  console.log('SystemPrompt:', systemPrompt);
  console.log('UserPrompt:', userPrompt);
  console.log('Files:', files);

  // Respond with success message
  res.send('Files uploaded successfully.');
});
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
