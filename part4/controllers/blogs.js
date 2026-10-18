const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user') // <-- Importamos el modelo de Usuario

// Obtener blogs con la info del usuario
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// Crear un nuevo blog asignado a un usuario
blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  // Por ahora, simulamos que el usuario envía su ID en la petición
  const user = await User.findById(body.userId)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id // Asignamos el blog al usuario
  })

  const savedBlog = await blog.save()

  // Guardamos también el ID del blog en el array del usuario
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { returnDocument: 'after' })
  response.json(updatedBlog)
})

module.exports = blogsRouter