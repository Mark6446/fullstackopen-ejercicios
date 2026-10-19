import { useParams, useNavigate } from 'react-router-dom'

const BlogDetails = ({ blogs, updateBlog, deleteBlog, currentUser }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const blog = blogs.find(b => b.id === id)

  if (!blog) return null

  const handleLike = () => {
    updateBlog(blog.id, {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id
    })
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
      navigate('/') // Redirigimos a la lista tras borrar
    }
  }

  // Lógica de visibilidad
  const canLike = currentUser !== null
  const canDelete = currentUser && blog.user && currentUser.username === blog.user.username

  return (
    <div>
      <h2>{blog.title} {blog.author}</h2>
      <a href={blog.url}>{blog.url}</a>
      <div>
        {blog.likes} likes 
        {canLike && <button onClick={handleLike}>like</button>}
      </div>
      <div>added by {blog.user ? blog.user.name : 'anonymous'}</div>
      {canDelete && <button onClick={handleDelete}>remove</button>}
    </div>
  )
}

export default BlogDetails