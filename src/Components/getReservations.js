const db = require("../../config/db");

const GetReservations = (req, res) => {
  const event_id = req.params.eventId;
  const mail = req.params.email;
  const getReservationsByQuery =
    "SELECT COALESCE(SUM(tickets.vipTickets + tickets.regularTickets), 0) AS totalReservations FROM tickets WHERE event = ? AND email = ?";
  db.query(getReservationsByQuery, [event_id, mail], (err, result) => {
    if (err) {
      // console.error("Error fetching reservations:", err);
      res.status(500).json({ error: "Error fetching reservations" });
    } else {
      const totalReservations =
        result.length > 0 ? result[0].totalReservations : 0;

      // console.log("Result: ", result);
      // console.log("totalReservations: ", totalReservations);
      // console.log("Query Parameters: ", [event_id, mail]);

      res.status(200).json({ totalReservations });
    }
  });
};

module.exports = GetReservations;
