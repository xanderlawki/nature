const fs = require('fs')
const Tour = require("./../Model/tourModel")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')

exports.aliasTopFours = (req,res,next)=> {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}
    class APIFEATURES {
        constructor(query, queryString) {
            this.query = query;
            this.queryString = queryString
        }
        filter() {
             //filtering/////
        const queryObject = {...this.queryString}
        const exectudFiles = ['page', 'sort', 'limit', 'fields']
        exectudFiles.forEach(el => delete queryObject[el])

        /////advanced filtering////
        let queryStr = JSON.stringify(queryObject)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
           console.log(JSON.parse(queryStr))
           this.query = this.query.find(JSON.parse(queryStr))
            return this;
        }

        sort() {
            if(this.queryString.sort) {
                const sortby = this.queryString.sort.split(',').join(' ')
                this.query = this.query.sort(sortby)
            }
            else {
                this.query = this.query.sort('-createdAt')
            }
            return this;
        }
        limitfields() {
            if(this.queryString.fields) {
                const fields = this.queryString.fields.split(',').join(' ')
                this.query = this.query.select(fields)
        
            }
            else {
                this.query = this.query.select('-__v')
            }
            return this
        }
        pagination() {
            const page = this.queryString.page * 1 || 1;
            const limit = this.queryString.limit * 1 || 100;
            const skip = (page - 1) * limit
            this.query = this.query.skip(skip).limit(limit)
    
            
            return this
        }
        
    }
exports.getAllTours = catchAsync(async(req, res, next)=> {
   
        ////filtering/////
        // const queryObject = {...req.query}
        // const exectudFiles = ['page', 'sort', 'limit', 'fields']
        // exectudFiles.forEach(el => delete queryObject[el])

        /////advanced filtering////
    //     let queryStr = JSON.stringify(queryObject)
    //  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    //     console.log(JSON.parse(queryStr))

    //     let query =  Tour.find(JSON.parse(queryStr))

        /////sorting//////
        // if(req.query.sort) {
        //     const sortby = req.query.sort.split(',').join(' ')
        //     query = query.sort(sortby)
        // }
        // else {
        //     query = query.sort('-createdAt')
        // }

        ////fields///
        // if(req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ')
        //     query = query.select(fields)
    
        // }
        // else {
        //     query = query.select('-__v')
        // }

        /////pagination///////
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit
        // query = query.skip(skip).limit(limit)

        // if(req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error("This page does not exist");
        // }
        const features = new APIFEATURES(Tour.find(), req.query).filter().sort().limitfields().pagination()
        const tours = await features.query
       
        res.status(200).json({
            status: 'succes',
            result: tours.length,
            data: { 
                tours:tours,
            }       
        })
  
   
})
exports.getTour = factory.getOne(Tour, {path: 'reviews'})
    
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour);
exports.getMonthlyPlan = catchAsync(async(req, res, next)=> {
   
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                   $gte: new Date(`${year}-01-01`),
                   $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {
                    $month: '$startDates'
                },
                numTourStarts: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                }
                
            }
        },
       

            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0
                },

            },
            {
                $sort: {
                    numTourstarts: -1
                }
            },
            {
                $limit: 12
            }

            
        
        

        
    ])

    res.status(200).json({
        status: 'success',
        plan, 
    })
   
})

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  })

exports.getToursWithin = catchAsync(async(req, res, next)=> {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if(!lat || !lng) {
        next(new AppError('please provide latitude and longitude in the format lat, lng', 400))
    }

    const tours = await Tour.find({startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}})

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async(req, res, next)=> {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',')
    const multiplier = unit === 'mi' ? 0.000621371 : distance / 0.001;
    if(!lat || !lng) {
        next(new AppError('please provide latitude and longitude in the format lat, lng', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours
        }
    })
})