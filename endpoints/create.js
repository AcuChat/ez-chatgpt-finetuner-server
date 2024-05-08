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
        const lines = data.split("\n");

        for (let i = 0; i < lines.length; ++i) {
            if (!lines[i]) continue; // ignore empty lines
            const line = JSON.parse(lines[i]);
            let q = `SELECT response_id FROM responses WHERE project_id = '${projectId}' AND input = ${sql.escape(line)}`;
            let r = await sql.query(q);
            if (r.length) continue;

            const prompt = userPrompt + lines[i];
            const messages = ai.initialMessagePair(prompt, systemPrompt);

            const result = await ai.openAIGenericChatCompletion(openaiKey, model, messages);
            
            if (result.status === 'success') {
                const responseId = uuidv4();
                q = `INSERT INTO responses (response_id, project_id, input, orig_output, status, info) 
                VALUES ('${responseId}', '${projectId}', ${sql.escape(line)}, ${sql.escape(result.content)}, 'inserted', '{}')`;
                r = await sql.query(q);
            }
            console.log(i+1, lines[i], result.content);
        }

    })
    
    q = `UPDATE projects SET status = 'created' WHERE project_id = '${projectId}'`;
    r = await sql.query(q);
}