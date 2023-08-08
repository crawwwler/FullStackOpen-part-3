const mongoose = require('mongoose')

if(process.argv.length<3){
    console.log('password missing')
    process.exit(1)
}

const pass = process.argv[2]

const url = `mongodb+srv://shahinkopite:${pass}@fsopen.cg2fblb.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url, {
    connectTimeoutMS: 30000
})

const entrySchema = new mongoose.Schema({
    name: String,
    number: String
})

const Entry = mongoose.model("Person", entrySchema)

if(process.argv.length<5){
    console.log("phonebook:")
    Entry.find({}).then(persons=> {
        persons.forEach(person=> {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
        process.exit(1)
    })
    return
}

const person = new Entry({
    name: process.argv[3],
    number: process.argv[4]
})

person.save().then(result=> {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
})




