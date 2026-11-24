import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-chapter-explanations-locale-')
const port = 4784
const origin = 'http://127.0.0.1:' + port
const base = origin + '/projects/p1?tab=chapters'
const raw = '雨停了。\n她推门。\n她推门。'
const version = createHash('sha256').update(raw).digest('hex')
const chapter = {
  id: 'ch1', project_id: 'p1', index: 1, title: '青云传 · Bản thảo',
  raw_text: raw, condensed_text: '', sequence_count: 0, status: 'draft',
  source_explanations: [
    { id: 'note1', kind: 'explanation', excerpt: '雨停了。', text: '这里是时间转折。', source_version: 'previous' },
    { id: 'note2', kind: 'explanation', excerpt: '', text: '全章说明。', source_version: version, policy_version: 2 },
    { id: 'note3', kind: 'explanation', excerpt: '', text: '待复核说明。', source_version: version, policy_version: 1 },
    { id: 'note4', kind: 'explanation', excerpt: '不存在的片段', text: '定位说明。', source_version: 'previous' },
  ],
}
const server = await createServer({
  root, cacheDir: join(output, 'vite-cache'),
  server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } },
})
let browser, page
const cleanup = browserCleanup(() => ({ browser, server }))
const errors = [], writes = [], forbidden = []
async function chooseLanguage(account, label, lang) {
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: account, exact: true }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()
  await page.locator('html[lang="' + lang + '"]').waitFor()
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
}
try {
  await server.listen()
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL })
  page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.setDefaultTimeout(15000)
  await page.addInitScript(() => { window.__ENV = { BACKEND_URL: location.origin } })
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.origin !== origin) {
      forbidden.push(url.origin); return route.abort()
    }
    if (!url.pathname.includes('/api/')) return route.continue()
    if (req.method() !== 'GET') {
      writes.push(req.method() + ' ' + url.pathname)
      return route.fulfill({ status: 405, json: { detail: 'Read-only fixture' } })
    }
    const path = url.pathname
    const data = path.endsWith('/projects/p1') ? { id: 'p1', name: 'Synthetic chapter', stats: {} }
      : path.endsWith('/studio/chapters/ch1') ? chapter
      : path.endsWith('/chapters') ? { items: [chapter], pagination: { page: 1, page_size: 10, total: 1, max_page: 1 } }
      : { items: [], total: 0 }
    return route.fulfill({ json: { success: true, code: 200, data } })
  })
  const panel = page.locator('.chapter-editor-explanations')
  const row = panel.getByRole('button', { name: /这里是时间转折/ })
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
  await panel.getByRole('heading', { name: '原文补充解释（4）', exact: true }).waitFor()
  await chooseLanguage('用户与语言设置', 'Tiếng Việt', 'vi-VN')
  await panel.getByRole('heading', { name: 'Giải thích bổ sung nguyên văn (4)', exact: true }).waitFor()
  await row.getByText('Dòng 1', { exact: true }).waitFor()
  await row.getByText('Chờ kiểm tra lại', { exact: true }).waitFor()
  const confirmed = panel.getByRole('button', { name: /全章说明。/ })
  await confirmed.getByText('Toàn chương', { exact: true }).waitFor()
  await confirmed.getByText('Đã xác nhận', { exact: true }).waitFor()
  await panel.getByRole('button', { name: /待复核说明。/ }).getByText('Cần rà soát cách diễn đạt và phạm vi', { exact: true }).waitFor()
  await panel.getByRole('button', { name: /定位说明。/ }).getByText('Chờ xác định vị trí', { exact: true }).waitFor()
  await row.click()
  await panel.getByText('Đoạn trích lúc lưu', { exact: true }).waitFor()
  await panel.getByText('雨停了。', { exact: true }).first().waitFor()
  await panel.getByRole('button', { name: 'Sửa giải thích 1', exact: true }).click()
  assert.equal(await panel.getByRole('textbox', { name: 'Nội dung giải thích 1', exact: true }).inputValue(), '这里是时间转折。')
  await page.screenshot({ path: join(output, 'source-explanations-vi-1366.png'), animations: 'disabled' })
  await chooseLanguage('Tài khoản và ngôn ngữ', 'English', 'en-US')
  await panel.getByRole('heading', { name: 'Source explanations (4)', exact: true }).waitFor()
  await chooseLanguage('User and language settings', 'Tiếng Việt', 'vi-VN')
  await panel.getByRole('heading', { name: 'Giải thích bổ sung nguyên văn (4)', exact: true }).waitFor()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await panel.getByRole('heading', { name: 'Giải thích bổ sung nguyên văn (4)', exact: true }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi-VN')
  await page.setViewportSize({ width: 390, height: 844 })
  // The outer drawer's tab label is outside this component slice.
  await page.locator('.chapter-editor-drawer').getByRole('button', { name: 'Explanations (4)', exact: true }).click()
  await panel.getByRole('heading', { name: 'Giải thích bổ sung nguyên văn (4)', exact: true }).waitFor()
  await row.getByText('Dòng 1', { exact: true }).waitFor()
  assert.equal(await page.getByRole('dialog', { name: /Edit chapter/ }).evaluate(element => element.scrollWidth <= element.clientWidth + 1), true)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
  await page.screenshot({ path: join(output, 'source-explanations-vi-390.png'), animations: 'disabled' })
  assert.deepEqual(writes, [])
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Source explanations locale: zh/vi/en, dynamic states, reload, creator text, desktop/mobile, read-only mock API PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output)
  console.error(await page?.locator('body').innerText())
  throw error
} finally {
  await cleanup()
}
