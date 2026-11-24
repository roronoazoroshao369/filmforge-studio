import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-chapter-optimize-locale-')
const port = 4787
const origin = 'http://127.0.0.1:' + port
const base = origin + '/projects/p1?tab=chapters'
const raw = '雨停了。她推门？'
const optimized = ' 雨停了。她推门。\n'
const chapter = {
  id: 'ch1', project_id: 'p1', index: 1, title: '青云传 · Bản thảo',
  raw_text: raw, condensed_text: '', sequence_count: 0, status: 'draft', source_explanations: [],
}
const hash = value => createHash('sha256').update(value).digest('hex')
const checkResult = {
  policy_version: 2, review_version: hash('[]'), explanation_version: hash('[]'),
  source_version: hash(raw), check_scope: 'source_consistency', has_issues: true,
  issues: [{ issue_type: 'fact', classification: 'contradiction', excerpt: raw, description: '需要核对', suggestion: '修复标点' }],
}
const repairResult = { optimized_script_text: optimized, source_text: raw, policy_version: 2, review_version: hash('[]'), explanation_version: hash('[]') }
let issueMode = 'contradiction', resultMode = 'valid'
const server = await createServer({
  root, cacheDir: join(output, 'vite-cache'),
  server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } },
})
let browser, page, task, reuseNext = false, checkCount = 0
const errors = [], forbidden = [], unexpectedWrites = [], requests = [], cancellations = []
const cleanup = browserCleanup(() => ({ browser, server }))
const active = () => task && ['queued', 'running'].includes(task.status)
const labels = {
  zh: { account: '用户与语言设置', check: '原文一致性检查', issue: '问题1性质', decision: '确认问题性质', repair: '原文异常，需要修复', explain: '正常表述，需要解释', normal: '正常，无需处理', unknown: '暂不确定', button: '生成修复建议', cancel: '取消优化', busy: '生成中', source: '章节原文', started: '已开始原文异常修复建议', running: '建议完成后请核对差异，再明确应用到原文。', success: '原文异常修复建议已完成，请核对建议并明确应用。', preview: '原文异常修复预览', before: '修改前', after: '修改后', apply: '应用修复稿', discard: '放弃建议' },
  vi: { account: 'Tài khoản và ngôn ngữ', check: 'Source consistency check', issue: 'Loại vấn đề 1', decision: 'Xác định loại vấn đề', repair: 'Nguyên văn có bất thường, cần sửa', explain: 'Cách diễn đạt hợp lệ, cần giải thích', normal: 'Cách diễn đạt hợp lệ, không cần xử lý', unknown: 'Chưa xác định', button: 'Tạo đề xuất sửa', cancel: 'Hủy tạo đề xuất sửa', busy: 'Đang tạo', source: 'Chapter source', started: 'Đã bắt đầu tạo đề xuất sửa nguyên văn', running: 'Khi có đề xuất, hãy đối chiếu khác biệt trước khi quyết định áp dụng vào nguyên văn.', success: 'Đã tạo đề xuất sửa nguyên văn. Hãy xem xét và chủ động áp dụng.', preview: 'Xem trước đề xuất sửa nguyên văn', before: 'Trước khi sửa', after: 'Sau khi sửa', apply: 'Áp dụng bản sửa', discard: 'Bỏ đề xuất' },
  en: { account: 'User and language settings', check: 'Source consistency check', issue: 'Issue 1 type', decision: 'Confirm issue type', repair: 'Source issue requires correction', explain: 'Valid wording that needs explanation', normal: 'Valid wording. No action needed.', unknown: 'Undecided', button: 'Generate correction', cancel: 'Cancel optimization', busy: 'Generating', source: 'Chapter source', started: 'Generating source corrections', running: 'Review the differences before applying corrections.', success: 'Source corrections are ready to review and apply.', preview: 'Preview source corrections', before: 'Before', after: 'After', apply: 'Apply correction', discard: 'Discard suggestion' },
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
async function verifySource(locale, expected = raw) {
  const field = editor().getByRole('textbox', { name: locale.source, exact: true })
  await field.waitFor()
  assert.equal(await field.inputValue(), expected)
  assert.equal(await editor().locator('.chapter-editor-name-row input').inputValue(), chapter.title)
}
async function prepareChoice(locale, choice = locale.repair) {
  await verifySource(locale)
  const issue = editor().getByRole('combobox', { name: locale.issue, exact: true })
  await editor().getByText(locale.decision, { exact: true }).waitFor()
  await issue.click()
  for (const option of [locale.repair, locale.explain, locale.normal, locale.unknown]) {
    await page.getByText(option, { exact: true }).waitFor({ state: 'visible' })
  }
  await page.getByText(choice, { exact: true }).click()
  await verifySource(locale)
}
async function prepare(locale) {
  await verifySource(locale)
  await editor().getByRole('button', { name: locale.check, exact: true }).click()
  await prepareChoice(locale)
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
  await editor().getByRole('button', { name: locale.cancel, exact: true }).waitFor({ state: 'visible' })
}
async function finish(locale, apply = false, evidence) {
  task.status = 'succeeded'
  task.progress = 100
  await visible(locale.success)
  await verifySource(locale)
  const card = editor().locator('.ant-card').filter({ has: page.getByText(locale.preview, { exact: true }) })
  await card.waitFor()
  await card.getByText(locale.before, { exact: true }).waitFor()
  await card.getByText(locale.after, { exact: true }).waitFor()
  assert.deepEqual(await card.locator('pre').allTextContents(), [raw, optimized])
  const button = card.getByRole('button', { name: locale.apply, exact: true })
  assert.equal(await button.isEnabled(), true)
  await card.getByRole('button', { name: locale.discard, exact: true }).waitFor()
  if (evidence) await screenshot(evidence)
  await card.getByRole('button', { name: apply ? locale.apply : locale.discard, exact: true }).click()
  await card.waitFor({ state: 'hidden' })
  await verifySource(locale, apply ? optimized : raw)
  assert.deepEqual(unexpectedWrites, [])
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
      assert.equal(req.postDataJSON().script_text, raw)
      return respond({ task_id: 'check' + ++checkCount, status: 'queued' })
    }
    if (req.method() === 'POST' && path.endsWith('/script-processing/optimize-script-async')) {
      requests.push(req.postDataJSON())
      task = { task_id: 'optimize' + requests.length, status: 'running', progress: 30, cancel_requested: false }
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
    const check = path.match(/\/film\/tasks\/(check\d+)\/(status|result)$/)
    if (check) return respond({ task_id: check[1], status: 'succeeded', progress: 100, result: {
      ...checkResult, issues: checkResult.issues.map(item => ({ ...item, classification: issueMode })),
    } })
    if (task && path.endsWith('/film/tasks/' + task.task_id + '/status')) return respond(task)
    if (task && path.endsWith('/film/tasks/' + task.task_id + '/result')) {
      if (resultMode === 'read-error') return route.fulfill({ status: 500, json: { detail: 'Synthetic read failure' } })
      return respond({ ...task, result: resultMode === 'empty' ? { ...repairResult, optimized_script_text: '  ' }
        : resultMode === 'stale' ? { ...repairResult, review_version: 'stale-version' } : repairResult })
    }
    if (path.endsWith('/film/tasks') && url.searchParams.get('target_type') === 'script_optimization'
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
  // The guard must block an optimization request until a source issue is confirmed.
  await editor().getByRole('button', { name: labels.zh.check, exact: true }).click()
  await editor().getByRole('button', { name: labels.zh.button, exact: true }).click()
  await visible('请先选择已确认的原文异常')
  assert.equal(requests.length, 0)
  await verifySource(labels.zh)
  await prepareChoice(labels.zh, labels.zh.repair)
  await start(labels.zh)
  await finish(labels.zh)
  await chooseLanguage(labels.zh, 'Tiếng Việt', 'vi-VN')
  await editor().getByRole('button', { name: labels.vi.check, exact: true }).click()
  await editor().getByRole('button', { name: labels.vi.button, exact: true }).click()
  await visible('Hãy chọn một bất thường trong nguyên văn đã xác nhận trước')
  assert.equal(requests.length, 1)
  await prepareChoice(labels.vi, labels.vi.repair)
  await start(labels.vi)
  await screenshot('optimize-vi-1366.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="vi-VN"]').waitFor()
  await visible(labels.vi.running)
  await verifySource(labels.vi)
  const notice = page.locator('.ant-notification-notice').filter({ hasText: labels.vi.running })
  await notice.getByRole('button', { name: 'Hủy tác vụ', exact: true }).click()
  await visible('Đã yêu cầu hủy đề xuất sửa nguyên văn')
  await visible('Đã gửi yêu cầu hủy. Tác vụ sẽ dừng sau bước hiện tại.')
  assert.equal(requests.length, 2)
  await screenshot('optimize-vi-390.png')
  task.status = 'cancelled'
  await visible('Đã hủy tác vụ đề xuất sửa nguyên văn.')
  await prepare(labels.vi)
  reuseNext = true
  await start(labels.vi, 'Đã khôi phục tác vụ đề xuất sửa nguyên văn của chương hiện tại')
  await finish(labels.vi, false, 'repair-preview-vi-390.png')
  await start(labels.vi)
  task.status = 'failed'
  await visible('Không tạo được đề xuất sửa nguyên văn. Vui lòng thử lại sau.')
  await verifySource(labels.vi)
  // Ambiguous findings require an explicit creator instruction before optimization.
  issueMode = 'ambiguity'
  await editor().getByRole('button', { name: labels.vi.check, exact: true }).click()
  await prepareChoice(labels.vi)
  await editor().getByRole('button', { name: labels.vi.button, exact: true }).click()
  await visible('Hãy nêu rõ cách xử lý điểm mơ hồ đã chọn hoặc đánh dấu Chưa xác định')
  assert.equal(requests.length, 4)
  await verifySource(labels.vi)
  issueMode = 'contradiction'
  await editor().getByRole('button', { name: labels.vi.check, exact: true }).click()
  await prepareChoice(labels.vi)
  await page.setViewportSize({ width: 1366, height: 768 })
  resultMode = 'empty'
  await start(labels.vi)
  task.status = 'succeeded'
  await visible('Không thể tạo đề xuất sửa: kết quả không có nội dung hợp lệ')
  await verifySource(labels.vi)
  assert.equal(await editor().getByText(labels.vi.preview, { exact: true }).count(), 0)
  resultMode = 'stale'
  await start(labels.vi)
  task.status = 'succeeded'
  await visible(labels.vi.success)
  const staleCard = editor().locator('.ant-card').filter({ has: page.getByText(labels.vi.preview, { exact: true }) })
  await staleCard.waitFor()
  assert.equal(await staleCard.getByRole('button', { name: labels.vi.apply, exact: true }).isDisabled(), true)
  await verifySource(labels.vi)
  await staleCard.getByRole('button', { name: labels.vi.discard, exact: true }).click()
  resultMode = 'valid'
  await start(labels.vi)
  await finish(labels.vi, true, 'repair-preview-vi-1366.png')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="vi-VN"]').waitFor()
  await verifySource(labels.vi)
  await page.setViewportSize({ width: 390, height: 844 })
  await chooseLanguage(labels.vi, 'English', 'en-US')
  await editor().getByRole('button', { name: labels.en.check, exact: true }).click()
  await editor().getByRole('button', { name: labels.en.button, exact: true }).click()
  await visible('Select a confirmed source issue first')
  assert.equal(requests.length, 7)
  await prepareChoice(labels.en, labels.en.repair)
  await start(labels.en)
  await finish(labels.en, true)
  await chooseLanguage(labels.en, '简体中文', 'zh-CN')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="zh-CN"]').waitFor()
  await verifySource(labels.zh)
  assert.equal(requests.length, 8)
  for (const request of requests) {
    assert.equal(request.script_text, raw)
    assert.equal(request.chapter_id, chapter.id)
    assert.deepEqual(request.source_explanations, [])
    assert.equal(request.consistency.source_version, hash(raw))
    assert.equal(request.consistency.issues.length, 1)
    assert.equal(request.consistency.issues[0].resolution, 'repair')
  }
  assert.deepEqual(cancellations, ['optimize2'])
  assert.deepEqual(unexpectedWrites, [])
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Source correction copy: zh/vi/en unselected guards, vi ambiguity guard/empty result/stale disabled apply, active reload, start/reuse/cancel/success/failure, explicit apply/discard, source/title/payload, desktop/mobile, mock-only PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output)
  console.error(await page?.locator('body').innerText())
  throw error
} finally {
  await cleanup()
}
