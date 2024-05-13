const sql = require('./sql');
const fs = require('fs');

exports.createPrompts = async () => {
    const projectId = 'b3a3ac5b-8b67-4ca1-9ce6-8772dfd881fd';
    const q = `SELECT edited_output FROM responses WHERE project_id = '${projectId}'`;
    const r = await sql.query(q);
    
    const prompts = [];
    r.forEach(p => {
        const prompt = JSON.parse(p.edited_output);
        fs.appendFileSync('prompts.jsonl', JSON.stringify(prompt[0]) + "\n", 'utf8')
        console.log(prompt[0]);
    })

}

