const sql = require('../utils/sql');

const { v4: uuidv4 } = require('uuid');

exports.getNextAvailablePair = async (req, res) => {
    const { projectId } = req.body;

    const reservation = uuidv4();
    const seconds = new Date().getTime() / 1000;

    let q = `UPDATE responses SET editor_id = '${reservation}', ts=${seconds} WHERE project_id = ${sql.escape(projectId)} AND editor_id = '' LIMIT 1`;
    let r = await sql.query(q);

    q = `SELECT input, orig_output FROM responses WHERE project_id = ${sql.escape(projectId)} AND editor_id = '${reservation}'`;
    r = await sql.query(q);

    res.status(200).json(r);
}
