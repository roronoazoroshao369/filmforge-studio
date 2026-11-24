import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-chapter-consistency-locale-')
const port = 4785
const origin = 'http://127.0.0.1:' + port
const base = origin + '/projects/p1?tab=chapters'
const raw = '雨停了。她推门。'
const chapter = {
  id: 'ch1', project_id: 'p1', index: 1, title: '青云传 · Bản thảo',
  raw_text: raw, condensed_text: '', sequence_count: 0, status: 'draft', source_explanations: [],
}
const server = await createServer({
  root, cacheDir: join(output, 'vite-cache'),
  server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } },
})
let browser, page, task, reuseNext = false, queueNext = false
const errors = [], forbidden = [], unexpectedWrites = [], checks = [], cancellations = []
const cleanup = browserCleanup(() => ({ browser, server }))
const active = () => task && ['queued', 'running'].includes(task.status)
const labels = {
  zh: { account: '用户与语言设置', button: '原文一致性检查', source: '章节原文', started: '已开始一致性检查', running: '检查完成后会自动展示最新的一致性检查结果。', success: '一致性检查已完成，结果已自动更新。' },
  vi: { account: 'Tài khoản và ngôn ngữ', button: 'Source consistency check', source: 'Chapter source', started: 'Đã bắt đầu kiểm tra tính nhất quán', running: 'Kết quả kiểm tra tính nhất quán sẽ tự động hiển thị khi kiểm tra hoàn tất.', success: 'Đã kiểm tra tính nhất quán; kết quả được cập nhật.' },
  en: { account: 'User and language settings', button: 'Source consistency check', source: 'Chapter source', started: 'Consistency check started', running: 'Results will appear when the check finishes.', success: 'Consistency check complete. Results updated.' },
}
async function chooseLanguage(from, label, lang) {
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: from.account, exact: true }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()
  await page.locator('html[lang="' + lang + '"]').waitFor()
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
}
const editor = () => page.getByRole('dialog')
async function assertCheckingDisabled() {
  // The loading icon contributes to the accessible name; identify the actual button by its exact visible text.
  const button = editor().locator('button').filter({ hasText: /^Checking$/ })
  await button.waitFor({ state: 'visible' })
  assert.equal(await button.count(), 1)
  assert.equal(await button.isDisabled(), true)
  console.log('Active check button:', await button.ariaSnapshot())
}
const visible = text => page.getByText(text, { exact: true }).first().waitFor({ state: 'visible' })
async function verifySource(locale) {
  const field = editor().getByRole('textbox', { name: locale.source, exact: true })
  await field.waitFor()
  assert.equal(await field.inputValue(), raw)
  assert.equal(await editor().locator('.chapter-editor-name-row input').inputValue(), chapter.title)
}
async function start(locale, message = locale.started) {
  await verifySource(locale)
  await editor().getByRole('button', { name: locale.button, exact: true }).click()
  await visible(message)
  await visible(locale.running)
}
async function finish(locale) {
  task.status = 'succeeded'
  task.progress = 100
  await visible(locale.success)
  await verifySource(locale)
}
async function screenshot(name) {
  assert.equal(await editor().evaluate(element => element.scrollWidth <= element.clientWidth + 1), true)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
  await page.screenshot({ path: join(output, name), animations: 'disabled' })
}
try {
  await server.listen()
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL })
  page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.setDefaultTimeout(15000)
  await page.addInitScript(() => { window.__ENV = { BACKEND_URL: location.origin } })
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname
    if (url.origin !== origin) { forbidden.push(url.origin); return route.abort() }
    if (!path.includes('/api/')) return route.continue()
    const respond = data => route.fulfill({ json: { success: true, code: 200, data } })
    if (req.method() === 'POST' && path.endsWith('/script-processing/check-consistency-async')) {
      checks.push(req.postDataJSON())
      task = { task_id: 'check' + checks.length, status: queueNext ? 'queued' : 'running', progress: queueNext ? 0 : 30, cancel_requested: false }
      queueNext = false
      const reused = reuseNext
      reuseNext = false
      return respond({ ...task, reused })
    }
    if (req.method() === 'POST' && task && path.endsWith('/film/tasks/' + task.task_id + '/cancel')) {
      cancellations.push(task.task_id)
      const immediate = task.status === 'queued'
      task.cancel_requested = true
      if (immediate) task.status = 'cancelled'
      return respond({ ...task, effective_immediately: immediate })
    }
    if (req.method() !== 'GET') {
      unexpectedWrites.push(req.method() + ' ' + path)
      return route.fulfill({ status: 405, json: { detail: 'Unexpected fixture write' } })
    }
    if (task && path.endsWith('/film/tasks/' + task.task_id + '/status')) return respond(task)
    if (task && path.endsWith('/film/tasks/' + task.task_id + '/result')) {
      return respond({ ...task, result: { has_issues: false, issues: [], summary: '无混淆' } })
    }
    if (path.endsWith('/film/tasks') && url.searchParams.get('target_type') === 'consistency_check'
      && url.searchParams.get('target_id') === 'ch1') {
      const statuses = url.searchParams.getAll('statuses')
      return respond({ items: active() && statuses.includes(task.status) ? [task] : [], total: active() ? 1 : 0 })
    }
    const data = path.endsWith('/projects/p1') ? { id: 'p1', name: 'Synthetic chapter', stats: {} }
      : path.endsWith('/studio/chapters/ch1') ? chapter
      : path.endsWith('/chapters') ? { items: [chapter], pagination: { page: 1, page_size: 10, total: 1, max_page: 1 } }
      : { items: [], total: 0 }
    return respond(data)
  })
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
  await start(labels.zh)
  await finish(labels.zh)
  await chooseLanguage(labels.zh, 'Tiếng Việt', 'vi-VN')
  await start(labels.vi)
  await assertCheckingDisabled()
  assert.equal(checks.length, 2)
  await screenshot('consistency-vi-1366.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="vi-VN"]').waitFor()
  await visible(labels.vi.running)
  await verifySource(labels.vi)
  await editor().getByRole('button', { name: 'Cancel check', exact: true }).click()
  await visible('Đã yêu cầu hủy kiểm tra tính nhất quán')
  await visible('Đã gửi yêu cầu hủy. Hệ thống sẽ dừng sau bước hiện tại và đồng bộ kết quả mới nhất khi kết thúc.')
  await assertCheckingDisabled()
  assert.equal(await editor().getByRole('button', { name: 'Đang hủy', exact: true }).isDisabled(), true)
  assert.equal(checks.length, 2)
  await screenshot('consistency-vi-390.png')
  task.status = 'cancelled'
  await visible('Đã hủy kiểm tra tính nhất quán.')
  reuseNext = true
  await start(labels.vi, 'Đã khôi phục tác vụ kiểm tra tính nhất quán của chương hiện tại')
  await finish(labels.vi)
  await start(labels.vi)
  task.status = 'failed'
  await visible('Kiểm tra tính nhất quán thất bại. Vui lòng thử lại.')
  queueNext = true
  await start(labels.vi)
  await editor().getByRole('button', { name: 'Cancel check', exact: true }).click()
  await visible('Đã hủy kiểm tra tính nhất quán')
  await visible('Đã hủy kiểm tra tính nhất quán.')
  await verifySource(labels.vi)
  await editor().getByRole('button', { name: labels.vi.button, exact: true }).waitFor()
  assert.equal(await editor().getByRole('button', { name: labels.vi.button, exact: true }).isEnabled(), true)
  await chooseLanguage(labels.vi, 'English', 'en-US')
  await start(labels.en)
  await finish(labels.en)
  await chooseLanguage(labels.en, '简体中文', 'zh-CN')
  await verifySource(labels.zh)
  assert.equal(checks.length, 6)
  for (const check of checks) {
    assert.equal(check.script_text, raw)
    assert.equal(check.chapter_id, chapter.id)
    assert.deepEqual(check.source_explanations, [])
  }
  assert.deepEqual(cancellations, ['check2', 'check5'])
  assert.deepEqual(unexpectedWrites, [])
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Consistency task copy: zh/vi/en, active reload, start/reuse/deferred and immediate cancel/success/failure, duplicate submission controls, creator source, desktop/mobile, mock-only PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output)
  console.error(await page?.locator('body').innerText())
  throw error
} finally {
  await cleanup()
}
