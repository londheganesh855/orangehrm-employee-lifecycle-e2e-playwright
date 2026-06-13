import { Page, Locator } from '@playwright/test';

export class LoginPage {

    // Locators (readonly)
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    readonly userDropdown: Locator;
    readonly logoutLink: Locator;

    constructor(private page: Page) {

        this.usernameInput = page.getByPlaceholder('Username');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });

        this.userDropdown = page.locator("//p[@class='oxd-userdropdown-name']");
        this.logoutLink = page.locator("//a[text()='Logout']");
    }

    // Actions - Login
    /**
     * Navigate to the OrangeHRM login page.
     *
     * @returns Promise<void>
     * @example await loginPage.navigate();
     */
    async navigate() {
        await this.page.goto('/');
    }

    /**
     * Enter the username into the login form.
     *
     * @param username string
     * @returns Promise<void>
     * @example await loginPage.enterUsername('Admin');
     */
    async enterUsername(username: string) {
        await this.usernameInput.fill(username);
    }

    /**
     * Enter the password into the login form.
     *
     * @param password string
     * @returns Promise<void>
     * @example await loginPage.enterPassword('admin123');
     */
    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    /**
     * Click the login button to submit credentials.
     *
     * @returns Promise<void>
     * @example await loginPage.clickLogin();
     */
    async clickLogin() {
        await this.loginButton.click();
    }

    // Actions - Logout
    /**
     * Log the user out of OrangeHRM by opening the user dropdown and clicking logout.
     *
     * @returns Promise<void>
     * @example await loginPage.logout();
     */
    async logout() {
        await this.userDropdown.click();
        await this.logoutLink.click();
    }
}