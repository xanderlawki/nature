 const AppError = require('../utils/appError')
console.log(process.env.NODE_ENV)
 const handleCastErrorDB = err => {
     const message = `invalid ${err.path}: ${err.value}`
     return new AppError(message, 404)
 }

 const handleDuplicateDB = err => {
     const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
     const message = `Duplicate field value: ${value} please use another value`
     return new AppError(message, 404)
}

const handleValidationDB = err => {
    const errors = Object.values(err.error).map(el => el.message)
    const message = `invalid input data ${errors.join('. ')}`
    return new AppError(message, 404)
}

const handleJWTerror = err => new AppError("invalid web token, please log in again", 401)
   
   const sendErrorDev = (err, res)=> {
        
            res.status(err.statusCode).json({
                status: err.stat,
                message: err.message,
                err: err,
                err: err.stack
            })
        }
      
  

    const sendErrorProd = (err, res)=> {
        if(err.operational) {
            res.status(err.statusCode).json({
                status: err.statusCode,
                message: err.message,
                err: err,
                err: err.stack
            })
        }
        else {
            res.status(500).json({
                status: 'error',
                message: 'something went very wrong'
            })
        }

    }

module.exports = (err, req, res, next)=> {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
   
    
if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
}
if(process.env.NODE_ENV === 'production') {
    let error = {...err} 
    if(error.name === 'CastError') error = handleCastErrorDB(error)
    if(error.code === 11000) error = handleDuplicateDB(error)
    if(error.name === 'ValidationError') error = handleValidationDB(error)
    if(error.name === 'JsonWebTokenError') error = handleJWTerror(error)
    if(error.name === 'TokenExpiredError') return new AppError('your token has expired, please log in again')
    sendErrorProd(error, res)
}

}
