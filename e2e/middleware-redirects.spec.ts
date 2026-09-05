import { expect, test } from '@playwright/test';

// Ролевые редиректы SPONSOR/STUDENT (см. src/middleware.ts) требуют реальной
// сессии next-auth — на момент написания теста форма логина (Фаза 1.4) ещё
// не реализована, поэтому мокнуть сессию нечем. Покрываем только ветку,
// тестируемую без неё: неавторизованный доступ к защищённым путям.
const PROTECTED_PATHS = [ '/sponsor', '/student', '/settings' ];

for (const path of PROTECTED_PATHS) {
  test(`неавторизованный доступ к ${path} редиректит на /?login=true`, async ({ page }) => {
    await page.goto(path);

    const url = new URL(page.url());
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('login')).toBe('true');
  });
}
