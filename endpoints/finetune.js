const ai = require('../utils/ai');
const sql = require('../utils/sql');

exports.finetune = async (req, res) => {
    const { projectId, numEpochs, learningRate, batchSize } = req.body;
    if (!projectId) return res.status(400).json("Bad Command: missing projectId");
    if (typeof numEpochs === 'undefined') return res.status(400).json('Bad Command: missing numEpochs');
    if (typeof learningRate === 'undefined') return res.status(400).json('Bad Command: missing learningRate');
    if (typeof batchSize === 'undefined') return res.status(400).json('Bad Command: missing batchSize');
    
    let q = `SELECT openai_key FROM projects WHERE project_id = ${sql.escape(projectId)}`;
    let r = await sql.query(q);

    if (!r.length) return res.status(400).json('Bad Command: invalid projectId');

    const openAiKey = r[0].openai_key;

    console.log(openAiKey);

    return res.status(200).json('ok');
}