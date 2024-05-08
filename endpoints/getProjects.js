const sql = require('../utils/sql');

exports.getProjects = async (req, res) => {
    const { projectId } = req.body;
    const q = `SELECT project_id, project_name, system_prompt, user_prompt, model, status, info FROM projects`;
    const r = await sql.query(q);
    return res.status(200).json(r); 
}