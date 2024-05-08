const sql = require('../utils/sql');
const { v4: uuidv4 } = require('uuid');

exports.create = async (req, res) => {
    const { name, systemPrompt, userPrompt, model, openAiKey } = req.body;
    const files = req.file;
  
    // Process the received data
    console.log('Name:', name);
    console.log('SystemPrompt:', systemPrompt);
    console.log('UserPrompt:', userPrompt);
    console.log('Files:', files);

    const projectId = uuidv4();
    // populate the projects table
        // status 'creating'

    res.send('ok');

    // cycle through inputs
        // check if project_id / input is already in database
            // if yes, continue to next input

        // send command to model
        
        // add response row to database

    // set project status to 'created'
  
    // Respond with success message
}