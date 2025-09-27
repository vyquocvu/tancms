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

# Record login tests with video capture
npm run test:e2e:record

# Record interactive login session (codegen)
npm run record:login
```

## Test Structure

### Recorded Login Tests (`recorded-login.spec.ts`)
- Complete login workflow recording with screenshots
- Password visibility toggle interaction recording
- Form validation interaction recording  
- Full user journey with trace recording
- Automated video and screenshot capture on test execution

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

## Recording and Debugging

### Video and Screenshot Capture
The configuration automatically captures:
- **Videos**: Recorded for failed tests (`retain-on-failure`)
- **Screenshots**: Taken automatically on test failures
- **Traces**: Collected on first retry for debugging

### Interactive Recording
Use the codegen tool to record login interactions:

```bash
# Record login interactions interactively
npm run record:login

# Record specific URL
npm run record:login http://localhost:4173/login
```

This opens a browser where you can perform login actions. The generated test code will be saved to `playwright/generated-login.spec.ts`.

### Recorded Test Artifacts
When running recorded login tests, the following artifacts are created:
- `test-results/login-start.png` - Login page initial state
- `test-results/login-invalid-filled.png` - Form with invalid credentials
- `test-results/login-error.png` - Error state display
- `test-results/login-valid-filled.png` - Form with valid credentials  
- `test-results/login-loading.png` - Loading state during submission
- `test-results/login-success.png` - Successful login redirect
- `test-results/password-*.png` - Password visibility toggle states
- `test-results/validation-*.png` - Form validation states
- `test-results/login-user-journey-trace.zip` - Complete user journey trace

### Viewing Recordings
```bash
# View HTML report with videos and traces
npx playwright show-report

# View specific trace file
npx playwright show-trace test-results/login-user-journey-trace.zip
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