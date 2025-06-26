export function calculateDailyHours(events) {
  if (!Array.isArray(events)) return [];

  const grouped = {};

  // Group by date
  for (const e of events) {
    const dateKey = new Date(e.date_time).toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(e);
  }

  const result = [];

  // For each day, calculate hours
  Object.entries(grouped).forEach(([date, logs]) => {
    const checkIns = logs.filter(e => e.event_type === 1);
    const checkOuts = logs.filter(e => e.event_type === 0);

    if (checkIns.length && checkOuts.length) {
      const earliestCheckIn = checkIns.reduce((a, b) =>
        new Date(a.date_time) < new Date(b.date_time) ? a : b
      );
      const latestCheckOut = checkOuts.reduce((a, b) =>
        new Date(a.date_time) > new Date(b.date_time) ? a : b
      );

      const start = new Date(earliestCheckIn.date_time);
      const end = new Date(latestCheckOut.date_time);
      const diffMs = end - start;

      if (diffMs > 0) {
        const hours = diffMs / (1000 * 60 * 60); // convert ms to hours
        result.push({
          date,
          hours: parseFloat(hours.toFixed(2))
        });
      }
    }
  });

  return result;}