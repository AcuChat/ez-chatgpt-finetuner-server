const sql = require('../utils/sql');
const ai = require('../utils/ai');

/**
 * TODO: Add checkpoints information: https://platform.openai.com/docs/api-reference/fine-tuning/list-checkpoints
 * 
 */

exports.status = async (req, res) => {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json('bad command: missing projectId');

    const q = `SELECT project_name, system_prompt, user_prompt, status, info, openai_key FROM projects WHERE project_id=${sql.escape(projectId)}`;
    const r = await sql.query(q);

    if (!r.length) return res.status(400).json('bad command: no such project');

    let { project_name, status, info, openai_key, system_prompt, user_prompt } = r[0];
    info = JSON.parse(info);

    console.log(info);
    const { job } = info;
    console.log('job', job);
    const jobInfo = await ai.getFineTuneJob(job.id, openai_key);
    jobInfo.systemPrompt = system_prompt;
    jobInfo.userPrompt = user_prompt;
    return res.status(200).json(jobInfo);
}