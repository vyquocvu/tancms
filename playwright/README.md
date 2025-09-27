# Playwright E2E Tests

This directory contains end-to-end tests for TanCMS using Playwright.

## Setup

The Playwright setup is already configured and ready to use. The configuration includes:

- **Test Directory**: `./playwright/`
- **Base URL**: `http://localhost:4173`
- **Auto Server Start**: Development server starts automatically on port 4173
- **Browsers**: Chrome and Firefox (using system browsers)

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in a specific file
npm run test:e2e admin.spec.ts

# Run tests with a specific browser
npm run test:e2e --project=chromium

# List all available tests
npm run test:e2e --list

# Run tests in headed mode (visible browser)
npm run test:e2e --headed

# Generate HTML report
npm run test:e2e --reporter=html
```

## Test Structure

### Login Tests (`login.spec.ts`)
- Comprehensive login form functionality testing
- Form validation scenarios (empty fields, invalid email, short password)
- Password visibility toggle functionality
- Successful login workflow with mocked API responses
- Error handling for failed login attempts and network errors
- Form state management during loading states
- Navigation and link functionality

### Admin Panel Tests (`admin.spec.ts`)
- Tests admin routes accessibility
- Validates public page functionality
- Covers basic navigation scenarios

### Post Management Workflow (`post-workflow.spec.ts`)
- Tests complete post creation workflow
- Validates post editing functionality
- Tests post list management

## Writing New Tests

When adding new tests:

1. Create new `.spec.ts` files in the `playwright/` directory
2. Follow the existing test patterns for consistency
3. Use descriptive test names and organize with `test.describe()` blocks
4. Add appropriate assertions for the functionality being tested

Example test structure:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    await page.goto('/some-route')
    await expect(page.locator('selector')).toBeVisible()
  })
})
```

## Configuration

The Playwright configuration is defined in `playwright.config.ts` at the repository root. Key settings:

- **Automatic server management**: Starts `npm run dev -- --port 4173` before tests
- **Retry logic**: 2 retries on CI, 0 locally
- **Trace collection**: On first retry for debugging
- **Report generation**: HTML reports in `playwright-report/`

## Troubleshooting

If tests fail:

1. Check that the development server starts correctly: `npm run dev -- --port 4173`
2. Verify browser installation: `npx playwright install`
3. Run with debug output: `DEBUG=pw:webserver npm run test:e2e`
4. View traces for failed tests: `npx playwright show-trace <trace-file>`

## CI/CD Integration

The tests are ready for CI/CD integration. Key considerations:

- Set `CI=true` environment variable for CI environments
- Tests will retry automatically on CI
- HTML reports are generated in `playwright-report/`
- Test artifacts are stored in `test-results/`