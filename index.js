require('dotenv').config()
const express = require('express') // IMPORT EXPRESS
const app = express() // ASSIGN AN EXPRESS APP TO THE APP VARIABLE
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/mongo')

let sizeOfDB = 0

//THE FIRST RULE AND THE MOST IMPORTANT RULE WHEN YOU ENCOUNTER A PROBLEM: DONT WRITE MORE CODE



app.use(express.static('build'))
app.use(express.json())
app.use(cors())


morgan.token('data-sent', (request) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :response-time ms - :data-sent'))


const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if(error.name === 'CastError'){
        return response.status(400).json({error: "malformatted id"})
    }
    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "unknown endpoint"})
}




//ROUTES

app.get("/", (request, response) => {
    response.send('<h1>Hello you!</h1>')
})


// HANDLE THE DATA COLLECTION
app.get("/api/persons", (request, response)=> {
    Person.find({}).then(persons=> {
        sizeOfDB = persons.length
        response.json(persons)
    })
})



// HANDLE INFO PAGE 
app.get("/api/info", (request, response) => {
    const xhelper = `Phonebook has info for ${sizeOfDB} people`
    const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'long'
    }
    const currentTime = new Date().toLocaleString('en-US', options)
    //console.log(currentTime)
    response.send(`<h4>${xhelper}</h4>
                <br/><h4>${currentTime}</h4>`)
})



// HANDLE SINGLE PERSON
app.get("/api/persons/:id", (request, response, next)=> {
    Person.findById(request.params.id).then(person => {
        if(person){
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})


// ADDING A NEW PERSON
app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name || !body.number){
        return response.status(400).json({
            error: "name or number missing"
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        sizeOfDB += 1
        response.json(savedPerson)
    })
})

// UPDATING PERSON
app.put('/api/persons/:id', (request, response, next)=> {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})


// DELETING PERSON
app.delete('/api/persons/:id', (request, response)=>{
    Person.findByIdAndDelete(request.params.id).then(result=> {
        //console.log(result)
        sizeOfDB -= 1
        response.status(204).end()
    })
    .catch(error=> next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})