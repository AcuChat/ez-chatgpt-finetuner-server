const sql = require('../utils/sql');

exports.submission = async (req, res) => {
    const { output, responseId } = req.body;

    const q = `UPDATE responses SET edited_output = ${sql.escape(output)}, ts=${sql.tsDefault}, status='edited' WHERE response_id = ${sql.escape(responseId)}`;
    const r = await sql.query(q);

    return res.status(200).json("ok");
}