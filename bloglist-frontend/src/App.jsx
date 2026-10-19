import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

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

  const blogFormRef = useRef()

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
      blogFormRef.current.toggleVisibility() // Cierra el formulario tras crear
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
    <div>
      <Notification message={notification.message} type={notification.type} />
      {user === null ? loginForm() : (
        <div>
          <h2>blogs</h2>
          <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>

          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
          <br/>
          {sortedBlogs.map(blog =>
            <Blog key={blog.id} blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} currentUser={user} />
          )}
        </div>
      )}
    </div>
  )
}

export default App