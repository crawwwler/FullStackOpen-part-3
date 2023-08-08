require('dotenv').config()
const express = require('express') // IMPORT EXPRESS
const app = express() // ASSIGN AN EXPRESS APP TO THE APP VARIABLE
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/mongo')


app.use(express.json()) 
app.use(express.static('build'))
app.use(cors())

morgan.token('data-sent', (request) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :response-time ms - :data-sent'))



// data collection
let data = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// FUNCTION TO GENERATE ID's

const generateID = () => {
    const min = 10
    const max = 999
    return Math.floor(Math.random() * (max - min + 1) + min )
}


//ROUTES

app.get("/", (request, response) => {
    response.send('<h1>Hello you!</h1>')
})


app.get("/api/info", (request, response) => {
    const xhelper = `Phonebook has info for ${data.length} people`
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

/*app.get("/api/persons", (request, response) => {
    response.json(data)
})*/


app.get("/api/persons", (request, response)=> {
    Person.find({}).then(persons=> {
        response.json(persons)
    })
})


/*app.get("/api/persons/:id", (request, response)=> {
    //IMPORTANT => CONVERT STRING TO INTEGER WHILE WE RETRIEVE THE ID
    const id = Number(request.params.id)
    const pTor = data.find(person => person.id === id)
    if (pTor){ // IF THERE WAS NO MATCHING ID , pTor WOULD BE NULL.
        response.json(pTor)
    }else {
        response.status(404).end()
    }
})*/

app.get("/api/persons/:id", (request, response)=> {
    Person.findById(request.params.id).then(person=> {
        response.json(person)
    })
    .catch(error=> {
        response.status(404).json({error:" id not found"})
    })
})

app.post('/api/persons', (request, response)=> {
    const body = request.body
    if(!body.name || !body.number){
        return response.status(400).json({
            error: "name or number is missing"
        })
    }

    const dupName = data.find(person => person.name === body.name)
    if(dupName){
        return response.status(400).json({
            error: " name must be unique"
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateID()
    }

    data = data.concat(person)
    response.json(person)
})


app.delete('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id)
    data = data.filter(person => person.id !== id)

    response.status(204).end()

})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})