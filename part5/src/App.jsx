import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Container, AppBar, Toolbar, Button, Typography, Table, TableBody, TableContainer, Paper, TextField, Box } from '@mui/material'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogDetails from './components/BlogDetails'

const Notification = ({ message, type }) => {
  if (message === null) return null
  const style = { color: type === 'error' ? 'red' : 'green', background: 'lightgrey', fontSize: 20, borderStyle: 'solid', borderRadius: 5, padding: 10, marginBottom: 10 }
  return <div style={style}>{message}</div>
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null, type: null })

  useEffect(() => {
    blogService.getAll().then(initialBlogs => setBlogs(initialBlogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => { setNotification({ message: null, type: null }) }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification(`Welcome ${user.name}`)
    } catch {
      showNotification('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      returnedBlog.user = { id: user.id, username: user.username, name: user.name }
      setBlogs(blogs.concat(returnedBlog))
      showNotification(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`)
    } catch {
      showNotification('Failed to create blog', 'error')
    }
  }

  const updateBlog = async (id, blogObject) => {
    try {
      const returnedBlog = await blogService.update(id, blogObject)
      // Actualizamos la lista local mapeando el id
      setBlogs(blogs.map(blog => blog.id !== id ? blog : { ...blog, likes: returnedBlog.likes }))
    } catch {
      showNotification('Failed to update likes', 'error')
    }
  }

  const deleteBlog = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter(blog => blog.id !== id))
      showNotification('Blog removed successfully')
    } catch {
      showNotification('Failed to remove blog', 'error')
    }
  }

 const loginForm = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Log in to application
      </Typography>
      <form onSubmit={handleLogin}>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </Box>
        <Button variant="contained" color="primary" type="submit">
          login
        </Button>
      </form>
    </Box>
  )

  // Ordenar blogs por likes
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

 return (
  <Router>
    <Container>
      {user && (
        <AppBar position="static" style={{ marginBottom: 20 }}>
          <Toolbar>
            <Button color="inherit" component={Link} to="/">
              blogs
            </Button>
            <Button color="inherit" component={Link} to="/create">
              create new
            </Button>
            
            <Typography variant="body1" sx={{ flexGrow: 1, textAlign: 'right', paddingRight: 2 }}>
              {user.name} logged in
            </Typography>
            
            <Button color="inherit" onClick={handleLogout}>
              logout
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
          blog app
        </Typography>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate replace to="/" /> : loginForm()
        } />
        
        <Route path="/blogs/:id" element={
          <BlogDetails blogs={blogs} updateBlog={updateBlog} deleteBlog={deleteBlog} currentUser={user} />
        } />

        <Route path="/create" element={
          user ? <BlogForm createBlog={addBlog} /> : <Navigate replace to="/login" />
        } />

        <Route path="/" element={
          user === null ? <Navigate replace to="/login" /> : (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {sortedBlogs.map(blog =>
                    <Blog 
                      key={blog.id} 
                      blog={blog} 
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )
        } />
      </Routes>
    </Container>
    </Router>
  )
}

export default App