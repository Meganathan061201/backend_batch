require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./Config/db');

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello World!");
})


app.use('/api/auth', require('./Router/auth.router'));

app.use('/api/rbac', require('./Router/rbac.router'));

app.use('/api', require('./Router/user.router'));

db.connection.on('connected', () => console.log('MongoDB connected'));
app.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT));





    



