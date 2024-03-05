const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const updateBookedColumn = require("./routes/updateBooked");
const GetReservations = require("./routes/getReservations");
const authRoutes = require("./routes/authRoutes");
const tokenRoutes = require("./routes/decodeToken");
const createTables = require("./config/createTables");
require("dotenv").config();
// console.log(process.env);

const app = express();
const PORT = process.env.PORT || `${process.env.PORT}`;
app.use(cors());
app.use(express.json());

// Set the view engine to EJS
app.set("view engine", "ejs");

// Specify the view directories
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/assets"));

// Home view route
app.get("/", (req, res) => {
  // console.log("Accessing home route");
  res.render("home");
});

// Event Routes
// Route to get all events
app.get("/api/get", (req, res) => {
  db.query("SELECT * FROM events", (err, result) => {
    if (err) {
      console.log("Error fetching events:", err);
    } else {
      console.log("Events fetched successfully");
      res
        .status(200)
        .json({ message: "Events fetched successfully", data: result });
    }
  });
});

// Route to get an event
app.get("/api/get/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM events WHERE id = ?", id, (err, result) => {
    if (err) {
      console.error("Error fetching the event: " + id, err);
      res.status(500).send("Error fetching event");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Event not found");
    } else {
      console.log("Event fetched successfully");
      res
        .status(200)
        .json({ message: "Event fetched successfully", data: result });
    }
  });
});

// Route to create an event
app.post("/api/create", (req, res) => {
  const event_name = req.body.name;
  const event_desc = req.body.description;
  const ticket_vip_price = req.body.VIPTPrice;
  const ticket_reg_price = req.body.RegTPrice;
  const event_attendees = req.body.attendees;
  const booked_attendees = req.body.booked;

  db.query(
    "INSERT INTO events (name, description, VIPTPrice, RegTPrice, attendees, booked) VALUES (?,?,?,?,?,?)",
    [
      event_name,
      event_desc,
      ticket_vip_price,
      ticket_reg_price,
      event_attendees,
      booked_attendees,
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating event:", err);
        res.status(500).send("Error creating event");
      } else {
        console.log("Event created successfully");
        res.status(201).json({
          message: "Event created successfully",
          eventId: result.insertId,
        });
      }
    },
  );
});

// Route to update an event
app.put("/api/update/:id", (req, res) => {
  const event_id = req.params.id;
  const event_name = req.body.name;
  const event_desc = req.body.description;
  const ticket_vip_price = req.body.VIPTPrice;
  const ticket_reg_price = req.body.RegTPrice;
  const event_attendees = req.body.attendees;
  const booked_attendees = req.body.booked;
  db.query(
    "UPDATE events SET name=?, description=?, VIPTPrice=?, RegTPrice=?, attendees=?, booked=? WHERE id=?",
    [
      event_name,
      event_desc,
      ticket_vip_price,
      ticket_reg_price,
      event_attendees,
      booked_attendees,
      event_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating event:", err);
        res.status(500).send("Error updating event");
      } else if (result.affectedRows === 0) {
        res.status(404).send("Event not found");
      } else {
        console.log("Event updated successfully");
        res.status(200).json({ message: "Event updated successfully" });
      }
    },
  );
});

// Route to delete an event
app.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM events WHERE id= ?", id, (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      res.status(500).send("Error deleting event");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Event not found");
    } else {
      console.log("Event deleted successfully");
      res.status(200).json({ message: "Event deleted successfully" });
    }
  });
});

// Ticket Routes (Using new methodology)
// Route to create a ticket
app.post("/api/reserveTicket", async (req, res) => {
  try {
    const eventId = req.body.eventId;
    const eventName = req.body.eventName;
    const ticketType = req.body.ticketType;
    const vipTickets = req.body.vipTickets;
    const regularTickets = req.body.regularTickets;
    const amount = req.body.amount;
    const email = req.body.email;

    const createTicketQuery = `
      INSERT INTO tickets (event, eventName, ticketType, vipTickets, regularTickets, amount, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(createTicketQuery, [
      eventId,
      eventName,
      ticketType,
      vipTickets,
      regularTickets,
      amount,
      email,
    ]);

    // return the inserted row
    // const newTicket = result[0];

    console.log("Ticket created successfully");
    res.status(201).json({
      message: "Ticket created successfully",
      // ticketId: newTicket.insertId,
    });

    // Init column update
    updateBookedColumn();
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Error creating ticket" });
  }
});

// Route to get all tickets
app.get("/api/tickets", async (req, res) => {
  try {
    const getAllTicketsQuery = "SELECT * FROM tickets";
    const tickets = await db.query(getAllTicketsQuery);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Error fetching tickets" });
  }
});

// Route to get a specific ticket by ID
app.get("/api/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    const getTicketByIdQuery = "SELECT * FROM tickets WHERE id = ?";
    const ticket = await db.query(getTicketByIdQuery, [ticketId]);

    if (ticket.length === 0) {
      res.status(404).json({ message: "Ticket not found" });
    } else {
      res.status(200).json(ticket[0]);
    }
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Error fetching ticket" });
  }
});

// Route to update a specific ticket by ID
app.put("/api/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { eventName, ticketType, vipTickets, regularTickets, amount, email } =
      req.body;
    const updateTicketQuery = `
      UPDATE tickets
      SET eventName = ?, ticketType = ?, vipTickets = ?, regularTickets = ?, amount = ?, email = ?
      WHERE id = ?
    `;
    await db.query(updateTicketQuery, [
      eventName,
      ticketType,
      vipTickets,
      regularTickets,
      amount,
      email,
      ticketId,
    ]);
    res.status(200).json({ message: "Ticket updated successfully" });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Error updating ticket" });
  }
});

// Route to delete a specific ticket by ID
app.delete("/api/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    const deleteTicketQuery = "DELETE FROM tickets WHERE id = ?";
    await db.query(deleteTicketQuery, [ticketId]);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Error deleting ticket" });
  }
});

app.get("/api/getReservations/:eventId/:email", GetReservations);

// Authentication routes
app.use("/api/auth", authRoutes);

// Token Decode route
app.use("/api/decodeToken", tokenRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
