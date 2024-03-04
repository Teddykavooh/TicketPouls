const db = require("../config/db");

// Function to update the booked column in the events table
const updateBookedColumn = () => {
  const updateBookedQuery = `
      UPDATE events
      SET booked = (
        SELECT COALESCE(SUM(tickets.vipTickets + tickets.regularTickets), 0)
        FROM tickets
        WHERE tickets.event = events.id
      )
    `;

  db.query(updateBookedQuery, (err, results) => {
    if (err) {
      console.error("Error updating booked column:", err);
    } else {
      console.log("Booked column updated successfully", results);
    }
  });
};

module.exports = updateBookedColumn;
