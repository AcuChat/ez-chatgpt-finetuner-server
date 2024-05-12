const ai = require('../utils/ai');
const sql = require('../utils/sql');

exports.finetune = async (req, res) => {
    const { projectId, numEpochs, learningRate, batchSize } = req.body;
    if (!projectId) return res.status(400).json("Bad Command: missing projectId");
    if (typeof numEpochs === 'undefined') return res.status(400).json('Bad Command: missing numEpochs');
    if (typeof learningRate === 'undefined') return res.status(400).json('Bad Command: missing learningRate');
    if (typeof batchSize === 'undefined') return res.status(400).json('Bad Command: missing batchSize');
    
    let q = `SELECT openai_key, system_prompt, user_prompt FROM projects WHERE project_id = ${sql.escape(projectId)}`;
    let r = await sql.query(q);

    if (!r.length) return res.status(400).json('Bad Command: invalid projectId');

    const {openai_key, system_prompt, user_prompt} = r[0];

    console.log(openai_key, system_prompt, user_prompt);

    return res.status(200).json('ok');
}