const e = require('express')
const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000
app.use(express.json())
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'))

app.get('/api/v1/tours', (req, res)=> {
    res.status(200).json({
        status: 'succes',
        result: tours.length,
        data: {
            tours:tours,
        }
    })
})

app.post('/api/v1/tours', (req,res)=> {
    console.log(req.body)

    const NewId = tours[tours.length - 1].id + 1;
    const newTours = Object.assign({id: NewId}, req.body)
    tours.push(newTours)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err)=> {
        res.status(200).json({
            status: 'succes',
            result: tours.length,
            data: {
                tours:newTours,
            }
        })
    })
    
})
app.listen(port, ()=> {
    console.log(`app running on port ${port}`)
})