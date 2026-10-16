const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(cors())
// Middleware para parsear el body de las peticiones a JSON
app.use(express.json())
app.use(express.static('dist'))

// Configuración de Morgan (Ejercicios 3.7 y 3.8)
// Creamos un token personalizado llamado "body" que devuelve el JSON enviado en las peticiones POST
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

// Usamos morgan con un formato personalizado que incluye el nuevo token al final
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
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

// Ruta principal
app.get('/', (request, response) => {
  response.send('<h1>Phonebook Backend</h1>')
})

// 3.1: Devolver toda la agenda
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// 3.2: Información general de la agenda
app.get('/info', (request, response) => {
  const count = persons.length
  const date = new Date()
  response.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `)
})

// 3.3: Obtener un solo contacto
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// 3.4: Borrar un contacto
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

// 3.5 y 3.6: Añadir un contacto con validaciones
app.post('/api/persons', (request, response) => {
  const body = request.body

  // Validación: faltan datos
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number is missing' 
    })
  }

  // Validación: nombre duplicado
  const nameExists = persons.some(p => p.name === body.name)
  if (nameExists) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  // Generar ID aleatorio
  const person = {
    id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

// Middleware de rutas desconocidas
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})