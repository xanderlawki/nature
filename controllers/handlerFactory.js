const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Tour = require('../Model/tourModel')
exports.deleteOne = Model =>  catchAsync(async(req, res, next)=> {
    
    const doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc) return next(new AppError (`no tour found with that id`, 404))

        res.status(200).json({
            status: 'succes',
            data: 'DELETED'
        })

})

exports.createOne = Model => catchAsync(async(req,res)=> {
   
    const doc = await Model.create(req.body)
    console.log(req.body)
    res.status(200).json({
        status: 'succes',
        data: {
            data: doc,
        }
    })
})

exports.updateOne = Model =>  catchAsync(async(req, res)=> {
    const doc = await Model.findByIdAndUpdate(req.params, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
           data: doc
        }
    })
})

exports.getOne = (Model, popOptions)=> catchAsync(async(req, res, next)=> {
    let query =  Model.findById(req.params.id)
    if(popOptions) query = query.populate(popOptions)
    const doc = await query
   
    if(!doc) {
        return(new AppError('no document found with that ID', 404))
    }
    res.status(200).json({
        status: 'succes',
        data: {
            doc
        }       
    })
})