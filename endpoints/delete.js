const sql = require('../utils/sql');

exports.delete = async (req, res) => {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json('bad command: missing projectId');

    let q = `DELETE FROM responses WHERE project_id = ${sql.escape(projectId)}`;
    let r = await sql.query(q);

    q = `DELETE FROM projects WHERE project_id = ${sql.escape(projectId)}`;
    r = await sql.query(q);

    return res.status(200).json('ok');

}