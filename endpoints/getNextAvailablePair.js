const sql = require('../utils/sql');

const { v4: uuidv4 } = require('uuid');

exports.getNextAvailablePair = async (req, res) => {
    const { projectId } = req.body;

    const reservation = uuidv4();
    const seconds = new Date().getTime() / 1000;
    console.log('seconds', Math.floor(seconds));

    let q = `UPDATE responses SET editor_id = '${reservation}', ts=${seconds} WHERE project_id = ${sql.escape(projectId)} AND editor_id = '' LIMIT 1`;
    let r = await sql.query(q);

    q = `SELECT response_id, project_id, input, orig_output FROM responses WHERE project_id = ${sql.escape(projectId)} AND editor_id = '${reservation}'`;
    r = await sql.query(q);

    console.log(r);
    if (r.length) return res.status(200).json(r[0]);
    return res.status(200).json({});
}
