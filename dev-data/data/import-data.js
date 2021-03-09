const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('../../Model/tourModel')
const Review = require('../../Model/reviewModel')
const User = require('../../Model/userModel')


mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFinfAndModify: false
})
.then(con => {
   
    console.log('DB connection successful')
})


    const lists = User.find()
    console.log(lists, 'users check')
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, `utf-8`))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, `utf-8`))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, `utf-8`))

const importData = async()=> {
    try {
        await Tour.create(tours)
        await User.create(users, { validateBeforeSave: false})
        await Review.create(reviews)
         console.log("shit was imported")
    }
    catch(error) {
        console.log(error)
    }
    
}

const deleteData = async()=> {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("shit was completely deleted")
    }

    catch(error) {
        console.log(error)
    }
}

console.log(process.argv)


if(process.argv[2] === '--import') {
    importData()
}
else if(process.argv[2] === '--delete') {
    deleteData()
}