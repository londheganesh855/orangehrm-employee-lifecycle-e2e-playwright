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

    const uniqueEmployeeId = `E${Date.now().toString().slice(-6)}`;
    const firstName = employeeData.firstName;
    const lastName = employeeData.lastName;
    const middleName = employeeData.middleName;

    logStep('ACT I - Open application and perform login');
    await page.goto('/');
    await loginHelper.login();

    logStep('ASSERT I - Verify successful login (Dashboard URL validation)');
    await expect(page).toHaveURL(/dashboard/);

    logStep('ACT II - Initialize authenticated API context using session cookies');
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const apiContext = await playwrightRequest.newContext({
      extraHTTPHeaders: { Cookie: cookieHeader, accept: 'application/json' }
    });

    logStep('ASSERT II - Verify API context is successfully created');
    expect(apiContext).toBeDefined();

    logStep('ACT III - Navigate to Add Employee and enter employee details');
    await pimPage.clickPIM();
    await pimPage.clickAddEmployee();

    await addEmployeePage.uploadProfilePicture();
    await addEmployeePage.enterFirstName(firstName);
    await addEmployeePage.enterMiddleName(middleName);
    await addEmployeePage.enterLastName(lastName);
    await addEmployeePage.enterEmployeeId(uniqueEmployeeId);

    logStep('ASSERT III - Validate employee form data is correctly populated');
    await expect(await employeeDetailsPage.getFirstName()).toBe(firstName);
    await expect(await employeeDetailsPage.getMiddleName()).toBe(middleName);
    await expect(await employeeDetailsPage.getLastName()).toBe(lastName);
    await expect(await employeeDetailsPage.getEmployeeId()).toBe(uniqueEmployeeId);

    logStep('ACT IV - Check and handle duplicate employee via API before creation');
    const employeesUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees';
    const preResp = await apiContext.get(employeesUrl);
    expect(preResp.status()).toBe(200);
    const preBody = await preResp.json();
    const existing = preBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);

    if (existing) {
      const existingEmpNumber = existing.empNumber;

      logStep('ACT IV - Delete existing duplicate employee via API');
      const delResp = await apiContext.delete(employeesUrl, { data: { ids: [existingEmpNumber] } });
      expect([200, 204].includes(delResp.status())).toBeTruthy();

      logStep('ASSERT IV - Verify duplicate employee removal via API');
      const verifyResp = await apiContext.get(employeesUrl);
      expect(verifyResp.status()).toBe(200);
      const verifyBody = await verifyResp.json();
      const stillExists = verifyBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
      expect(stillExists).toBeUndefined();
    }

    logStep('ACT V - Save newly created employee');
    await addEmployeePage.clickSave();

    logStep('ASSERT V - Verify employee creation success message');
    await expect(addEmployeePage.successToastMessage.first()).toBeVisible();
    const toast = await addEmployeePage.getToastMessage();
    expect(toast).toContain('Success');

    logStep('ACT VI - Assign initial job details to employee');
    await employeeDetailsPage.clickJobTab();
    await employeeDetailsPage.clickJobTitleDropdown();
    await employeeDetailsPage.selectJobTitle(jobDetails.newEmployment.jobTitle);
    await employeeDetailsPage.clickEmploymentStatusDropdown();
    await employeeDetailsPage.selectEmploymentStatus(jobDetails.newEmployment.empStatus);
    await employeeDetailsPage.clickSave();

    logStep('ASSERT VI - Validate initial job details saved successfully');
    await expect(await employeeDetailsPage.getSelectedJobTitle()).toBe(jobDetails.newEmployment.jobTitle);
    await expect(await employeeDetailsPage.getSelectedEmploymentStatus()).toBe(jobDetails.newEmployment.empStatus);

    logStep('ACT VII - Search and open employee record for update');
    await pimPage.clickPIM();
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await pimPage.clickEditEmployee(uniqueEmployeeId);

    logStep('ACT VIII - Update employee job details');
    await employeeDetailsPage.clickJobTab();
    await employeeDetailsPage.clickJobTitleDropdown();
    await employeeDetailsPage.selectJobTitle(jobDetails.updatedEmployment.updatedJobTitle);
    await employeeDetailsPage.clickEmploymentStatusDropdown();
    await employeeDetailsPage.selectEmploymentStatus(jobDetails.updatedEmployment.updatedEmpStatus);
    await employeeDetailsPage.clickSave();

    logStep('ASSERT VIII - Verify updated job details in UI');
    await expect(await employeeDetailsPage.getSelectedJobTitle()).toBe(jobDetails.updatedEmployment.updatedJobTitle);
    await expect(await employeeDetailsPage.getSelectedEmploymentStatus()).toBe(jobDetails.updatedEmployment.updatedEmpStatus);

    logStep('ACT IX - Validate employee data using API');
    const employeesResp = await apiContext.get(employeesUrl);
    expect(employeesResp.status()).toBe(200);
    const employeesBody = await employeesResp.json();

    const found = employeesBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);
    expect(found).toBeDefined();

    const empNumber = found.empNumber;
    const jobResp = await apiContext.get(
      `https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees/${empNumber}/job-details`
    );
    expect(jobResp.status()).toBe(200);
    const jobBody = await jobResp.json();

    logStep('ASSERT IX - Verify API data matches UI updated values');
    expect(found.firstName).toBe(firstName);
    expect(found.lastName).toBe(lastName);
    expect(found.middleName).toBe(middleName);
    expect(jobBody.data.jobTitle.title).toBe(jobDetails.updatedEmployment.updatedJobTitle);
    expect(jobBody.data.empStatus.name).toBe(jobDetails.updatedEmployment.updatedEmpStatus);

    logStep('ACT X - Delete employee via UI');
    await pimPage.clickPIM();
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await pimPage.clickDeleteEmployee(uniqueEmployeeId);
    await pimPage.clickYesDelete();

    logStep('ASSERT X - Verify employee removal from UI results');
    await pimPage.searchEmployeeId(uniqueEmployeeId);
    await pimPage.clickSearch();
    await expect(pimPage.noRecordsFoundMessage.nth(1)).toBeVisible();

    logStep('ACT XI - Validate deletion via API');
    const afterDeleteResp = await apiContext.get(employeesUrl);
    expect(afterDeleteResp.status()).toBe(200);
    const afterBody = await afterDeleteResp.json();
    const deleted = afterBody.data.find((e: any) => e.employeeId === uniqueEmployeeId);

    logStep('ASSERT XI - Confirm employee deletion in API');
    expect(deleted).toBeUndefined();

    logStep('ACT XII - Logout from application');
    await loginPage.logout();

    logStep('ASSERT XII - Verify successful logout');
    await expect(page).toHaveURL(/login/);
  });
});