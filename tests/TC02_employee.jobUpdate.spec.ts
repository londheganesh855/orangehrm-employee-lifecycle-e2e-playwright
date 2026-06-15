import { test, expect } from '@playwright/test';
import { PIMPage } from '../Pages/PIMPage';
import { EmployeeDetailsPage } from '../Pages/EmployeeDetailsPage';
import { LoginHelper } from '../helper/loginHelper';
import employeeData from '../testData/employeeData.json';
import jobDetails from '../testData/jobDetails.json';
import { createAuthenticatedApiContext, EMPLOYEES_API, logStep } from './testUtils';

test.describe('Employee job update and validation', () => {
  test('updates the employee job details and verifies UI and API consistency', async ({ page }) => {
    test.setTimeout(120000);

    const pimPage = new PIMPage(page);
    const employeeDetailsPage = new EmployeeDetailsPage(page);
    const loginHelper = new LoginHelper(page);
    const uniqueEmployeeId = employeeData.employeeId;
    const firstName = employeeData.firstName;
    const lastName = employeeData.lastName;
    const middleName = employeeData.middleName;

    logStep('ACT I - Open application and perform login');
    await page.goto('/');
    await loginHelper.login();

    logStep('ASSERT I - Verify successful login (Dashboard URL validation)');
    await expect(page).toHaveURL(/dashboard/);

    logStep('ACT II - Initialize authenticated API context using session cookies');
    const apiContext = await createAuthenticatedApiContext(page);
    expect(apiContext).toBeDefined();

    logStep('ACT III - Search and open the employee record for update');
    await pimPage.clickPIM();
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await pimPage.clickEditEmployee(uniqueEmployeeId);

    logStep('ACT IV - Update employee job details');
    await employeeDetailsPage.clickJobTab();
    await employeeDetailsPage.clickJobTitleDropdown();
    await employeeDetailsPage.selectJobTitle(jobDetails.updatedEmployment.updatedJobTitle);
    await employeeDetailsPage.clickEmploymentStatusDropdown();
    await employeeDetailsPage.selectEmploymentStatus(jobDetails.updatedEmployment.updatedEmpStatus);
    await employeeDetailsPage.clickSave();

    logStep('ASSERT IV - Verify updated job details in UI');
    await expect(await employeeDetailsPage.getSelectedJobTitle()).toBe(jobDetails.updatedEmployment.updatedJobTitle);
    await expect(await employeeDetailsPage.getSelectedEmploymentStatus()).toBe(jobDetails.updatedEmployment.updatedEmpStatus);

    logStep('ACT V - Validate employee data using API');
    const employeesResp = await apiContext.get(EMPLOYEES_API);
    expect(employeesResp.status()).toBe(200);
    const employeesBody = await employeesResp.json();

    const found = employeesBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
    expect(found).toBeDefined();

    const empNumber = found.empNumber;
    const jobResp = await apiContext.get(`${EMPLOYEES_API}/${empNumber}/job-details`);
    expect(jobResp.status()).toBe(200);
    const jobBody = await jobResp.json();

    logStep('ASSERT V - Verify API data matches UI updated values');
    expect(found.firstName).toBe(firstName);
    expect(found.lastName).toBe(lastName);
    expect(found.middleName).toBe(middleName);
    expect(jobBody.data.jobTitle.title).toBe(jobDetails.updatedEmployment.updatedJobTitle);
    expect(jobBody.data.empStatus.name).toBe(jobDetails.updatedEmployment.updatedEmpStatus);
  });
});
