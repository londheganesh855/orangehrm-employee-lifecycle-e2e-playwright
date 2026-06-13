import { Page } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';

export class LoginHelper {

    private loginPage: LoginPage;

    constructor(private page: Page) {
        this.loginPage = new LoginPage(page);
    }

    async login() {
        const username = process.env.LoginUsername;
        const password = process.env.LoginPassword;

        if (!username || !password) {
            throw new Error('USERNAME or PASSWORD is missing in .env.playwright file');
        }

        await this.loginPage.enterUsername(username);
        await this.loginPage.enterPassword(password);

        await this.loginPage.clickLogin();
    }
}