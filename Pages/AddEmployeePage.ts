import { Page, Locator } from '@playwright/test';
import * as path from 'path';

export class AddEmployeePage {
    readonly profilePictureInput: Locator;
    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly employeeIdInput: Locator;
    readonly saveButton: Locator;
    readonly successToastMessage: Locator;
    readonly employeeExistsMessage: Locator;

    constructor(private page: Page) {
        this.profilePictureInput = page.locator('//input[@class="oxd-file-input"]');
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.middleNameInput = page.getByPlaceholder('Middle Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.employeeIdInput = page.locator(
            "//label[text()='Employee Id']/../following-sibling::div//input"
        );
        this.saveButton = page.getByRole('button', { name: ' Save ' });
        this.successToastMessage = page.locator(
            "//div[contains(@class,'oxd-toast-content') and contains(., 'Success')]");
        this.employeeExistsMessage = page.locator(
            '//span[text()="Employee Id already exists"]'
        );
    }

    /**
     * Upload the standard employee profile picture from the project Files folder.
     *
     * @returns Promise<void>
     * @example await addEmployeePage.uploadProfilePicture();
     */
    async uploadProfilePicture() {
        const filePath = path.resolve(__dirname, '../Files/Employee.jpg');
        await this.profilePictureInput.setInputFiles(filePath);
    }

    /**
     * Enter the employee first name in the Add Employee form.
     *
     * @param firstName string
     * @returns Promise<void>
     * @example await addEmployeePage.enterFirstName('John');
     */
    async enterFirstName(firstName: string) {
        await this.firstNameInput.fill(firstName);
    }

    /**
     * Enter the employee middle name in the Add Employee form.
     *
     * @param middleName string
     * @returns Promise<void>
     * @example await addEmployeePage.enterMiddleName('H');
     */
    async enterMiddleName(middleName: string) {
        await this.middleNameInput.fill(middleName);
    }

    /**
     * Enter the employee last name in the Add Employee form.
     *
     * @param lastName string
     * @returns Promise<void>
     * @example await addEmployeePage.enterLastName('Doe');
     */
    async enterLastName(lastName: string) {
        await this.lastNameInput.fill(lastName);
    }

    /**
     * Enter the employee id in the Add Employee form.
     *
     * @param employeeId string
     * @returns Promise<void>
     * @example await addEmployeePage.enterEmployeeId('E12345');
     */
    async enterEmployeeId(employeeId: string) {
        await this.employeeIdInput.fill(employeeId);
    }

    /**
     * Click the Save button to create or update the employee.
     *
     * @returns Promise<void>
     * @example await addEmployeePage.clickSave();
     */
    async clickSave() {
        await this.saveButton.click();
    }

    /**
     * Read the toast text shown after saving the employee.
     *
     * @returns Promise<string>
     * @example const toast = await addEmployeePage.getToastMessage();
     */
    async getToastMessage(): Promise<string> {
        const text = await this.successToastMessage.first().textContent();
        return text?.trim() || '';
    }
}