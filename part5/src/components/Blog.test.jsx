import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    title: 'Testing a React component',
    author: 'Test Author',
    url: 'http://testurl.com',
    likes: 5,
    user: {
      username: 'testuser',
      name: 'Test User'
    }
  }

  // Muestra título y autor, pero NO url ni likes
  test('renders title and author, but not url or likes by default', () => {
    render(<Blog blog={blog} />)

    const titleAndAuthor = screen.getByText('Testing a React component Test Author', { exact: false })
    expect(titleAndAuthor).toBeDefined()

    // Buscamos que estos textos NO estén en el DOM
    const url = screen.queryByText('http://testurl.com')
    expect(url).toBeNull()
    
    const likes = screen.queryByText('likes 5')
    expect(likes).toBeNull()
  })

  // Muestra url y likes al hacer clic en view
  test('shows url and likes when view button is clicked', async () => {
    render(<Blog blog={blog} />)

    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const url = screen.getByText('http://testurl.com', { exact: false })
    expect(url).toBeDefined()

    const likes = screen.getByText('likes 5', { exact: false })
    expect(likes).toBeDefined()
  })

  // El botón de like funciona y se registra cada clic
  test('if the like button is clicked twice, the event handler is called twice', async () => {
    const mockUpdateBlog = vi.fn()

    render(<Blog blog={blog} updateBlog={mockUpdateBlog} />)

    const user = userEvent.setup()
    
    // Primero abrimos el blog
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    // Luego clickamos like dos veces
    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockUpdateBlog.mock.calls).toHaveLength(2)
  })
})