// models/log_event_model.js
const db = require('../db/db_mysql'); // Must be the promise version

exports.postLogEvent = async (employee_id, date_time, event_type, comment) => {
  const sql = `
    INSERT INTO log_events (employee_id, date_time, event_type, comment)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [employee_id, date_time, event_type, comment]);
  return result;
};
