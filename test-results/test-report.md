# Test Results Summary
  
## Overview
- Total Tests: 4
- Passed: 3
- Failed: 0
- Duration: 1m 25.6s

## Detailed Results


### creates, verifies, edits, validates via API, deletes and logs out
- Status: skipped
- Duration: 0.0s
- Start Time: 15/6/2026, 4:01:34 pm
- End Time: 15/6/2026, 4:01:34 pm





### creates employee from test data and assigns initial job details
- Status: passed
- Duration: 51.8s
- Start Time: 15/6/2026, 4:01:35 pm
- End Time: 15/6/2026, 4:02:29 pm

- Before Hooks
- Navigate to "/"
- Fill "Admin" getByPlaceholder('Username')
- Fill "admin123" getByPlaceholder('Password')
- Click getByRole('button', { name: 'Login' })
- Expect "toHaveURL"
- Create request context
- Expect "toBeDefined"
- GET "/web/index.php/api/v2/pim/employees"
- Click locator('//span[text()=\'PIM\']')
- Click getByRole('button', { name: '  Add  ' })
- Set input files locator('//input[@class="oxd-file-input"]')
- Fill "John" getByPlaceholder('First Name')
- Fill "Harnett" getByPlaceholder('Middle Name')
- Fill "Doe" getByPlaceholder('Last Name')
- Fill "E0630" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Click getByRole('button', { name: ' Save ' })
- Expect "toBeVisible" locator('//div[contains(@class,\'oxd-toast-content\') and contains(., \'Success\')]').first()
- Expect "toContain"
- Click getByText('Job')
- Click locator('//label[text()=\'Job Title\']/../following-sibling::div')
- Click getByRole('option', { name: 'Account Assistant' })
- Click locator('//label[text()=\'Employment Status\']/../following-sibling::div')
- Click getByRole('option', { name: 'Freelance' })
- Click getByRole('button', { name: ' Save ' })
- Expect "toBe"
- Expect "toBe"
- After Hooks



### updates the employee job details and verifies UI and API consistency
- Status: passed
- Duration: 22.2s
- Start Time: 15/6/2026, 4:02:29 pm
- End Time: 15/6/2026, 4:02:52 pm

- Before Hooks
- Navigate to "/"
- Fill "Admin" getByPlaceholder('Username')
- Fill "admin123" getByPlaceholder('Password')
- Click getByRole('button', { name: 'Login' })
- Expect "toHaveURL"
- Create request context
- Expect "toBeDefined"
- Click locator('//span[text()=\'PIM\']')
- Fill "E0630" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Click getByRole('button', { name: '  Search  ' })
- Click locator('//div[text()=\'E0630\']/ancestor::div[contains(@class,\'oxd-table-row\')]//i[contains(@class,\'bi-pencil-fill\')]')
- Click getByText('Job')
- Click locator('//label[text()=\'Job Title\']/../following-sibling::div')
- Click getByRole('option', { name: 'Automaton Tester' })
- Click locator('//label[text()=\'Employment Status\']/../following-sibling::div')
- Click getByRole('option', { name: 'Full-Time Permanent' })
- Click getByRole('button', { name: ' Save ' })
- Expect "toBe"
- Expect "toBe"
- GET "/web/index.php/api/v2/pim/employees"
- Expect "toBe"
- Expect "toBeDefined"
- GET "/web/index.php/api/v2/pim/employees/262/job-details"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- After Hooks



### deletes the test employee and validates the result in UI and API
- Status: passed
- Duration: 11.7s
- Start Time: 15/6/2026, 4:02:52 pm
- End Time: 15/6/2026, 4:03:03 pm

- Before Hooks
- Navigate to "/"
- Fill "Admin" getByPlaceholder('Username')
- Fill "admin123" getByPlaceholder('Password')
- Click getByRole('button', { name: 'Login' })
- Expect "toHaveURL"
- Create request context
- Expect "toBeDefined"
- Click locator('//span[text()=\'PIM\']')
- Fill "E0630" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Click getByRole('button', { name: '  Search  ' })
- Click locator('//div[text()=\'E0630\']/ancestor::div[contains(@class,\'oxd-table-row\')]//i[contains(@class,\'icon bi-trash\')]')
- Click getByRole('button', { name: '  Yes, Delete  ' })
- Fill "E0630" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Click getByRole('button', { name: '  Search  ' })
- Expect "toBeVisible" locator('//div[@class=\'oxd-toast-content oxd-toast-content--info\']//p').nth(1)
- GET "/web/index.php/api/v2/pim/employees"
- Expect "toBe"
- Expect "toBeUndefined"
- Click locator('//p[@class=\'oxd-userdropdown-name\']')
- Click locator('//a[text()=\'Logout\']')
- Expect "toHaveURL"
- After Hooks

