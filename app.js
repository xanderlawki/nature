const path = require('path')
const express = require('express')
const AppError = require('./utils/appError')
const globalError = require("./controllers/errorController")
const morgan = require('morgan')
const tourRouter = require('./router/tours')
const userRouter = require('./router/users')
const reviewRouter = require('./router/reviews')
const viewRouter = require('./router/views')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const app = express()
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
///secirity headers///
app.use(helmet())
/////body parser/////
app.use(express.json({limit: '10kb'}))
/////serving static files//////
app.use(express.static(`${__dirname}/public`))

////data sanitization against nosql injection///
app.use(mongoSanitize())

///data sanitization against xss///
app.use(xss())
 
//////////parameter pollination///////
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))
///////test middleware///////
    app.use((req, res, next)=> {
        req.requestTime = new Date().toISOString()
        next()
    })

    ////development logging//
    if(process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'))
    }
    /////limit rate api////
    const limiter = rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: 'too many request with this ip lease try again in hour'
    })

app.use('/api', limiter)

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.all('*', (req, res, next)=> {
    
    next(new AppError (`cant find ${req.originalUrl} on this server`, 404))
})

app.use(globalError)
module.exports = app