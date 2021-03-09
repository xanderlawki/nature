const express = require('express')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})


process.on('uncaughtException', err => {
    console.log(err.name, err.message, err)
    console.log('UNCAUGHT EXCEPTION APP SHUTTING DOWN')
    
    
})

const app = require('./app')
const port = 3000
const mongoose = require('mongoose')

const server = app.listen(port, ()=> {
    console.log(`app running on port ${port}`)
})

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFinfAndModify: false
})
.then(con => {
   
    console.log('DB connection successful')
})

process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION APP SHUTTING DOWN')
    server.close(()=> {
     process.exit(1)
    })
    
})


