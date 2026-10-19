const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    
    await page.goto('/')
  })

  // Comprobar que carga el login
  test('Login form is shown', async ({ page }) => {
    const loginTitle = page.getByRole('heading', { name: 'Log in to application' })
    await expect(loginTitle).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
  })

  describe('Login', () => {
    // Login correcto
    test('succeeds with correct credentials', async ({ page }) => {
      await page.locator('input[type="text"]').fill('mluukkai')
      await page.locator('input[type="password"]').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    // Login incorrecto
    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('input[type="text"]').fill('mluukkai')
      await page.locator('input[type="password"]').fill('wrongpass')
      await page.getByRole('button', { name: 'login' }).click()

      const errorNotification = page.getByText('Wrong username or password')
      await expect(errorNotification).toBeVisible()
      await expect(errorNotification).toHaveCSS('color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.locator('input[type="text"]').fill('mluukkai')
      await page.locator('input[type="password"]').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
      
      // Esperamos activamente a que termine el login
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    // Crear blog
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.locator('input[name="Title"]').fill('Testing E2E with Playwright')
      await page.locator('input[name="Author"]').fill('Playwright Test')
      await page.locator('input[name="Url"]').fill('http://test.com')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(page.getByText('Testing E2E with Playwright Playwright Test').first()).toBeVisible()
    })

    describe('and several blogs exist', () => {
      beforeEach(async ({ page }) => {
        // Creamos tres blogs
        for (let i = 1; i <= 3; i++) {
          await page.getByRole('button', { name: 'new blog' }).click()
          await page.locator('input[name="Title"]').fill(`Blog number ${i}`)
          await page.locator('input[name="Author"]').fill(`Author ${i}`)
          await page.locator('input[name="Url"]').fill(`http://blog${i}.com`)
          await page.getByRole('button', { name: 'create' }).click()

          await expect(page.getByText(`Blog number ${i} Author ${i}`).first()).toBeVisible()
        }
      })

      // Dar Like (Editar blog)
      test('a blog can be liked', async ({ page }) => {
        const blogDiv = page.getByText('Blog number 1 Author 1').first().locator('..')
        await blogDiv.getByRole('button', { name: 'view' }).click()
        
        await blogDiv.getByRole('button', { name: 'like' }).click()

        await expect(blogDiv.getByText('likes 1')).toBeVisible()
      })

      // Borrar un blog propio
      test('the creator can delete a blog', async ({ page }) => {
        const blogDiv = page.getByText('Blog number 2 Author 2').first().locator('..')
        await blogDiv.getByRole('button', { name: 'view' }).click()

        page.on('dialog', dialog => dialog.accept())
        await blogDiv.getByRole('button', { name: 'remove' }).click()

        await expect(page.getByText('Blog number 2 Author 2').first()).not.toBeVisible()
      })

      // Solo el creador ve el botón remove
      test('only the creator sees the delete button', async ({ page, request }) => {
        // Creamos otro usuario y nos logueamos con él
        await request.post('http://localhost:3003/api/users', {
          data: { name: 'Other User', username: 'otheruser', password: 'password123' }
        })
        await page.getByRole('button', { name: 'logout' }).click()
        await page.locator('input[type="text"]').fill('otheruser')
        await page.locator('input[type="password"]').fill('password123')
        await page.getByRole('button', { name: 'login' }).click()
        await expect(page.getByText('Other User logged in')).toBeVisible()

        const blogDiv = page.getByText('Blog number 1 Author 1').first().locator('..')
        await blogDiv.getByRole('button', { name: 'view' }).click()

        await expect(blogDiv.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })

    // Ordenación por likes
     test('blogs are sorted by likes in descending order', async ({ page }) => {
        // Abrimos todos los blogs
        await page.getByText('Blog number 1').first().locator('..').getByRole('button', { name: 'view' }).click()
        await page.getByText('Blog number 2').first().locator('..').getByRole('button', { name: 'view' }).click()
        await page.getByText('Blog number 3').first().locator('..').getByRole('button', { name: 'view' }).click()

        // Damos 3 likes al blog 3 y esperamos a que el DOM se actualice en cada clic
        const blog3Div = page.getByText('Blog number 3 Author 3').first().locator('..')
        await blog3Div.getByRole('button', { name: 'like' }).click()
        await expect(blog3Div.getByText('likes 1')).toBeVisible()
        
        await blog3Div.getByRole('button', { name: 'like' }).click()
        await expect(blog3Div.getByText('likes 2')).toBeVisible()
        
        await blog3Div.getByRole('button', { name: 'like' }).click()
        await expect(blog3Div.getByText('likes 3')).toBeVisible()

        // Damos 1 like al blog 1 y esperamos a que se actualice
        const blog1Div = page.getByText('Blog number 1 Author 1').first().locator('..')
        await blog1Div.getByRole('button', { name: 'like' }).click()
        await expect(blog1Div.getByText('likes 1')).toBeVisible()

        // Ahora que sabemos con 100% de seguridad que React ha reordenado la pantalla, leemos la lista
        const allDivs = await page.locator('div[style*="border"]').allInnerTexts()
        const blogElements = allDivs.filter(text => text.includes('hide'))
        
        expect(blogElements[0]).toContain('Blog number 3')
        expect(blogElements[1]).toContain('Blog number 1')
        expect(blogElements[2]).toContain('Blog number 2')
      })
    })
  })
})