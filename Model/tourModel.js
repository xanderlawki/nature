const mongoose = require('mongoose')
const slugify = require("slugify")
const validator = require('validator')
const User = require('./userModel')
const tourSchema = new mongoose.Schema({
    name: {
        type:"String",
        required: true,
        
    },
    duration: {
        type: "Number",
        requred:[true, 'Atour must have a duration'],
        maxlength:[50, 'A tour must have less than or equals 50'],
        minlength:[10, 'A tour must have more or equals 10']


    },
    maxGroupSize: {
        type: "Number",
        required:[true, 'A tour must have a group size']
    
    },
    difficulty: {
        type: "String",
        required:[true, 'A tour must have a difficulty'],
        enum: {
            values:['easy', 'difficult', 'medium'],
            message: 'should be the three fuck it'
        }
    },

    ratingsAverage: {
        type:"Number",
        default: 4.5,
        min: [1, 'rating should not be less than 1'],
        max:[5, 'rating should be below 5 or equals 5'],
        set: val => Math.round(val * 10) / 10
    },
    slug: String,
    ratingsQuantity: {
        type: "Number",
        default: 0
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    price: {
        type: "Number",
        required: [true, 'A tour must have a price'],
       
    },
    priceDiscount: {
        type:"Number",
        validate: {
            validator: function(val) {
                return val < this.price
            },
            message: "dicount of ({VALUE}) should be less than price"
        }
    },
    summary: {
        type: "String",
        trim: true
        
    },
    description: {
        type:"String",
        required: [true, 'A tour must have a description'],
        trim: true,

    },
    imageCover: {
        type: "String",
        required: [true, 'A tour must have an image']
    },
    images:[String],
    createdAT: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    location: [
    {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }

],

    guides: [
        {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }   
    ]

    
}, {
    toJSON:{
        virtuals: true
    },
    toObject:{
        virtuals: true
    }
})
tourSchema.index({startLocation: '2dsphere', })
tourSchema.virtual('durantionWeeks').get(function() {
    return this.duration / 7
})

tourSchema.virtual('reviews', {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: 'true'})
    next()
})

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select:'-__v -passwordChangedAt'
    })
    next()
})
tourSchema.pre('save', async function(next) {
    const guidesPromise = this.guides.map(async id => await User.findById(id))
    this.guides = await Promise.all(guidesPromise)
    next()
})

tourSchema.pre(/^find/, function(next) {
    this.find({secretTour: {$ne: true}})
    next()
})
//////////AGGREGRATION MIDDLEWARE//////////
// tourSchema.pre('aggregate', function(next) {
//     this.pipleline().unshift({$match: {secretTour:{$ne: true} }} )
//     next()
// })




// tourSchema.post('save', function(doc, next) {
//     console.log(doc)
//     next()
// })
/////QUERY MIDDLEWARE//////


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour