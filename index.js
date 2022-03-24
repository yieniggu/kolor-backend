const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./db/config");
require("dotenv").config();

// Create express server
const app = express();

dbConnection();

//CORS
app.use(cors());

// Body parsing
app.use(express.json());

// Public route
app.use(express.static("public"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/lands", require("./routes/lands"));

// Listen requests
app.listen(process.env.PORT, () => {
  console.log("[SV] Server running on port", process.env.PORT);
});
