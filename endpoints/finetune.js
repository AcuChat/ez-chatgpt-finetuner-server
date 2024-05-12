const ai = require('../utils/ai');
const sql = require('../utils/sql');

exports.finetune = async (req, res) => {
    const { projectId, numEpochs, learningRate, batchSize } = req.body;
    if (!projectId) return res.status(400).json("Bad Command: missing projectId");
    if (typeof numEpochs === 'undefined') return res.status(400).json('Bad Command: missing numEpochs');
    if (typeof learningRate === 'undefined') return res.status(400).json('Bad Command: missing learningRate');
    if (typeof batchSize === 'undefined') return res.status(400).json('Bad Command: missing batchSize');
    
    let q = `SELECT openai_key, system_prompt, user_prompt, status FROM projects WHERE project_id = ${sql.escape(projectId)}`;
    let r = await sql.query(q);

    if (!r.length) return res.status(400).json('Bad Command: invalid projectId');
    if (r[0].status !== 'edited') return res.status(400).json(`Bad Command: project status is ${r[0].status}`)

    const {openai_key, system_prompt, user_prompt} = r[0];

    console.log(openai_key, system_prompt, user_prompt);

    q = `SELECT input, edited_output FROM responses WHERE project_id = ${sql.escape(projectId)}`;
    r = await sql.query(q);

    const inputArr = [];
    const desiredOutputArr = [];

    for (let i = 0; i < r.length; ++i) {
        if (!r[i].edited_output) continue;
        inputArr.push(r[i].input);
        desiredOutputArr.push(r[i].edited_output);
    }

    console.log('inputArr', inputArr);
    console.log('desiredOutput', desiredOutputArr);

    const job = await ai.createFineTuneJob(system_prompt, user_prompt, inputArr, desiredOutputArr, openai_key, 'gpt-3.5-turbo-1106', numEpochs, learningRate, batchSize);

    const info = {
        job
    }

    q = `UPDATE projects SET status='finetuning', info=${sql.escape(JSON.stringify(info))} WHERE project_id = ${sql.escape(projectId)}`;
    r = await sql.query(q);

    return res.status(200).json(job);
}