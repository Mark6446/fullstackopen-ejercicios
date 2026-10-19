import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Typography, Box } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')
  
  const navigate = useNavigate()

  const addBlog = async (event) => {
    event.preventDefault()
    await createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl
    })

    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
    navigate('/')
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        create new
      </Typography>

      <form onSubmit={addBlog}>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="title"
            variant="outlined"
            fullWidth
            value={newTitle}
            onChange={event => setNewTitle(event.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="author"
            variant="outlined"
            fullWidth
            value={newAuthor}
            onChange={event => setNewAuthor(event.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="url"
            variant="outlined"
            fullWidth
            value={newUrl}
            onChange={event => setNewUrl(event.target.value)}
          />
        </Box>
        <Button variant="contained" color="primary" type="submit">
          create
        </Button>
      </form>
    </Box>
  )
}

export default BlogForm