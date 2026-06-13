<<<<<<< HEAD
# orangehrm-employee-lifecycle-e2e-playwright
=======
# OrangeHRM Playwright E2E

This repository contains a Playwright TypeScript framework that automates an Employee Lifecycle flow on the OrangeHRM demo site.

Setup

1. Install dependencies:

```bash
npm ci
npx playwright install --with-deps
```

2. Provide credentials in `.env.playwright` at project root:

```
LoginUsername=Admin
LoginPassword=admin123
BaseURL=https://opensource-demo.orangehrmlive.com/
```

Run tests

```bash
npm test
# view report
npm run report:open
```

Record execution

- Playwright is configured to record video for every test run.
- The browser is launched maximized with `--start-maximized`.
- After a test run, videos are stored in Playwright's artifacts directory, typically under `test-results/` or in the HTML report.

What is included
- Page Object Model under `Pages/`
- Tests under `tests/` including `OrangeHRM_EmployeeE2E.spec.ts`
- Test data under `testData/`
- GitHub Actions workflow at `.github/workflows/playwright.yml`

Report & Video

- Playwright HTML report is generated in `playwright-report/`.
- Video recordings are saved per test run and can be reviewed from the report or the artifacts folder.
>>>>>>> 46576bc (Initial commit - OrangeHRM automation framework)
