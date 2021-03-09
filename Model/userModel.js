const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name: {
        type:"String",
        required: [true, 'please tell us your number'],
        
    },
    email: {
        type: "String",
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']

    },
   
    photos:String,
    role : {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
   password: {
    type: "String" || "Number",
    required: [true, 'please provide a password'],
    minlength: 8,
    select:false
   },
   password_confirmed: {
    type: "String" || "Number",
    required: [true, 'please confirm your password'],
    validate: {
        validator: function(el) {
            return el === this.password
        },
        message: 'passwords are not the same'
    }
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   PasswordResetExpires: Date,
   active: {
       type: Boolean,
       default: true,
       select: false
   }
})

// userSchema.pre('save', async function(next) {
//     ////////////run the function is password isnt modified///////
//     if(!this.isModified('password')) return next();
//     ////hash the password to make it secured///////
//     this.password = await bcrypt.hash(this.password, 12)
//     ///delete the password confirmed field//////////
//     this.password_confirmed = undefined
//     next()
// })

// userSchema.pre('save', function(next){
//     if(!this.isModified('password') || this.isNew) return next()
//     this.passwordChangedAt = Date.now() - 1000

//     next()
// })

userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}})
    next()
})

userSchema.methods.correctPassword = async function(currentPassword, userPassword) {

    return await bcrypt.compare(currentPassword, userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
    
    const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(this.passwordChangedAt, JWTTimestamp)
    return JWTTimestamp < changeTimeStamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
   this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;

   console.log({resetToken}, this.passwordResetToken)
   
   return resetToken                   
 

   
} 
const User =  mongoose.model('User', userSchema)


module.exports = User