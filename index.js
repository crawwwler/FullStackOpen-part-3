require('dotenv').config()
const express = require('express')

const app = express() 
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/mongo')

let sizeOfDB = 0

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('data-sent', (request) => JSON.stringify(request.body))

app.use(morgan(':method :url :status :response-time ms - :data-sent'))

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformatted id' })
    } if (error.name === 'ValidationError') {
        return response.status(400).JSON({ error: error.message })
    }
    return next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// ROUTES

app.get('/', (request, response) => {
    response.send('<h1>Hello you!</h1>')
})

// HANDLE THE DATA COLLECTION
app.get('/api/persons', (request, response) => {
    Person.find({}).then((persons) => {
        sizeOfDB = persons.length
        response.json(persons)
    })
})

// HANDLE INFO PAGE
app.get('/api/info', (request, response) => {
    const xhelper = `Phonebook has info for ${sizeOfDB} people`
    const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'long',
    }
    const currentTime = new Date().toLocaleString('en-US', options)
    response.send(`<h4>${xhelper}</h4>
                <br/><h4>${currentTime}</h4>`)
})

// HANDLE SINGLE PERSON
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then((person) => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
        .catch((error) => next(error))
})

// ADDING A NEW PERSON
app.post('/api/persons', (request, response, next) => {
    const { body } = request
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then((savedPerson) => {
        sizeOfDB += 1
        return response.json(savedPerson)
    })
        .catch((error) => next(error))
})

// UPDATING PERSON
app.put('/api/persons/:id', (request, response, next) => {
    const { body } = request
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then((updatedPerson) => {
            response.json(updatedPerson)
        })
        .catch((error) => next(error))
})

// DELETING PERSON
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then((result) => {
        sizeOfDB -= 1
        response.status(204).end()
    })
        .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const { PORT } = process.env
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
