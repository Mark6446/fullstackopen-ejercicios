import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, Typography, Button, Box, Link as MuiLink } from '@mui/material'

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
      navigate('/')
    }
  }

  // Lógica de visibilidad
  const canLike = currentUser !== null
  const canDelete = currentUser && blog.user && currentUser.username === blog.user.username

  return (
    <Card sx={{ mt: 4, p: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h4" component="h2" gutterBottom>
          {blog.title}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          by {blog.author}
        </Typography>
        
        <MuiLink href={blog.url} target="_blank" rel="noopener noreferrer" display="block" sx={{ mb: 2 }}>
          {blog.url}
        </MuiLink>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Added by {blog.user ? blog.user.name : 'anonymous'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            {blog.likes} likes
          </Typography>
          
          {canLike && (
            <Button variant="outlined" color="primary" onClick={handleLike} size="small">
              LIKE
            </Button>
          )}
          
          {canDelete && (
            <Button variant="outlined" color="error" onClick={handleDelete} size="small">
              REMOVE
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default BlogDetails