# OrangeHRM Playwright E2E Framework

This repository contains a Playwright TypeScript automation framework that validates the Employee Lifecycle flow on the OrangeHRM demo application.

---

## Features

- Page Object Model (POM) architecture
- Data-driven employee creation
- UI + API cross-validation
- Custom HTML report generation
- Built-in Playwright HTML report support
- Video, screenshot, and trace capture
- CI workflow for GitHub Actions

---

## Setup

### 1. Install dependencies

```bash
npm ci
npx playwright install --with-deps
```

### 2. Configure environment values

Create a `.env.playwright` file at the repository root with these variables:

```bash
LoginUsername=<your-username>
LoginPassword=<your-password>
BaseURL=https://opensource-demo.orangehrmlive.com/
```

Do not commit credentials to source control.

---

## Project Structure

- `Pages/` - Page object classes for OrangeHRM screens
- `tests/` - End-to-end test scenarios
- `testData/` - Test input data files
- `helper/` - Reusable helper classes
- `playwright.config.ts` - Playwright test configuration
- `html-reporter.ts` - Custom HTML report generator
- `.github/workflows/playwright.yml` - CI pipeline definition

---

## Execution

Run the tests using the configured npm script:

```bash
npm test
```

For headed execution:

```bash
npm run test:headed
```

If you need to run the custom TypeScript reporter, use the configured ts-node loader:

```bash
npx cross-env NODE_OPTIONS=--require ts-node/register playwright test tests/EmployeeE2E.spec.ts
```

---

## Reports and Artifacts

- Built-in Playwright report: `playwright-report/`
- Custom HTML report: `test-results/orangehrm-automation-test-report.html`
- PDF report: `test-results/OrangeHRM Automation Test Report.pdf`
- Markdown summary: `test-results/test-report.md`
- Video files: `test-results/assets/videos/`
- Screenshots: `test-results/assets/screenshots/`
- Traces: `test-results/assets/traces/`

Open the built-in report with:

```bash
npx playwright show-report
```

---

## CI

The repository includes a GitHub Actions workflow at `.github/workflows/playwright.yml` that installs dependencies, runs tests, and publishes the HTML report artifact.

---

## Notes

- Keep credentials out of version control.
- Verify the `.env.playwright` file is present before executing tests.
- Use the custom report for branded output and the Playwright report for built-in diagnostics.
