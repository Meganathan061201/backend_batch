require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const db = require("./Config/db");

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Static Folder (Uploaded Files)
app.use("/uploads", express.static(path.join(__dirname, "storage/uploads")));

// Routes
app.use("/api/auth", require("./Router/auth.router"));

app.use("/api/rbac", require("./Router/rbac.router"));

app.use("/api/file", require("./Router/file.router"));

app.use("/api", require("./Router/user.router"));

// MongoDB
db.connection.on("connected", () => {
    console.log("MongoDB Connected");
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});