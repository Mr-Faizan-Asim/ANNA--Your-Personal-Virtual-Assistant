const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors")
const path = require('path')
const app = express();


app.use(cors()) 
app.use(express.json())


const userRoutes = require('./routes/userRoutes')
const waitlistRoutes = require('./routes/waitlistRoutes')

app.use('/api', userRoutes)
app.use('/api', waitlistRoutes)

module.exports = app;