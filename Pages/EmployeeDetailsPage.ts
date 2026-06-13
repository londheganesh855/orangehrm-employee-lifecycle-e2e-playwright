import { Page, Locator } from '@playwright/test';

export class EmployeeDetailsPage {

    readonly jobTab: Locator;
    readonly jobTitleDropdown: Locator;
    readonly employmentStatusDropdown: Locator;
    readonly saveButton: Locator;

    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly employeeIdInput: Locator;

    readonly selectedJobTitle: Locator;
    readonly selectedEmploymentStatus: Locator;

    constructor(private page: Page) {

        this.jobTab = page.getByText('Job');

        this.jobTitleDropdown = page.locator(
            "//label[text()='Job Title']/../following-sibling::div"
        );

        this.employmentStatusDropdown = page.locator(
            "//label[text()='Employment Status']/../following-sibling::div"
        );

        this.saveButton = page.getByRole('button', { name: ' Save ' });

        this.firstNameInput = page.getByPlaceholder('First Name');
        this.middleNameInput = page.getByPlaceholder('Middle Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.employeeIdInput = page.locator(
            "//label[text()='Employee Id']/../following-sibling::div//input"
        );

        // For validation (selected values)
        this.selectedJobTitle = page.locator(
            "//label[text()='Job Title']/../following-sibling::div//div[contains(@class,'oxd-select-text-input')]"
        );

        this.selectedEmploymentStatus = page.locator(
            "//label[text()='Employment Status']/../following-sibling::div//div[contains(@class,'oxd-select-text-input')]"
        );
    }

    // =========================
    // ACTIONS
    // =========================

    /**
     * Select the Job tab inside the employee details page.
     *
     * @returns Promise<void>
     * @example await employeeDetailsPage.clickJobTab();
     */
    async clickJobTab() {
        await this.jobTab.click();
    }

    /**
     * Open the Job Title dropdown for editing.
     *
     * @returns Promise<void>
     * @example await employeeDetailsPage.clickJobTitleDropdown();
     */
    async clickJobTitleDropdown() {
        await this.jobTitleDropdown.click();
    }

    /**
     * Choose a job title from the dropdown options.
     *
     * @param jobTitle string
     * @returns Promise<void>
     * @example await employeeDetailsPage.selectJobTitle('Account Assistant');
     */
    async selectJobTitle(jobTitle: string) {
        await this.page.getByRole('option', { name: jobTitle }).click();
    }

    /**
     * Open the Employment Status dropdown for editing.
     *
     * @returns Promise<void>
     * @example await employeeDetailsPage.clickEmploymentStatusDropdown();
     */
    async clickEmploymentStatusDropdown() {
        await this.employmentStatusDropdown.click();
    }

    /**
     * Choose an employment status from the dropdown options.
     *
     * @param status string
     * @returns Promise<void>
     * @example await employeeDetailsPage.selectEmploymentStatus('Freelance');
     */
    async selectEmploymentStatus(status: string) {
        await this.page.getByRole('option', { name: status }).click();
    }

    /**
     * Click the Save button to persist job detail changes.
     *
     * @returns Promise<void>
     * @example await employeeDetailsPage.clickSave();
     */
    async clickSave() {
        await this.saveButton.click();
    }

    // =========================
    // GETTERS (for validation)
    // =========================

    /**
     * Read the currently selected Job Title value.
     *
     * @returns Promise<string>
     * @example const jobTitle = await employeeDetailsPage.getSelectedJobTitle();
     */
    async getSelectedJobTitle(): Promise<string> {
        return (await this.selectedJobTitle.textContent())?.trim() || '';
    }

    /**
     * Read the currently selected Employment Status value.
     *
     * @returns Promise<string>
     * @example const status = await employeeDetailsPage.getSelectedEmploymentStatus();
     */
    async getSelectedEmploymentStatus(): Promise<string> {
        return (await this.selectedEmploymentStatus.textContent())?.trim() || '';
    }

    /**
     * Read the current first name from the employee details form.
     *
     * @returns Promise<string>
     * @example const firstName = await employeeDetailsPage.getFirstName();
     */
    async getFirstName(): Promise<string> {
        return (await this.firstNameInput.inputValue()).trim();
    }

    /**
     * Read the current middle name from the employee details form.
     *
     * @returns Promise<string>
     * @example const middleName = await employeeDetailsPage.getMiddleName();
     */
    async getMiddleName(): Promise<string> {
        return (await this.middleNameInput.inputValue()).trim();
    }

    /**
     * Read the current last name from the employee details form.
     *
     * @returns Promise<string>
     * @example const lastName = await employeeDetailsPage.getLastName();
     */
    async getLastName(): Promise<string> {
        return (await this.lastNameInput.inputValue()).trim();
    }

    /**
     * Read the current Employee ID from the employee details form.
     *
     * @returns Promise<string>
     * @example const employeeId = await employeeDetailsPage.getEmployeeId();
     */
    async getEmployeeId(): Promise<string> {
        return (await this.employeeIdInput.inputValue()).trim();
    }
}
