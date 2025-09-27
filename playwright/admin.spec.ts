import { test, expect } from '@playwright/test'

test.describe('Admin Panel Tests', () => {
  test('admin can access login page', async ({ page }) => {
    await page.goto('/login')
    
    // Check that login form elements are present
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('admin can navigate to posts management', async ({ page }) => {
    await page.goto('/admin/posts')
    
    // Check that the posts admin page loads
    await expect(page).toHaveURL(/\/admin\/posts/)
  })

  test('admin can access media management', async ({ page }) => {
    await page.goto('/admin/media')
    
    // Check that the media admin page loads
    await expect(page).toHaveURL(/\/admin\/media/)
  })

  test('admin can access analytics page', async ({ page }) => {
    await page.goto('/admin/analytics')
    
    // Check that the analytics admin page loads
    await expect(page).toHaveURL(/\/admin\/analytics/)
  })
})

test.describe('Public Pages Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/TanCMS/)
  })

  test('blog page is accessible', async ({ page }) => {
    await page.goto('/blog')
    
    // Check that the blog page loads
    await expect(page).toHaveURL(/\/blog/)
  })

  test('analytics public page is accessible', async ({ page }) => {
    await page.goto('/analytics')
    
    // Check that the analytics page loads
    await expect(page).toHaveURL(/\/analytics/)
  })
})