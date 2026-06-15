import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { PIMPage } from '../Pages/PIMPage';
import { AddEmployeePage } from '../Pages/AddEmployeePage';
import { EmployeeDetailsPage } from '../Pages/EmployeeDetailsPage';
import { LoginHelper } from '../helper/loginHelper';
import employeeData from '../testData/employeeData.json';
import jobDetails from '../testData/jobDetails.json';
import { createAuthenticatedApiContext, deleteEmployeeIfExists, logStep } from './testUtils';

test.describe('Employee creation', () => {
  test('creates employee from test data and assigns initial job details', async ({ page }) => {
    test.setTimeout(120000);

    const pimPage = new PIMPage(page);
    const addEmployeePage = new AddEmployeePage(page);
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

    logStep('ACT III - Clean up any duplicate test employee before creation');
    await deleteEmployeeIfExists(apiContext, uniqueEmployeeId);

    logStep('ACT IV - Navigate to Add Employee and enter employee details');
    await pimPage.clickPIM();
    await pimPage.clickAddEmployee();

    await addEmployeePage.uploadProfilePicture();
    await addEmployeePage.enterFirstName(firstName);
    await addEmployeePage.enterMiddleName(middleName);
    await addEmployeePage.enterLastName(lastName);
    await addEmployeePage.enterEmployeeId(uniqueEmployeeId);

    logStep('ASSERT IV - Validate employee form data is correctly populated');
    await expect(await employeeDetailsPage.getFirstName()).toBe(firstName);
    await expect(await employeeDetailsPage.getMiddleName()).toBe(middleName);
    await expect(await employeeDetailsPage.getLastName()).toBe(lastName);
    await expect(await employeeDetailsPage.getEmployeeId()).toBe(uniqueEmployeeId);

    logStep('ACT V - Save newly created employee');
    await addEmployeePage.clickSave();

    logStep('ASSERT V - Verify employee creation success message');
    await expect(addEmployeePage.successToastMessage.first()).toBeVisible({ timeout: 10000 });
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
  });
});
