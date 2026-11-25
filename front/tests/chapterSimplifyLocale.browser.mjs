import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-chapter-simplify-locale-')
const port = 4786
const origin = 'http://127.0.0.1:' + port
const base = origin + '/projects/p1?tab=chapters'
const raw = '雨停了。她推门。'
const condensed = '她推门。'
const chapter = {
  id: 'ch1', project_id: 'p1', index: 1, title: '青云传 · Bản thảo',
  raw_text: raw, condensed_text: '', sequence_count: 0, status: 'draft', source_explanations: [],
}
const server = await createServer({
  root, cacheDir: join(output, 'vite-cache'),
  server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } },
})
let browser, page, task, reuseNext = false, resultMode = 'valid'
const errors = [], forbidden = [], unexpectedWrites = [], requests = [], cancellations = []
const cleanup = browserCleanup(() => ({ browser, server }))
const active = () => task && ['queued', 'running'].includes(task.status)
const labels = {
  zh: { account: '用户与语言设置', button: '智能精简', busy: '精简中', cancel: '取消精简', source: '章节原文', started: '已开始智能精简', running: '完成后可在「精简结果」中查看。', success: '智能精简已完成，可查看结果并手动采用。', ready: '智能精简完成', result: '精简结果', current: '当前原文', condensed: '精简内容', discard: '放弃精简结果' },
  vi: { account: 'Tài khoản và ngôn ngữ', button: 'Tinh giản kịch bản bằng AI', busy: 'Đang tinh giản', cancel: 'Hủy tinh giản', source: 'Nguyên văn chương', started: 'Đã bắt đầu tinh giản kịch bản', running: 'Khi tác vụ hoàn tất, có thể xem trong mục kết quả tinh giản.', success: 'Đã tinh giản kịch bản. Bạn có thể xem kết quả và chủ động áp dụng.', ready: 'Đã hoàn tất tinh giản kịch bản', result: 'Kết quả tinh giản', current: 'Nguyên văn hiện tại', condensed: 'Nội dung tinh giản', discard: 'Bỏ kết quả tinh giản' },
  en: { account: 'User and language settings', button: 'Condense with AI', busy: 'Condensing', cancel: 'Cancel condensation', source: 'Chapter source', started: 'Condensation started', running: 'Open the condensed text when the task finishes.', success: 'Condensed text is ready to review and apply.', ready: 'Condensed text ready', result: 'Condensation result', current: 'Current source', condensed: 'Condensed text', discard: 'Discard condensed text' },
}
const editor = () => page.getByRole('dialog').filter({ has: page.locator('.chapter-editor-name-row') })
const visible = text => page.getByText(text, { exact: true }).first().waitFor({ state: 'visible' })
async function chooseLanguage(from, label, lang) {
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: from.account, exact: true }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()
  await page.locator('html[lang="' + lang + '"]').waitFor()
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
}
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
  const busy = editor().locator('button').filter({ hasText: new RegExp('^' + locale.busy + '$') })
  await busy.waitFor()
  assert.equal(await busy.count(), 1)
  assert.equal(await busy.isDisabled(), true)
}
async function finish(locale, { resumed = false, retry = false } = {}) {
  task.status = 'succeeded'
  task.progress = 100
  await visible(locale.success)
  await visible(locale.ready)
  await verifySource(locale)
  await editor().getByRole('button', { name: locale.result, exact: true }).click()
  const result = page.getByRole('dialog', { name: locale.result, exact: true })
  assert.equal(await result.getByRole('textbox', { name: locale.current, exact: true }).inputValue(), raw)
  assert.equal(await result.getByRole('textbox', { name: locale.condensed, exact: true }).inputValue(), condensed)
  if (resumed) {
    await result.getByText('Không thể xác minh nguyên văn mà tác vụ đã sử dụng. Hãy đối chiếu với nguyên văn hiện tại trước khi áp dụng.', { exact: true }).waitFor()
    await result.getByRole('button', { name: 'Thay nguyên văn bằng bản tinh giản', exact: true }).click()
    await visible('Thay nguyên văn hiện tại bằng bản tinh giản?')
    await page.getByRole('button', { name: 'Hủy', exact: true }).last().click()
    assert.equal(await result.getByRole('textbox', { name: locale.current, exact: true }).inputValue(), raw)
    assert.equal(await result.evaluate(element => element.scrollWidth <= element.clientWidth + 1), true)
    await screenshot('simplify-resumed-vi-390.png')
  }
  if (retry) {
    const beforeRetry = requests.length
    const draft = result.getByRole('textbox', { name: locale.condensed, exact: true })
    const retryButton = result.getByRole('button', { name: 'Tinh giản lại', exact: true })
    await retryButton.click()
    await visible('Tinh giản lại sẽ thay thế nội dung tinh giản bên phải')
    await page.getByRole('button', { name: 'Hủy', exact: true }).last().click()
    assert.equal(requests.length, beforeRetry)
    assert.equal(await draft.inputValue(), condensed)
    assert.equal(await result.getByRole('textbox', { name: locale.current, exact: true }).inputValue(), raw)
    await retryButton.click()
    await visible('Tinh giản lại sẽ thay thế nội dung tinh giản bên phải')
    await page.getByRole('button', { name: 'Tinh giản lại', exact: true }).last().click()
    await result.getByRole('button', { name: locale.cancel, exact: true }).waitFor()
    assert.equal(requests.length, beforeRetry + 1)
    assert.equal(await result.getByRole('button', { name: locale.discard, exact: true }).isDisabled(), true)
    await screenshot('simplify-retry-vi-390.png')
    task.status = 'succeeded'
    task.progress = 100
    await retryButton.waitFor()
    await visible(locale.ready)
    assert.equal(await draft.inputValue(), condensed)
    assert.equal(await result.getByRole('textbox', { name: locale.current, exact: true }).inputValue(), raw)
  }
  await result.getByRole('button', { name: locale.discard, exact: true }).click()
  await result.waitFor({ state: 'hidden' })
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
    if (req.method() === 'POST' && path.endsWith('/script-processing/simplify-script-async')) {
      requests.push(req.postDataJSON())
      task = { task_id: 'simplify' + requests.length, status: 'running', progress: 30, cancel_requested: false }
      const reused = reuseNext
      reuseNext = false
      return respond({ ...task, reused })
    }
    if (req.method() === 'POST' && task && path.endsWith('/film/tasks/' + task.task_id + '/cancel')) {
      cancellations.push(task.task_id)
      task.cancel_requested = true
      return respond({ ...task, effective_immediately: false })
    }
    if (req.method() !== 'GET') {
      unexpectedWrites.push(req.method() + ' ' + path)
      return route.fulfill({ status: 405, json: { detail: 'Unexpected fixture write' } })
    }
    if (task && path.endsWith('/film/tasks/' + task.task_id + '/status')) return respond(task)
    if (task && path.endsWith('/film/tasks/' + task.task_id + '/result')) {
      if (resultMode === 'read-error') return route.fulfill({ status: 500, json: { detail: 'Synthetic result read error' } })
      return respond({ ...task, result: { simplified_script_text: resultMode === 'empty' ? '   ' : condensed } })
    }
    if (path.endsWith('/film/tasks') && url.searchParams.get('target_type') === 'script_simplification'
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
  await screenshot('simplify-vi-1366.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="vi-VN"]').waitFor()
  await visible(labels.vi.running)
  await verifySource(labels.vi)
  await editor().getByRole('button', { name: labels.vi.cancel, exact: true }).click()
  await visible('Đã yêu cầu hủy tinh giản kịch bản')
  await visible('Đã gửi yêu cầu hủy. Tác vụ sẽ dừng sau bước hiện tại.')
  assert.equal(await editor().getByRole('button', { name: 'Đang hủy', exact: true }).isDisabled(), true)
  assert.equal(requests.length, 2)
  await screenshot('simplify-vi-390.png')
  task.status = 'cancelled'
  await visible('Đã hủy tác vụ tinh giản kịch bản.')
  reuseNext = true
  await start(labels.vi, 'Đã khôi phục tác vụ tinh giản kịch bản của chương hiện tại')
  await finish(labels.vi, { resumed: true, retry: true })
  // Dismiss completed task notifications through their actual UI controls.
  const completedNotices = page.locator('.ant-notification-notice').filter({
    hasText: 'Tinh giản kịch bản bằng AI đã hoàn thành',
  })
  while (await completedNotices.count()) {
    const notice = completedNotices.last()
    await notice.locator('.ant-notification-notice-close').click()
    await notice.waitFor({ state: 'hidden' })
  }
  await start(labels.vi)
  task.status = 'failed'
  await visible('Tinh giản kịch bản thất bại. Vui lòng thử lại sau.')
  await verifySource(labels.vi)
  for (const [mode, notice] of [
    ['empty', 'Tinh giản kịch bản thất bại: không có nội dung hợp lệ'],
    ['read-error', 'Không thể đọc kết quả tinh giản kịch bản'],
  ]) {
    await start(labels.vi)
    resultMode = mode
    task.status = 'succeeded'
    task.progress = 100
    await visible(notice)
    await verifySource(labels.vi)
    const trigger = editor().getByRole('button', { name: labels.vi.button, exact: true })
    await trigger.waitFor()
    assert.equal(await trigger.isEnabled(), true)
    assert.equal(await editor().getByRole('button', { name: labels.vi.result, exact: true }).count(), 0)
    await screenshot('simplify-' + mode + '-vi-390.png')
    resultMode = 'valid'
  }
  await page.setViewportSize({ width: 1366, height: 768 })
  await start(labels.vi)
  const changed = raw + ' 新段落。'
  const source = editor().getByRole('textbox', { name: labels.vi.source, exact: true })
  await source.fill(changed)
  task.status = 'succeeded'
  task.progress = 100
  await visible(labels.vi.success)
  await visible(labels.vi.ready)
  await editor().getByRole('button', { name: labels.vi.result, exact: true }).click()
  const stale = page.getByRole('dialog', { name: labels.vi.result, exact: true })
  await stale.getByText('Nguyên văn đã thay đổi sau khi tinh giản. Bạn có thể tinh giản lại.', { exact: true }).waitFor()
  assert.equal(await stale.getByRole('textbox', { name: labels.vi.current, exact: true }).inputValue(), changed)
  assert.equal(await stale.getByRole('textbox', { name: labels.vi.condensed, exact: true }).inputValue(), condensed)
  await stale.getByRole('button', { name: 'Thay nguyên văn bằng bản tinh giản', exact: true }).click()
  await visible('Thay nguyên văn hiện tại bằng bản tinh giản?')
  assert.equal(await stale.getByRole('textbox', { name: labels.vi.current, exact: true }).inputValue(), changed)
  await page.getByRole('button', { name: 'Hủy', exact: true }).last().click()
  assert.equal(await stale.getByRole('textbox', { name: labels.vi.current, exact: true }).inputValue(), changed)
  assert.equal(await stale.evaluate(element => element.scrollWidth <= element.clientWidth + 1), true)
  await screenshot('simplify-stale-vi-1366.png')
  await stale.getByRole('button', { name: 'Thay nguyên văn bằng bản tinh giản', exact: true }).click()
  await page.getByRole('button', { name: 'Xác nhận thay thế', exact: true }).click()
  await stale.waitFor({ state: 'hidden' })
  assert.equal(await source.inputValue(), condensed)
  assert.equal(await editor().locator('.chapter-editor-name-row input').inputValue(), chapter.title)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await verifySource(labels.vi)
  await chooseLanguage(labels.vi, 'English', 'en-US')
  await start(labels.en)
  await finish(labels.en)
  await chooseLanguage(labels.en, '简体中文', 'zh-CN')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="zh-CN"]').waitFor()
  await verifySource(labels.zh)
  assert.equal(requests.length, 9)
  for (const request of requests) {
    assert.equal(request.script_text, raw)
    assert.equal(request.chapter_id, chapter.id)
  }
  assert.deepEqual(cancellations, ['simplify2'])
  assert.deepEqual(unexpectedWrites, [])
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Simplification task copy: zh/vi/en, active reload, start/reuse/cancel/success/failure, result discard, confirmed retry, resumed and stale-source explicit replacement safeguards, empty/read-error guards, desktop/mobile, mock-only PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output)
  console.error(await page?.locator('body').innerText())
  throw error
} finally {
  await cleanup()
}
