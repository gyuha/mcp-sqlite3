import { test, expect } from '@playwright/test';

test('홈페이지 로드', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  // 페이지 제목 확인
  const title = await page.textContent('h1');
  expect(title).toContain('Sakila');
  
  // 네비게이션 링크 확인
  const navigationLinks = await page.$$('nav a');
  expect(navigationLinks.length).toBeGreaterThan(0);
});

test('영화 목록 페이지 로드', async ({ page }) => {
  await page.goto('http://localhost:3001/films');
  
  // 페이지 제목 확인
  const title = await page.textContent('h1');
  expect(title).toContain('영화');
  
  // 영화 목록 페이지가 로드되었는지 확인
  const pageContent = await page.textContent('body');
  expect(pageContent).toContain('영화');
});

test('고객 목록 페이지 로드', async ({ page }) => {
  await page.goto('http://localhost:3001/customers');
  
  // 페이지 제목 확인
  const title = await page.textContent('h1');
  expect(title).toContain('고객');
  
  // 고객 관리 페이지가 로드되었는지 확인
  const pageContent = await page.textContent('body');
  expect(pageContent).toContain('고객');
});

test('대시보드 페이지 로드', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard');
  
  // 대시보드 요소가 표시되는지 확인
  const dashboard = await page.$('.dashboard');
  expect(dashboard).toBeTruthy();
});
