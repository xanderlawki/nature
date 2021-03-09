const Users = require('../Model/userModel')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')
const crypto = require('crypto')
const {promisify} = require('util')

const signToken = id => {
    return jwt.sign({id,}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    }) 
}

const createSendToken = (user, statusCode, res)=> {
    const token = signToken(user._id)
    const cookieOptios =  {
        expires: new Date(new Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true

    }
    if(process.env.NODE_ENV === 'production') cookieOptios.secure = false
    res.cookie('jwt', token, cookieOptios)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user, 
        }
    
})
}

exports.signUp = catchAsync(async (req, res, next)=>{
    const newUser = await Users.create({
        
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password_confirmed:  req.body.password_confirmed
    })
   createSendToken(newUser, 200, res)
})

exports.login = catchAsync(async(req, res, next)=> {
    const {email, password} = req.body

    //////check if there is no password///////////
    if(!email || !password) return next(new AppError("please input your username or password", 404))

    //////////check if email and password is correct/////
    const users = await Users.findOne({email,}).select('+password')
    
    if(!users || !(await users.correctPassword(password, users.password)) ) {
        return next(new AppError("incorrect username or password", 401))
    }
////////send the token to the client
createSendToken(users, 200, res)


})

exports.protect = catchAsync(async(req, res, next)=> {
    ///////////getting token and check if its true//////////
let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token) return next(new AppError('you are not logged in, please log in to have access to your account', 401))
    ////////////verification token//////
    console.log(token)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded.id)

    //////////check if user still exists////////
    const freshUser = await Users.findById({_id: decoded.id})
    console.log(freshUser)
    if(!freshUser) return new AppError("the user belonging to this token does not exist", 401)

    ////check if user changed password after token was issued

    if(freshUser.changePasswordAfter(decoded.iat)) {
        return new AppError("user recently changed password, please try again", 401)
    }

    
    //////grant access to protected route 
    req.user = freshUser
    next()
})

exports.restrictTo = (...roles)=> {
    return (req, res, next)=> {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('you do not have permission to do this', 403))
        }
        next()
    }

    
}

exports.ForgotPassword = catchAsync(async(req, res, next)=> {
    const user = await Users.findOne({email: req.body.email})
    if(!user) return next(new AppError('there is no user with this email address', 404))

        ////////generate token/////////
        const resetToken = user.createPasswordResetToken()
        await user.save({validateBeforeSave: false})
        ////send the token via email/////////
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
        const message = `Forgot your password? submit a patch request with your new password to ${resetUrl} if you didnt forgot your password please ignore this email`;
        try {
            await sendEmail({
                email: user.email,
                subject: `your password reset toke valid for 10min`,
                message,
    
            })
    
            res.status(200).json({
                status: 'success',
                message: `token set to email`
            })
        }
        catch(error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({validateBeforeSave: false})
            console.log(error)
            return next(new AppError("there was an error sending the email", 500))
        }
        
    next()
})

exports.resetPassword = catchAsync(async(req, res, next)=> {
////////get user based on token//////////
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
console.log(hashedToken)

    const user = await Users.findOne({
        passwordResetToken:hashedToken},
        {PasswordResetExpires:{$gt: Date.now()}
        })
        // console.log(user)



////if token has not expired and there is user set the new password////
if(!user) return next(new AppError('token is invalid or expired', 400))

user.password = req.body.password;
user.password_confirmed = req.body.password_confirmed;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined

await user.save()
///////update the changed password and property for the current user 

//////log the user in send jwt to the client
createSendToken(user, 200, res)

})

exports.updatePassword = catchAsync(async(req, res, next)=> {
    
    /////get the user from the collection///
    const user = await Users.findById(user._id).select('+password')
    console.log(user)
    ///check if posted correct password is correct////
    if(!(await user.correctPassword(req.body.currentpassword, user.password)) ) {
        return next(new AppError("incorrect  password", 401))
    }
    //////update the password///////
    user.password = req.body.newpassword;
    user.password_confirmed = req.body.password_confirmed;
    await user.save();
    //log the user in send jwt//
    createSendToken(user, 201, res)
     
})