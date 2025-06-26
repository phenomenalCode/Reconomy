// controllers/log_event_controller.js
const logEventDb = require('../models/log_event_model');

exports.postLogEvent = async (req, res) => {
  const { employee_id, date_time, event_type, comment } = req.body;

  console.log("@logEventController.postLogEvent received:", req.body);

  if (!employee_id || !date_time || typeof event_type === 'undefined') {
    return res.status(400).json({ error: "Missing required fields: employee_id, date_time, or event_type." });
  }

  try {
    const result = await logEventDb.postLogEvent(employee_id, date_time, event_type, comment || "");
    console.log("@logEventController.postLogEvent success:", result);
    res.status(201).json(result);
  } catch (err) {
    console.error("@logEventController.postLogEvent error:", err);
    res.status(500).json({ error: "Failed to log event." });
  }
};
