import { Page, Locator } from '@playwright/test';

export class PIMPage {

    readonly pimMenu: Locator;
    readonly addEmployeeButton: Locator;
    readonly employeeIdInput: Locator;
    readonly searchButton: Locator;
    readonly yesDeleteButton: Locator;
    readonly noRecordsFoundMessage: Locator;

    constructor(private page: Page) {

        this.pimMenu = page.locator("//span[text()='PIM']");

        this.addEmployeeButton = page.getByRole('button', {
            name: '  Add  '
        });

        this.employeeIdInput = page.locator(
            "//label[text()='Employee Id']/../following-sibling::div//input"
        );

        this.searchButton = page.getByRole('button', {
            name: '  Search  '
        });

        this.yesDeleteButton = page.getByRole('button', {
            name: '  Yes, Delete  '
        });

        this.noRecordsFoundMessage = page.locator("//div[@class='oxd-toast-content oxd-toast-content--info']//p");
    }

    // Actions

    /**
     * Open the PIM section from the main menu.
     *
     * @returns Promise<void>
     * @example await pimPage.clickPIM();
     */
    async clickPIM() {
        await this.pimMenu.click();
    }

    /**
     * Click the Add Employee button to navigate to the employee creation form.
     *
     * @returns Promise<void>
     * @example await pimPage.clickAddEmployee();
     */
    async clickAddEmployee() {
        await this.addEmployeeButton.click();
    }

    /**
     * Enter an Employee ID into the PIM search field.
     *
     * @param employeeId string
     * @returns Promise<void>
     * @example await pimPage.searchEmployeeId('E12345');
     */
    async searchEmployeeId(employeeId: string) {
        await this.employeeIdInput.fill(employeeId);
    }

    /**
     * Click the Search button to look up employees by the entered criteria.
     *
     * @returns Promise<void>
     * @example await pimPage.clickSearch();
     */
    async clickSearch() {
        await this.searchButton.click();
    }

    /**
     * Confirm deletion by clicking the yes/delete confirmation button.
     *
     * @returns Promise<void>
     * @example await pimPage.clickYesDelete();
     */
    async clickYesDelete() {
        await this.yesDeleteButton.click();
    }

    /**
     * Click the edit icon for a specific employee row using the employeeId.
     *
     * @param employeeId string
     * @returns Promise<void>
     * @example await pimPage.clickEditEmployee('E12345');
     */
    async clickEditEmployee(employeeId: string) {
        await this.page.locator(
            `//div[text()='${employeeId}']/ancestor::div[contains(@class,'oxd-table-row')]//i[contains(@class,'bi-pencil-fill')]`
        ).click();
    }

    /**
     * Click the delete icon for a specific employee row using the employeeId.
     *
     * @param employeeId string
     * @returns Promise<void>
     * @example await pimPage.clickDeleteEmployee('E12345');
     */
    async clickDeleteEmployee(employeeId: string) {
        await this.page.locator(
            `//div[text()='${employeeId}']/ancestor::div[contains(@class,'oxd-table-row')]//i[contains(@class,'icon bi-trash')]`
        ).click();
    }
}