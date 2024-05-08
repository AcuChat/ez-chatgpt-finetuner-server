const sql = require('../utils/sql');
const ai = require('../utils/ai');

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

exports.create = async (req, res) => {
    const { name, systemPrompt, userPrompt, model, openaiKey } = req.body;
    const files = req.file;
  
    // Process the received data
    console.log('Name:', name);
    console.log('SystemPrompt:', systemPrompt);
    console.log('UserPrompt:', userPrompt);
    console.log('Files:', files);

    // populate the projects table with status = 'creating'
    const projectId = uuidv4();
    let q = `INSERT INTO projects (project_id, project_name, system_prompt, user_prompt, model, openai_key, status, info) 
    VALUES('${projectId}', ${sql.escape(name)}, ${sql.escape(systemPrompt)}, ${sql.escape(userPrompt)}, ${sql.escape(model)}, ${sql.escape(openaiKey)}, 'creating', '{}')`;
    let r = await sql.query(q);
    
    res.send('ok');

    fs.readFile(files.path, "utf8", async (err, data) => {
        lines = data.split("\n");

        for (let i = 0; i < lines.length; ++i) {
            let q = `SELECT response_id FROM responses WHERE project_id = '${projectId}' AND input = ${sql.escape(lines[i])}`;
            let r = await sql.query(q);
            if (r.length) continue;

            const prompt = userPrompt + lines[i];
            const messages = ai.initialMessagePair(prompt, systemPrompt);
            console.log(messages);
            break;
        }



    })
    
    // cycle through inputs
        // check if project_id / input is already in database
            // if yes, continue to next input

        // send command to model
        
        // add response row to database

    // set project status to 'created'
  
    // Respond with success message
}