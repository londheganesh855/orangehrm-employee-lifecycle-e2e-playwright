import { test, expect, request as playwrightRequest } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { PIMPage } from '../Pages/PIMPage';
import { AddEmployeePage } from '../Pages/AddEmployeePage';
import { EmployeeDetailsPage } from '../Pages/EmployeeDetailsPage';
import { LoginHelper } from '../helper/loginHelper';
import employeeData from '../testData/employeeData.json';
import jobDetails from '../testData/jobDetails.json';

const logStep = (message: string) => console.log(`STEP: ${message}`);

test.describe('Employee Lifecycle - E2E', () => {
  test('creates, verifies, edits, validates via API, deletes and logs out', async ({ page }) => {
    test.setTimeout(120000);

    
    const loginPage = new LoginPage(page);
    const pimPage = new PIMPage(page);
    const addEmployeePage = new AddEmployeePage(page);
    const employeeDetailsPage = new EmployeeDetailsPage(page);
    const loginHelper = new LoginHelper(page);

    // Use test data but generate a unique employeeId to avoid collisions
    const uniqueEmployeeId = `E${Date.now().toString().slice(-6)}`;
    const firstName = employeeData.firstName;
    const lastName = employeeData.lastName;
    const middleName = employeeData.middleName;

    logStep('Act I - Login to OrangeHRM');
    await page.goto('/');
    await loginHelper.login();

    logStep('Assert I - Verify dashboard URL after login');
    await expect(page).toHaveURL(/dashboard/);

    logStep('Act II - Create authenticated API context using browser cookies');
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const apiContext = await playwrightRequest.newContext({
      extraHTTPHeaders: { Cookie: cookieHeader, accept: 'application/json' }
    });

    logStep('Act III - Navigate to Add Employee and fill details');
    await pimPage.clickPIM();
    await pimPage.clickAddEmployee();

    await addEmployeePage.uploadProfilePicture();
    await addEmployeePage.enterFirstName(firstName);
    await addEmployeePage.enterMiddleName(middleName);
    await addEmployeePage.enterLastName(lastName);
    await addEmployeePage.enterEmployeeId(uniqueEmployeeId);

    logStep('Assert III - Verify employee form fields are populated');
    await expect(await employeeDetailsPage.getFirstName()).toBe(firstName);
    await expect(await employeeDetailsPage.getMiddleName()).toBe(middleName);
    await expect(await employeeDetailsPage.getLastName()).toBe(lastName);
    await expect(await employeeDetailsPage.getEmployeeId()).toBe(uniqueEmployeeId);

    logStep('Act IV - Check for existing employeeId through API before save');
    const employeesUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees';
    const preResp = await apiContext.get(employeesUrl);
    expect(preResp.status()).toBe(200);
    const preBody = await preResp.json();
    const existing = preBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
    if (existing) {
      const existingEmpNumber = existing.empNumber;
      // Delete by empNumber via API
      const delResp = await apiContext.delete(employeesUrl, { data: { ids: [existingEmpNumber] } });
      expect([200, 204].includes(delResp.status())).toBeTruthy();

      // verify deletion
      const verifyResp = await apiContext.get(employeesUrl);
      expect(verifyResp.status()).toBe(200);
      const verifyBody = await verifyResp.json();
      const stillExists = verifyBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
      expect(stillExists).toBeUndefined();
    }

    await addEmployeePage.clickSave();

    logStep('Assert IV - Verify save success toast after employee creation');
    await expect(addEmployeePage.successToastMessage.first()).toBeVisible();
    const toast = await addEmployeePage.getToastMessage();
    expect(toast).toContain('Success');

    logStep('Act V - Update job title and employment status for new employee');
    await employeeDetailsPage.clickJobTab();
    await employeeDetailsPage.clickJobTitleDropdown();
    await employeeDetailsPage.selectJobTitle(jobDetails.newEmployment.jobTitle);
    await employeeDetailsPage.clickEmploymentStatusDropdown();
    await employeeDetailsPage.selectEmploymentStatus(jobDetails.newEmployment.empStatus);
    await employeeDetailsPage.clickSave();

    logStep('Assert V - Confirm initial job details update');
    await expect(await employeeDetailsPage.getSelectedJobTitle()).toBe(jobDetails.newEmployment.jobTitle);
    await expect(await employeeDetailsPage.getSelectedEmploymentStatus()).toBe(jobDetails.newEmployment.empStatus);

    logStep('Act VI - Search and edit the newly created employee');
    await pimPage.clickPIM();
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await pimPage.clickEditEmployee(uniqueEmployeeId);

    logStep('Act VII - Modify job details for the employee');
    await employeeDetailsPage.clickJobTab();
    await employeeDetailsPage.clickJobTitleDropdown();
    await employeeDetailsPage.selectJobTitle(jobDetails.updatedEmployment.updatedJobTitle);
    await employeeDetailsPage.clickEmploymentStatusDropdown();
    await employeeDetailsPage.selectEmploymentStatus(jobDetails.updatedEmployment.updatedEmpStatus);
    await employeeDetailsPage.clickSave();

    logStep('Assert VII - Confirm updated job title and employment status');
    await expect(await employeeDetailsPage.getSelectedJobTitle()).toBe(jobDetails.updatedEmployment.updatedJobTitle);
    await expect(await employeeDetailsPage.getSelectedEmploymentStatus()).toBe(jobDetails.updatedEmployment.updatedEmpStatus);

    logStep('Act VIII - Validate employee details with API');
    const employeesResp = await apiContext.get('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees');
    expect(employeesResp.status()).toBe(200);
    const employeesBody = await employeesResp.json();

    const found = employeesBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
    expect(found).toBeDefined();
    expect(found.firstName).toBe(firstName);
    expect(found.lastName).toBe(lastName);
    expect(found.middleName).toBe(middleName);

    logStep('Assert VIII - Verify API response contains created employee values');

    const empNumber = found.empNumber;
    const jobResp = await apiContext.get(`https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees/${empNumber}/job-details`);
    expect(jobResp.status()).toBe(200);
    const jobBody = await jobResp.json();
    expect(jobBody.data.jobTitle.title).toBe(jobDetails.updatedEmployment.updatedJobTitle);
    expect(jobBody.data.empStatus.name).toBe(jobDetails.updatedEmployment.updatedEmpStatus);

    logStep('Assert VIII - Verify job details returned from API match UI edited values');

    // Delete via UI
    await pimPage.clickPIM();
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await pimPage.clickDeleteEmployee(uniqueEmployeeId);
    await pimPage.clickYesDelete();

    logStep('Act IX - Delete employee from UI');
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await expect(pimPage.noRecordsFoundMessage.nth(1)).toBeVisible();

    logStep('Assert IX - Confirm employee is removed from the UI search results');

    // Verify deletion via API
    const afterDeleteResp = await apiContext.get('https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees');
    expect(afterDeleteResp.status()).toBe(200);
    const afterBody = await afterDeleteResp.json();
    const deleted = afterBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
    expect(deleted).toBeUndefined();

    logStep('Assert IX - Confirm employee record is deleted in API');

    // Logout
    await loginPage.logout();
  });
});
