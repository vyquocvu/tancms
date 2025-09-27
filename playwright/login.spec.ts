import { test, expect } from '@playwright/test'

test.describe('Login Scenarios', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Check page title and heading
    await expect(page).toHaveTitle(/TanCMS/)
    await expect(page.locator('h2:has-text("Sign in to TanCMS")')).toBeVisible()
    await expect(page.locator('text=Access your admin dashboard')).toBeVisible()
    
    // Check form elements are present
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Check form labels
    await expect(page.locator('label[for="email"]')).toHaveText('Email')
    await expect(page.locator('label[for="password"]')).toHaveText('Password')
    
    // Check initial button text
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In')
    
    // Check back to home link
    await expect(page.locator('a:has-text("← Back to home")')).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    
    // Fill invalid email
    await page.fill('#email', 'invalid-email')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    
    // Check for email validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/login')
    
    // Fill valid email but short password
    await page.fill('#email', 'user@example.com')
    await page.fill('#password', '123')
    await page.click('button[type="submit"]')
    
    // Check for password validation error
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible()
  })

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login')
    
    // Fill password field
    await page.fill('#password', 'testpassword')
    
    // Check password is hidden by default
    await expect(page.locator('#password')).toHaveAttribute('type', 'password')
    
    // Click show password button
    await page.click('button[type="button"]:has(.lucide-eye)')
    
    // Check password is now visible
    await expect(page.locator('#password')).toHaveAttribute('type', 'text')
    
    // Click hide password button  
    await page.click('button[type="button"]:has(.lucide-eye-off)')
    
    // Check password is hidden again
    await expect(page.locator('#password')).toHaveAttribute('type', 'password')
  })

  test('successful login attempt (mocked)', async ({ page }) => {
    // Mock the login API response with a small delay to test loading state
    await page.route('/api/auth?action=login', async route => {
      // Small delay to ensure we can see the loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN'
          }
        })
      })
    })

    await page.goto('/login')
    
    // Fill valid credentials
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'password123')
    
    // Submit form and immediately check for loading state
    const submitPromise = page.click('button[type="submit"]')
    
    // Check loading state appears
    await expect(page.locator('button[type="submit"]:has-text("Signing In...")')).toBeVisible({ timeout: 2000 })
    
    // Wait for the submit to complete
    await submitPromise
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin', { timeout: 5000 })
    await expect(page).toHaveURL('/admin')
  })

  test('failed login attempt shows error message', async ({ page }) => {
    // Mock failed login API response
    await page.route('/api/auth?action=login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid email or password'
        })
      })
    })

    await page.goto('/login')
    
    // Fill credentials
    await page.fill('#email', 'user@example.com')
    await page.fill('#password', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Check for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
    
    // Ensure we stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('network error shows appropriate message', async ({ page }) => {
    // Mock network error
    await page.route('/api/auth?action=login', async route => {
      await route.abort('connectionreset')
    })

    await page.goto('/login')
    
    // Fill credentials
    await page.fill('#email', 'user@example.com')
    await page.fill('#password', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Check for network error message
    await expect(page.locator('text=Network error. Please try again.')).toBeVisible()
  })

  test('form fields are disabled during login attempt', async ({ page }) => {
    // Mock delayed API response
    await page.route('/api/auth?action=login', async route => {
      // Delay response to test loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' }
        })
      })
    })

    await page.goto('/login')
    
    // Fill credentials
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Check that form fields are disabled during loading
    await expect(page.locator('#email')).toBeDisabled()
    await expect(page.locator('#password')).toBeDisabled()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // Wait for form to be enabled again (after redirect or completion)
    await page.waitForTimeout(1500)
  })

  test('back to home link works', async ({ page }) => {
    await page.goto('/login')
    
    // Click back to home link
    await page.click('a:has-text("← Back to home")')
    
    // Check redirect to home page
    await expect(page).toHaveURL('/')
  })

  test('form preserves values after validation error', async ({ page }) => {
    await page.goto('/login')
    
    // Fill form with invalid data
    await page.fill('#email', 'user@example.com')
    await page.fill('#password', '123') // Too short
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Check validation error appears
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible()
    
    // Check that email value is preserved
    await expect(page.locator('#email')).toHaveValue('user@example.com')
    await expect(page.locator('#password')).toHaveValue('123')
  })
})