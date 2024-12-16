const dotenv = require('dotenv')
const app = require('./app')
const connectDatabase = require('./db/database')
const { connect } = require('mongoose')

// Load env variables
dotenv.config({ path: 'config/config.env' })

connectDatabase()


const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to unhandled promise rejection`)
    server.close(() => {
        process.exit(1)
    })
})