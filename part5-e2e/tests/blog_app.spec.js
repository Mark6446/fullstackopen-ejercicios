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

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.locator('input').nth(0).fill('mluukkai')
      await page.locator('input').nth(1).fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('input').nth(0).fill('mluukkai')
      await page.locator('input').nth(1).fill('wrong')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.locator('input').nth(0).fill('mluukkai')
      await page.locator('input').nth(1).fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('link', { name: 'create new' }).click()
      
      await page.locator('input').nth(0).fill('Playwright Router Test')
      await page.locator('input').nth(1).fill('E2E Author')
      await page.locator('input').nth(2).fill('http://playwright.com')
      await page.getByRole('button', { name: 'create' }).click()
      
      await expect(page.getByText('Playwright Router Test E2E Author')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('link', { name: 'create new' }).click()
        
        await page.locator('input').nth(0).fill('First Blog')
        await page.locator('input').nth(1).fill('Author 1')
        await page.locator('input').nth(2).fill('http://blog1.com')
        await page.getByRole('button', { name: 'create' }).click()
        
        await expect(page.getByText('First Blog Author 1')).toBeVisible()
      })

      test('a blog can be liked', async ({ page }) => {
        await page.getByRole('link', { name: 'First Blog Author 1' }).click() 
        
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('1 likes')).toBeVisible()
      })

      test('the creator can delete a blog', async ({ page }) => {
        await page.getByRole('link', { name: 'First Blog Author 1' }).click() 
        
        page.on('dialog', dialog => dialog.accept()) 
        await page.getByRole('button', { name: 'remove' }).click()
        
        await expect(page.getByRole('link', { name: 'First Blog Author 1' })).not.toBeVisible()
      })
    })
  })
})