import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  // Para poder encontrar los inputs de forma robusta, podemos buscarlos por su "name"
  // O podemos añadir placeholders en el componente. Vamos a usar un selector de CSS que busca por el atributo 'name'
  const { container } = render(<BlogForm createBlog={createBlog} />)

  // Seleccionamos los inputs usando container.querySelector
  const titleInput = container.querySelector('input[name="Title"]')
  const authorInput = container.querySelector('input[name="Author"]')
  const urlInput = container.querySelector('input[name="Url"]')
  
  const sendButton = screen.getByText('create')

  // Simulamos al usuario escribiendo
  await user.type(titleInput, 'Mi titulo de prueba')
  await user.type(authorInput, 'Autor de prueba')
  await user.type(urlInput, 'http://prueba.com')
  
  // Enviamos
  await user.click(sendButton)

  // Verificamos
  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('Mi titulo de prueba')
  expect(createBlog.mock.calls[0][0].author).toBe('Autor de prueba')
  expect(createBlog.mock.calls[0][0].url).toBe('http://prueba.com')
})