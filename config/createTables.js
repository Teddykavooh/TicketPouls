const db = require("./db");
const bcrypt = require("bcrypt");

const createTables = () => {
  // Create the "events" table
  const createEventsTableQuery = `
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  VIPTPrice DECIMAL(10, 2) NOT NULL,
  RegTPrice DECIMAL(10, 2) NOT NULL,
  attendees INT NOT NULL,
  booked INT NOT NULL
)
`;
  db.query(createEventsTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating events table:", err);
    } else {
      console.log("Events table created successfully");
    }
  });

  // Create the "tickets" table
  const createTicketsTableQuery = `
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event INT,
  eventName VARCHAR(255),
  ticketType ENUM('VIP', 'Regular', 'Both') NOT NULL,
  vipTickets INT NOT NULL,
  regularTickets INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  email VARCHAR(255) NOT NULL,
  FOREIGN KEY (event) REFERENCES events(id)
)
`;

  db.query(createTicketsTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating tickets table:", err);
    } else {
      console.log("Tickets table created successfully");
    }
  });

  // Create the "users" table
  const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  admin_role BOOLEAN NOT NULL
)
`;
  db.query(createUsersTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating users table:", err);
    } else {
      console.log("Users table created successfully");
    }
  });

  // Create Admin
  const email = "ticketadmin@pouls.com";
  const rawPassword = "TicketAdmin@1234";
  const role = true;

  // Hash the password before inserting it into the database
  bcrypt.hash(rawPassword, 10, (hashError, hashedPassword) => {
    if (hashError) {
      console.error("Error hashing password:", hashError);
    } else {
      // Insert the user into the users table
      const insertUserQuery = `
    INSERT IGNORE INTO users (email, password, admin_role)
    VALUES ('${email}', '${hashedPassword}', ${role})
  `;

      try {
        db.query(insertUserQuery);
        console.log("User inserted successfully");
      } catch (insertError) {
        console.error("Error inserting user:", insertError);
      }
    }
  });
};

module.exports = createTables;
