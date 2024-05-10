const sql = require('../utils/sql');

exports.updateProjectStatus = async (req, res) => {
    const { projectId, status } = req.body;
    if (!projectId) return res.status(400).json("bad command: missing projectId");
    if (!status) return res.status(400).json("bad command: missing status");

    const q = `UPDATE projects SET status = ${sql.escape(status)} WHERE project_id = ${sql.escape(projectId)}`;
    const r = await sql.query(q);

    return res.status(200).json(ok);
}