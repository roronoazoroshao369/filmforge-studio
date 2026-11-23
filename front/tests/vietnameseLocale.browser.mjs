import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-vietnamese-locale-')
const port = 4783
const origin = 'http://127.0.0.1:' + port
const userCanvasName = 'Bản thảo cá nhân · 青云传'
const server = await createServer({
  root, cacheDir: join(output, 'vite-cache'),
  // Browser QA uses a fixed source snapshot and does not need file-watch/HMR resources.
  server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } },
})
let browser, page
const cleanup = browserCleanup(() => ({ browser, server }))

function mockApi(target) {
  target.on('pageerror', error => { throw new Error('Browser page error: ' + error.message) })
  return target.route('**/api/**', route => {
    const { pathname } = new URL(route.request().url())
    const response = pathname.endsWith('/home/recent-canvases')
      ? [{ id: 'creator-1', kind: 'free', project_id: null, project_name: null,
        cover_file_id: null, name: userCanvasName, updated_at: '2026-11-23T08:00:00Z' }]
      : pathname.endsWith('/film/tasks') ? { items: [], next_cursor: null }
      : pathname.endsWith('/projects') ? { items: [], pagination: { total: 0 } }
      : []
    return route.fulfill({ json: { success: true, code: 200, data: response } })
  })
}

async function chooseLanguage(target, currentAccountName, label, expectedLang) {
  await target.getByRole('button', { name: currentAccountName, exact: true }).click()
  await target.getByRole('menuitem', { name: label, exact: true }).click()
  await target.locator('html[lang="' + expectedLang + '"]').waitFor()
}

try {
  await server.listen()
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL })
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1366, height: 768 } })
  page = await context.newPage()
  page.setDefaultTimeout(15000)
  page.setDefaultNavigationTimeout(60000)
  await page.addInitScript(() => { window.__ENV = { BACKEND_URL: location.origin } })
  await mockApi(page)
  await page.goto(origin, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: '工作概览' }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN')

  await chooseLanguage(page, '用户与语言设置', 'Tiếng Việt', 'vi-VN')
  await page.getByRole('heading', { name: 'Tổng quan công việc' }).waitFor()
  await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Dự án' }).waitFor()
  await page.getByText(userCanvasName, { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => localStorage.getItem('jellyfish_language')), 'vi-VN')

  await chooseLanguage(page, 'Tài khoản và ngôn ngữ', 'English', 'en-US')
  await page.getByRole('heading', { name: 'Work overview' }).waitFor()
  await chooseLanguage(page, 'User and language settings', 'Tiếng Việt', 'vi-VN')
  await page.getByRole('heading', { name: 'Tổng quan công việc' }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Tổng quan công việc' }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi-VN')
  assert.equal(await page.getByText(userCanvasName, { exact: true }).innerText(), userCanvasName)
  await page.screenshot({ path: join(output, 'home-vi-1366x768.png'), fullPage: true })

  await page.getByRole('button', { name: 'Trung tâm tác vụ' }).click()
  const drawer = page.getByRole('dialog', { name: 'Trung tâm tác vụ' })
  await drawer.getByRole('button', { name: 'Lịch sử', exact: true }).click()
  const history = page.getByRole('dialog', { name: 'Lịch sử tác vụ' })
  const range = history.locator('.ant-picker')
  await range.waitFor()
  const placeholder = await range.locator('input').first().getAttribute('placeholder')
  assert.match(placeholder ?? '', /ngày/i, 'Ant Design RangePicker must use Vietnamese locale')
  await history.getByRole('button', { name: /Close|Đóng|Hủy/ }).click()

  await page.goto(origin + '/settings')
  await page.getByRole('textbox', { name: 'Tên hiển thị' }).waitFor()
  await page.goto(origin + '/projects', { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Dự án', exact: true }).waitFor()
  await page.getByRole('textbox', { name: 'Tìm dự án' }).waitFor()
  await page.goto(origin + '/files', { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Quản lý tệp' }).waitFor()
  await page.getByRole('textbox', { name: 'Tìm tên tệp hoặc nhãn' }).waitFor()
  await page.getByRole('button', { name: 'Quản lý hàng loạt' }).click()
  await page.getByRole('button', { name: 'Gắn nhãn hàng loạt (chưa hỗ trợ)' }).waitFor()
  await page.goto(origin + '/no-such-vietnamese-page')
  await page.getByRole('button', { name: 'Về trang chủ' }).click()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('heading', { name: 'Tổng quan công việc' }).waitFor()
  await page.screenshot({ path: join(output, 'home-vi-390x844.png'), fullPage: true })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), '390px viewport must not overflow')
  const account = page.getByRole('button', { name: 'Tài khoản và ngôn ngữ' })
  await account.press('Enter')
  await page.getByRole('menuitem', { name: '简体中文', exact: true }).press('Enter')
  await page.getByRole('heading', { name: '工作概览' }).waitFor()
  await chooseLanguage(page, '用户与语言设置', 'Tiếng Việt', 'vi-VN')
  await page.getByRole('heading', { name: 'Tổng quan công việc' }).waitFor()
  await context.close()

  const invalid = await browser.newContext()
  await invalid.addInitScript(() => {
    window.__ENV = { BACKEND_URL: location.origin }
    localStorage.setItem('jellyfish_language', 'fr-FR')
  })
  const invalidPage = await invalid.newPage()
  await mockApi(invalidPage)
  await invalidPage.goto(origin)
  await invalidPage.getByRole('heading', { name: '工作概览' }).waitFor()
  assert.equal(await invalidPage.locator('html').getAttribute('lang'), 'zh-CN')
  await invalid.close()

  const denied = await browser.newContext()
  await denied.addInitScript(() => {
    window.__ENV = { BACKEND_URL: location.origin }
    Storage.prototype.getItem = () => { throw new Error('Storage blocked by policy') }
    Storage.prototype.setItem = () => { throw new Error('Storage blocked by policy') }
  })
  const deniedPage = await denied.newPage()
  await mockApi(deniedPage)
  await deniedPage.goto(origin)
  await deniedPage.getByRole('heading', { name: '工作概览' }).waitFor()
  await chooseLanguage(deniedPage, '用户与语言设置', 'Tiếng Việt', 'vi-VN')
  await deniedPage.getByRole('heading', { name: 'Tổng quan công việc' }).waitFor()
  await denied.close()

  console.log('Three languages, persistence, invalid/blocked storage, user content, Ant Design, keyboard and 1366/390 screenshots verified (mock API).')
} finally {
  await cleanup()
}
