import { expect, test } from '@playwright/test';

test('главная страница рендерится с Header и заголовком', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('header')).toBeVisible();
  // Header рендерит desktop- и mobile-версии логотипа одновременно (видимость
  // переключает CSS-медиазапрос) — :visible сужает локатор до фактически видимой.
  await expect(page.locator('header a[href="/"]:visible')).toBeVisible(); // логотип — ссылка на главную
  await expect(page.getByRole('heading', { name: 'Hello, Next.js!' })).toBeVisible();
});
