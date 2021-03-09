const Tour = require('../Model/tourModel')
const catchAsync = require('../utils/catchAsync')

exports.getOverview = catchAsync(async(req, res)=> {
    const tours = await Tour.find()
    console.log(tours)
    res.status(200).render('overview', {
        title: 'All tour',
        tours,
    })
})

exports.getTour =  catchAsync(async(req, res)=> {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        field: 'review rating user'
    })

    res.status(200).render('tour', {
        tour,
    })
})
