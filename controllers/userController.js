const Users = require('../Model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowfields)=> {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        newObj[el] = obj[el]
    })
    return newObj
}
exports.getAllUsers = catchAsync(async(req, res)=> {
    const users = await Users.find()
    console.log(users)
    res.status(200).json({
        status: 'succes',
        result: users.length,
        data: {
            users:users,
        }       
    })
})
exports.getUser= factory.getOne(Users)
exports.updateMe = catchAsync(async(req, res, next)=>{
    ////create error if user posts password data////
    if(req.body.password || req.body.password_confirm) return next(new AppError('this route is not for password updates please use the updateMyPassword routes', 400))


    //update user document//
    const filteredbody = filterObj(req.body, 'name', 'email')
    const updateduser  = await Users.findByIdAndUpdate(req.user.id, filteredbody, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        status: 'success',
        user: updateduser
    })

})

exports.getMe = (req, res, next)=> {
    req.params.id = req.user.id
    next()
}
exports.deleteMe = async(req, res, next)=> {
    await Users.findByIdAndUpdate(req.user.id, {active: false})
    res.staus(204).json({
        status: 'success',
        data: null
    })
}
exports.createUser = (req, res)=> {
    res.status(500).json({
        status: "error",
        message: "not yet implemented"
    })
}
exports.updateUser = factory.updateOne(Users)
exports.deleteUser = factory.deleteOne(Users)
