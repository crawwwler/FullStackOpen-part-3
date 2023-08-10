const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log(`connecting to ${url}`)

mongoose.connect(url)
    .then(result=> {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log(`connection to MongoDB has stopped due to ${error.message}`)
    })



const entrySchema = new mongoose.Schema({
    name:{
        type: String,
        minLength: [3, 'name is too short'],
        required: [true, 'name is required']
    },
    number: {
        type: String,
        minLength: [8, 'length of number is atleast 8'], 
        validate: {
            validator: (value)=> {
                const pattern = /^(?:\d{2}-\d{6,}|\d{3}-\d{5,})$/
                return pattern.test(value)
            }
        },
        required: [true, 'number is required']
    }
})




entrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', entrySchema)