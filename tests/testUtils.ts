import { APIRequestContext, Page, request as playwrightRequest } from '@playwright/test';

export const EMPLOYEES_API = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees';

export const logStep = (message: string) => console.log(`STEP: ${message}`);

export async function createAuthenticatedApiContext(page: Page): Promise<APIRequestContext> {
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  return await playwrightRequest.newContext({
    extraHTTPHeaders: { Cookie: cookieHeader, accept: 'application/json' }
  });
}

export async function deleteEmployeeIfExists(apiContext: APIRequestContext, employeeId: string): Promise<void> {
  const response = await apiContext.get(EMPLOYEES_API);
  if (response.status() !== 200) return;

  const body = await response.json();
  const existing = body.data?.find((e: any) => e.employeeId === employeeId);
  if (!existing) return;

  await apiContext.delete(EMPLOYEES_API, { data: { ids: [existing.empNumber] } });
}
