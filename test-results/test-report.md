# Test Results Summary
  
## Overview
- Total Tests: 1
- Passed: 1
- Failed: 0
- Duration: 27.8s

## Detailed Results


### creates, verifies, edits, validates via API, deletes and logs out
- Status: passed
- Duration: 27.8s
- Start Time: 13/6/2026, 4:55:13 pm
- End Time: 13/6/2026, 4:55:41 pm

- Before Hooks
- Navigate to "/"
- Fill "Admin" getByPlaceholder('Username')
- Fill "admin123" getByPlaceholder('Password')
- Click getByRole('button', { name: 'Login' })
- Expect "toHaveURL"
- Create request context
- Click locator('//span[text()=\'PIM\']')
- Click getByRole('button', { name: '  Add  ' })
- Set input files locator('//input[@class="oxd-file-input"]')
- Fill "John" getByPlaceholder('First Name')
- Fill "Harnett" getByPlaceholder('Middle Name')
- Fill "Doe" getByPlaceholder('Last Name')
- Fill "E914215" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- GET "/web/index.php/api/v2/pim/employees"
- Expect "toBe"
- Click getByRole('button', { name: ' Save ' })
- Expect "toBeVisible" locator('//div[@class="oxd-toast-content oxd-toast-content--success"]//p').first()
- Expect "toContain"
- Click getByText('Job')
- Click locator('//label[text()=\'Job Title\']/../following-sibling::div')
- Click getByRole('option', { name: 'Account Assistant' })
- Click locator('//label[text()=\'Employment Status\']/../following-sibling::div')
- Click getByRole('option', { name: 'Freelance' })
- Click getByRole('button', { name: ' Save ' })
- Expect "toBe"
- Expect "toBe"
- Click locator('//span[text()=\'PIM\']')
- Fill "E914215" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Click getByRole('button', { name: '  Search  ' })
- Click locator('//div[text()=\'E914215\']/ancestor::div[contains(@class,\'oxd-table-row\')]//i[contains(@class,\'bi-pencil-fill\')]')
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
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- GET "/web/index.php/api/v2/pim/employees/234/job-details"
- Expect "toBe"
- Expect "toBe"
- Expect "toBe"
- Click locator('//span[text()=\'PIM\']')
- Fill "E914215" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Click getByRole('button', { name: '  Search  ' })
- Click locator('//div[text()=\'E914215\']/ancestor::div[contains(@class,\'oxd-table-row\')]//i[contains(@class,\'icon bi-trash\')]')
- Click getByRole('button', { name: '  Yes, Delete  ' })
- Fill "E914215" locator('//label[text()=\'Employee Id\']/../following-sibling::div//input')
- Click getByRole('button', { name: '  Search  ' })
- Expect "toBeVisible" locator('//div[@class=\'oxd-toast-content oxd-toast-content--info\']//p').nth(1)
- GET "/web/index.php/api/v2/pim/employees"
- Expect "toBe"
- Expect "toBeUndefined"
- Click locator('//p[@class=\'oxd-userdropdown-name\']')
- Click locator('//a[text()=\'Logout\']')
- After Hooks

