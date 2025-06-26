const express = require('express');
const db = require('../db/db_mysql.js');
const router = express.Router();
const logEventController = require('../controllers/log_event_controller');

// Only allow explicit check-in and check-out routes
router.post('/in', logEventController.postLogEvent);
router.post('/out', logEventController.postLogEvent);

// Get all log events for an employee
// GET /api/log_events/:employee_id
router.put('/:employee_id', async (req, res) => {
  const routeEmployeeId = parseInt(req.params.employee_id, 10);
  const { events } = req.body;

  if (!Array.isArray(events)) {
    return res.status(400).json({ message: "Invalid events array." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const event of events) {
      const { id, employee_id, event_type, date_time, comment } = event;

      // Basic validation
      if (!id || typeof id !== 'number' || typeof event_type !== 'number' || !date_time) {
        throw new Error(`Invalid event data: ${JSON.stringify(event)}`);
      }

      // Optional: Warn if incoming employee_id mismatches the route
      if (parseInt(employee_id, 10) !== routeEmployeeId) {
        console.warn(`Mismatch: Event ${id} has employee_id ${employee_id}, expected ${routeEmployeeId}`);
      }

      await connection.query(
        `UPDATE log_events
         SET event_type = ?, date_time = ?, comment = ?
         WHERE id = ? AND employee_id = ?`,
        [event_type, date_time, comment || '', id, employee_id]
      );
    }

    await connection.commit();
    res.status(200).json({ message: "Log events updated successfully." });
  } catch (err) {
    await connection.rollback();
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update log events." });
  } finally {
    connection.release();
  }
});



router.get('/:employee_id', async (req, res) => {
  const { employee_id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT id, employee_id, date_time, event_type, comment FROM log_events WHERE employee_id = ? ORDER BY date_time DESC",
      [employee_id]
    );

    if (!results.length) {
      return res.status(404).json({ message: "No log events found." });
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching log events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Export after routes are defined
module.exports = router;
