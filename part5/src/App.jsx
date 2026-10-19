import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
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
    <div>
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>username <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} /></div>
        <div>password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} /></div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  // Ordenar blogs por likes
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

 return (
    <Router>
      <div>
        <Notification message={notification.message} type={notification.type} />
        
        {/* Barra de navegación constante */}
        <div style={{ background: 'lightgray', padding: '10px', marginBottom: '20px' }}>
          <Link style={{ padding: 5 }} to="/">blogs</Link>
          <Link style={{ padding: 5 }} to="/create">create new</Link>
          {user ? (
            <span>
              {user.name} logged in <button onClick={handleLogout}>logout</button>
            </span>
          ) : (
            <Link style={{ padding: 5 }} to="/login">login</Link>
          )}
        </div>

        {/* Sistema de Rutas */}
        <Routes>
          <Route path="/login" element={
            // Si ya hay usuario, lo redirigimos a la raíz; si no, mostramos el login
            user ? <Navigate replace to="/" /> : loginForm()
          } />
          {/* Ruta de login */}

         <Route path="/blogs/:id" element={
            <BlogDetails 
              blogs={blogs} 
              updateBlog={updateBlog} 
              deleteBlog={deleteBlog} 
              currentUser={user} 
            />
          } />

          {/* RUTA CREAR BLOGS */}
          <Route path="/create" element={
            user ? <BlogForm createBlog={addBlog} /> : <Navigate replace to="/login" />
          } />

          {/* RUTA RAÍZ */}
          <Route path="/" element={
            user === null ? <Navigate replace to="/login" /> : (
              <div>
                <h2>blog app</h2>
                {sortedBlogs.map(blog =>
                  <Blog 
                    key={blog.id} 
                    blog={blog} 
                    updateBlog={updateBlog} 
                    deleteBlog={deleteBlog} 
                    currentUser={user} 
                  />
                )}
              </div>
            )
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App