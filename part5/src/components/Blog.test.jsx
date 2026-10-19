import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Blog from './Blog'
import { expect, test } from 'vitest'

test('<Blog /> renders title and author inside a link', () => {
  const blog = {
    id: '12345',
    title: 'Testing React Router Links',
    author: 'Matti Luukkainen'
  }

  render(
    <MemoryRouter>
      <Blog blog={blog} />
    </MemoryRouter>
  )

  const element = screen.getByText('Testing React Router Links Matti Luukkainen')
  expect(element).toBeDefined()
})