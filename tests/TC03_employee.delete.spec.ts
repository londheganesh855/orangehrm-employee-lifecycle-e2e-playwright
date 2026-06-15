import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { PIMPage } from '../Pages/PIMPage';
import { LoginHelper } from '../helper/loginHelper';
import employeeData from '../testData/employeeData.json';
import { createAuthenticatedApiContext, EMPLOYEES_API, logStep } from './testUtils';

test.describe('Employee deletion', () => {
  test('deletes the test employee and validates the result in UI and API', async ({ page }) => {
    test.setTimeout(120000);

    const loginPage = new LoginPage(page);
    const pimPage = new PIMPage(page);
    const loginHelper = new LoginHelper(page);
    const uniqueEmployeeId = employeeData.employeeId;


    logStep('ACT I - Open application and perform login');
    await page.goto('/');
    await loginHelper.login();

    logStep('ASSERT I - Verify successful login (Dashboard URL validation)');
    await expect(page).toHaveURL(/dashboard/);

    logStep('ACT II - Initialize authenticated API context using session cookies');
    const apiContext = await createAuthenticatedApiContext(page);
    expect(apiContext).toBeDefined();

    logStep('ACT V - Delete employee via UI');
    await pimPage.clickPIM();
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await pimPage.clickDeleteEmployee(uniqueEmployeeId);
    await pimPage.clickYesDelete();

    logStep('ASSERT V - Verify employee removal from UI results');
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await expect(pimPage.noRecordsFoundMessage.nth(1)).toBeVisible({timeout: 5000});

    logStep('ACT VI - Validate deletion via API');
    const afterDeleteResp = await apiContext.get(EMPLOYEES_API);
    expect(afterDeleteResp.status()).toBe(200);
    const afterBody = await afterDeleteResp.json();
    const deleted = afterBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);

    logStep('ASSERT VI - Confirm employee deletion in API');
    expect(deleted).toBeUndefined();

    logStep('ACT VII - Logout from application');
    await loginPage.logout();
    await expect(page).toHaveURL(/login/);
  });
});
