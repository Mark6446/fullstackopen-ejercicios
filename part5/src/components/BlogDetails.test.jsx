import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import BlogDetails from './BlogDetails'
import { expect, test } from 'vitest'

const blog = {
  id: '12345',
  title: 'Testing React Router',
  author: 'Test Author',
  url: 'http://test.com',
  likes: 5,
  user: {
    username: 'mluukkai',
    name: 'Matti Luukkainen'
  }
}

// Función auxiliar para renderizar el componente
const renderWithRouter = (currentUser) => {
  return render(
    <MemoryRouter initialEntries={['/blogs/12345']}>
      <Routes>
        <Route path="/blogs/:id" element={
          <BlogDetails 
            blogs={[blog]} 
            currentUser={currentUser} 
            updateBlog={() => {}} 
            deleteBlog={() => {}} 
          />
        } />
      </Routes>
    </MemoryRouter>
  )
}

test('shows details but no buttons for unauthenticated user', () => {
  renderWithRouter(null)
  
  expect(screen.getByText('Testing React Router Test Author')).toBeDefined()
  
  const likeButton = screen.queryByText('like')
  const removeButton = screen.queryByText('remove')
  
  expect(likeButton).toBeNull()
  expect(removeButton).toBeNull()
})

test('shows like button but no remove button for authenticated non-creator', () => {
  const otherUser = { username: 'otheruser', name: 'Other User' }
  renderWithRouter(otherUser)
  
  const likeButton = screen.queryByText('like')
  const removeButton = screen.queryByText('remove')
  
  expect(likeButton).toBeDefined()
  expect(removeButton).toBeNull()
})

test('shows both like and remove buttons for the creator', () => {
  const creatorUser = { username: 'mluukkai', name: 'Matti Luukkainen' }
  renderWithRouter(creatorUser)
  
  const likeButton = screen.queryByText('like')
  const removeButton = screen.queryByText('remove')
  
  expect(likeButton).toBeDefined()
  expect(removeButton).toBeDefined()
})