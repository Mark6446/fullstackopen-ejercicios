import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BlogForm from './BlogForm'
import { expect, test, vi } from 'vitest'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  // Renderizamos el componente envuelto en MemoryRouter
  const { container } = render(
    <MemoryRouter>
      <BlogForm createBlog={createBlog} />
    </MemoryRouter>
  )

  // Seleccionamos los inputs por su etiqueta genérica (sabemos el orden exacto)
  const inputs = container.querySelectorAll('input')
  const titleInput = inputs[0]
  const authorInput = inputs[1]
  const urlInput = inputs[2]
  
  const sendButton = screen.getByText('create')

  // Simulamos al usuario escribiendo
  await user.type(titleInput, 'Mi titulo de prueba')
  await user.type(authorInput, 'Autor de prueba')
  await user.type(urlInput, 'http://prueba.com')
  
  // Enviamos el formulario
  await user.click(sendButton)

  // Comprobaciones
  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('Mi titulo de prueba')
  expect(createBlog.mock.calls[0][0].author).toBe('Autor de prueba')
  expect(createBlog.mock.calls[0][0].url).toBe('http://prueba.com')
})