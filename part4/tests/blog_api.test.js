const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

let token = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()

  // Iniciamos sesión para obtener el token
  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  
  token = response.body.token // Guardamos el token

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog({ ...blog, user: user.id })
    await blogObject.save()
  }
})

test('blogs are returned as json', async () => {
  await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
})

test('the unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')
  const firstBlog = response.body[0]
  assert(firstBlog.id)
  assert(!firstBlog._id)
})

test('a valid blog can be added with token', async () => {
  const newBlog = {
    title: 'Test saving new blog',
    author: 'Test Author',
    url: 'https://testurl.com',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Pasamos el token aquí
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  const titles = blogsAtEnd.map(b => b.title)
  assert(titles.includes('Test saving new blog'))
})

test('fails with status code 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Blog without token',
    author: 'Test Author',
    url: 'https://testurl.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog) // Petición SIN token
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length) // No se ha añadido
})

test('a blog can be deleted by its creator', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`) // Pasamos el token aquí
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const updatedBlogData = { ...blogToUpdate, likes: blogToUpdate.likes + 10 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlogData)
    .expect(200)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
})

after(async () => {
  await mongoose.connection.close()
})