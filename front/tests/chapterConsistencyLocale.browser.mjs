import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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
const hash = value => createHash('sha256').update(value).digest('hex')
const note = { excerpt: '', id: 'synthetic-note', kind: 'explanation', policy_version: 2, source_version: hash(raw), text: 'Synthetic creator explanation' }
const noteVersion = hash(JSON.stringify([note]))
const explanationIssues = [
  { target: 'explanation', explanation_id: note.id, description: 'Synthetic boundary issue', suggestion: 'Synthetic suggestion A' },
  { target: 'explanation', explanation_id: 'missing-note', description: 'Synthetic missing issue', suggestion: 'Synthetic suggestion B' },
  { target: 'source', issue_type: 'fact', classification: 'contradiction', excerpt: raw, description: 'Synthetic source issue', suggestion: 'Synthetic suggestion C' },
]
let explanationPhase = false
const explanationCopy = {
  zh: { issue: '补充解释问题', missing: '条目已移除', prefix: '建议：', stop: '确认越界，退出采用', notice: '已退出采用，解释内容保留待调整', guidance: '若判断不成立，可保留解释；AI 疑点不会自动作废解释。需要修改时请在上方解释条目中编辑。', confirmed: '已确认', pending: '待复核' },
  vi: { issue: 'Vấn đề về giải thích bổ sung', missing: 'Mục giải thích đã bị xóa', prefix: 'Đề xuất: ', stop: 'Xác nhận vượt phạm vi, ngừng sử dụng', notice: 'Đã ngừng sử dụng; nội dung giải thích được giữ lại để chỉnh sửa.', guidance: 'Nếu nhận định không đúng, bạn có thể giữ lại giải thích. Nghi vấn của AI không tự động làm mất hiệu lực giải thích. Nếu cần sửa, hãy chỉnh sửa mục giải thích phía trên.', confirmed: 'Đã xác nhận', pending: 'Chờ kiểm tra lại' },
  en: { issue: 'Explanation issues', missing: 'Entry removed', prefix: 'Suggestion', stop: 'Confirm out of range and stop using', notice: 'No longer in use. The explanation is retained for editing.', guidance: 'If the assessment is incorrect, you can keep the explanation. AI concerns do not automatically invalidate it. Edit the explanation above if needed.', confirmed: 'Confirmed', pending: 'Needs review' },
}
const server = await createServer({
  root, cacheDir: join(output, 'vite-cache'),
  server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } },
})
let browser, page, task, reuseNext = false, queueNext = false, issueNext = false, readErrorNext = false, legacyNext = false, allTypesNext = false
const errors = [], forbidden = [], unexpectedWrites = [], checks = [], cancellations = []
const cleanup = browserCleanup(() => ({ browser, server }))
const active = () => task && ['queued', 'running'].includes(task.status)
const issueTypes = [
  ['language', 'contradiction', 'Cách diễn đạt', 'Mâu thuẫn rõ ràng'],
  ['semantics', 'ambiguity', 'Ngữ nghĩa', 'Điểm mơ hồ cần xác nhận'],
  ['character_confusion', 'optional', 'Danh tính và cách quy chiếu nhân vật', 'Chi tiết bổ sung tùy chọn'],
  ['spatial', 'contradiction', 'Quan hệ không gian theo văn bản', 'Mâu thuẫn rõ ràng'],
  ['action_time', 'ambiguity', 'Trình tự thời gian trong văn bản', 'Điểm mơ hồ cần xác nhận'],
  ['prop_state', 'optional', 'Mô tả đạo cụ', 'Chi tiết bổ sung tùy chọn'],
  ['fact', 'contradiction', 'Dữ kiện trong văn bản', 'Mâu thuẫn rõ ràng'],
  ['future_type', 'future_class', 'Vấn đề trong văn bản', 'Chờ xác nhận'],
  [undefined, undefined, 'Vấn đề trong văn bản', 'Chờ xác nhận'],
]
const labels = {
  zh: { account: '用户与语言设置', button: '原文一致性检查', source: '章节原文', started: '已开始一致性检查', running: '检查完成后会自动展示最新的一致性检查结果。', success: '一致性检查已完成，结果已自动更新。', empty: '未发现原文一致性问题', busy: '检查中', cancel: '取消检查', result: '原文一致性检查结果', found: '发现问题', none: '无问题', count: '问题：', last: '上次检查' },
  vi: { account: 'Tài khoản và ngôn ngữ', button: 'Kiểm tra tính nhất quán của nguyên văn', source: 'Nguyên văn chương', started: 'Đã bắt đầu kiểm tra tính nhất quán', running: 'Kết quả kiểm tra tính nhất quán sẽ tự động hiển thị khi kiểm tra hoàn tất.', success: 'Đã kiểm tra tính nhất quán; kết quả được cập nhật.', empty: 'Không phát hiện vấn đề về tính nhất quán của nguyên văn', busy: 'Đang kiểm tra', cancel: 'Hủy kiểm tra', result: 'Kết quả kiểm tra tính nhất quán của nguyên văn', found: 'Phát hiện vấn đề', none: 'Không có vấn đề', count: 'Số vấn đề: ', last: 'Lần kiểm tra gần nhất' },
  en: { account: 'User and language settings', button: 'Source consistency check', source: 'Chapter source', started: 'Consistency check started', running: 'Results will appear when the check finishes.', success: 'Consistency check complete. Results updated.', empty: 'No source consistency issues found', busy: 'Checking', cancel: 'Cancel check', result: 'Source consistency results', found: 'Issues found', none: 'No issues', count: 'Issue', last: 'Last check' },
}
async function chooseLanguage(from, label, lang) {
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: from.account, exact: true }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()
  await page.locator('html[lang="' + lang + '"]').waitFor()
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
}
const editor = () => page.getByRole('dialog')
async function assertCheckingDisabled(locale) {
  // The loading icon contributes to the accessible name; identify the actual button by its exact visible text.
  const button = editor().locator('button').filter({ hasText: new RegExp("^" + locale.busy + "$") })
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
async function finish(locale, hasIssues = false, legacy = false) {
  legacyNext = legacy
  issueNext = hasIssues
  task.status = 'succeeded'
  task.progress = 100
  await visible(locale.success)
  const resultTitle = legacy ? 'Kết quả kiểm tra nhầm lẫn nhân vật (phiên bản cũ)' : locale.result
  const card = editor().locator('.ant-card').filter({ has: page.getByText(resultTitle, { exact: true }) })
  await card.waitFor()
  await card.locator('.ant-tag').getByText(hasIssues ? locale.found : locale.none, { exact: true }).waitFor()
  await card.locator('.ant-tag').getByText(locale.count + (hasIssues ? '1' : '0'), { exact: true }).waitFor()
  const lastCheck = editor().locator('.chapter-editor-check-time')
  await lastCheck.waitFor()
  assert.ok((await lastCheck.innerText()).startsWith(locale.last))
  assert.equal(await lastCheck.locator('time').getAttribute('datetime'), new Date(1700000000 * 1000).toISOString())
  if (hasIssues) {
    await visible('Phát hiện 1 vấn đề về tính nhất quán của nguyên văn')
    await editor().getByText('Synthetic issue', { exact: true }).waitFor()
  } else {
    await editor().getByText(locale.empty, { exact: true }).waitFor()
  }
  await verifySource(locale)
  legacyNext = false
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
      task = { task_id: 'check' + checks.length, status: queueNext ? 'queued' : 'running', progress: queueNext ? 0 : 30, cancel_requested: false, started_at_ts: 1700000000 }
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
      if (readErrorNext) return route.fulfill({ status: 500, json: { detail: 'Synthetic result read error' } })
      if (explanationPhase) return respond({ ...task, result: {
        check_scope: 'source_consistency', has_issues: true, issues: explanationIssues,
        source_version: hash(raw), policy_version: 2, review_version: noteVersion, explanation_version: noteVersion,
      } })
      const issues = allTypesNext
        ? issueTypes.map(([issue_type, classification], i) => ({ issue_type, classification, excerpt: raw, description: 'Synthetic classification ' + (i + 1) }))
        : issueNext ? [{ issue_type: 'fact', classification: 'contradiction', excerpt: raw, description: 'Synthetic issue' }] : []
      return respond({ ...task, result: { check_scope: legacyNext ? 'character_confusion' : 'source_consistency', has_issues: issueNext || allTypesNext, issues, summary: '无混淆' } })
    }
    if (path.endsWith('/film/tasks') && url.searchParams.get('target_type') === 'consistency_check'
      && url.searchParams.get('target_id') === 'ch1') {
      const statuses = url.searchParams.getAll('statuses')
      return respond({ items: active() && statuses.includes(task.status) ? [task] : [], total: active() ? 1 : 0 })
    }
    const data = path.endsWith('/projects/p1') ? { id: 'p1', name: 'Synthetic chapter', stats: {} }
      : path.endsWith('/studio/chapters/ch1') ? (explanationPhase ? { ...chapter, source_explanations: [note] } : chapter)
      : path.endsWith('/chapters') ? { items: [chapter], pagination: { page: 1, page_size: 10, total: 1, max_page: 1 } }
      : { items: [], total: 0 }
    return respond(data)
  })
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
  await start(labels.zh)
  await finish(labels.zh)
  await chooseLanguage(labels.zh, 'Tiếng Việt', 'vi-VN')
  await start(labels.vi)
  await assertCheckingDisabled(labels.vi)
  assert.equal(checks.length, 2)
  await screenshot('consistency-vi-1366.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('html[lang="vi-VN"]').waitFor()
  await visible(labels.vi.running)
  await verifySource(labels.vi)
  await editor().getByRole('button', { name: labels.vi.cancel, exact: true }).click()
  await visible('Đã yêu cầu hủy kiểm tra tính nhất quán')
  await visible('Đã gửi yêu cầu hủy. Hệ thống sẽ dừng sau bước hiện tại và đồng bộ kết quả mới nhất khi kết thúc.')
  await assertCheckingDisabled(labels.vi)
  assert.equal(await editor().getByRole('button', { name: 'Đang hủy', exact: true }).isDisabled(), true)
  assert.equal(checks.length, 2)
  await screenshot('consistency-vi-390.png')
  task.status = 'cancelled'
  await visible('Đã hủy kiểm tra tính nhất quán.')
  reuseNext = true
  await start(labels.vi, 'Đã khôi phục tác vụ kiểm tra tính nhất quán của chương hiện tại')
  await finish(labels.vi, false, true)
  await screenshot('consistency-legacy-vi-390.png')
  await start(labels.vi)
  task.status = 'failed'
  await visible('Kiểm tra tính nhất quán thất bại. Vui lòng thử lại.')
  queueNext = true
  await start(labels.vi)
  await editor().getByRole('button', { name: labels.vi.cancel, exact: true }).click()
  await visible('Đã hủy kiểm tra tính nhất quán')
  await visible('Đã hủy kiểm tra tính nhất quán.')
  await verifySource(labels.vi)
  await editor().getByRole('button', { name: labels.vi.button, exact: true }).waitFor()
  assert.equal(await editor().getByRole('button', { name: labels.vi.button, exact: true }).isEnabled(), true)
  await start(labels.vi)
  await finish(labels.vi, true)
  await screenshot('consistency-issues-vi-390.png')
  await page.setViewportSize({ width: 1366, height: 768 })
  await start(labels.vi)
  allTypesNext = true
  task.status = 'succeeded'
  task.progress = 100
  await visible('Phát hiện 9 vấn đề về tính nhất quán của nguyên văn')
  const classificationCard = editor().locator('.ant-card').filter({ has: page.getByText(labels.vi.result, { exact: true }) })
  await classificationCard.locator('.ant-tag').getByText('Số vấn đề: 9', { exact: true }).waitFor()
  const rows = classificationCard.locator('.ant-list-item')
  assert.equal(await rows.count(), issueTypes.length)
  for (const [index, [, , title, classification]] of issueTypes.entries()) {
    const row = rows.nth(index)
    await row.getByText(title + ' · Vấn đề ' + (index + 1), { exact: true }).waitFor()
    await row.locator('.ant-tag').getByText(classification, { exact: true }).waitFor()
    await row.getByText('Synthetic classification ' + (index + 1), { exact: true }).waitFor()
  }
  await verifySource(labels.vi)
  await screenshot('consistency-classifications-vi-1366.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await screenshot('consistency-classifications-vi-390.png')
  await verifySource(labels.vi)
  allTypesNext = false
  await page.setViewportSize({ width: 1366, height: 768 })
  await start(labels.vi)
  readErrorNext = true
  task.status = 'succeeded'
  task.progress = 100
  await visible('Không thể đọc kết quả kiểm tra tính nhất quán')
  await verifySource(labels.vi)
  readErrorNext = false
  await chooseLanguage(labels.vi, 'English', 'en-US')
  await start(labels.en)
  await finish(labels.en)
  await chooseLanguage(labels.en, '简体中文', 'zh-CN')
  await verifySource(labels.zh)
  assert.equal(checks.length, 9)
  for (const check of checks) {
    assert.equal(check.script_text, raw)
    assert.equal(check.chapter_id, chapter.id)
    assert.deepEqual(check.source_explanations, [])
  }
  // Separate populated fixture; preserve the earlier nine empty-explanation payload assertions.
  explanationPhase = true
  await page.reload({ waitUntil: 'domcontentloaded' })
  for (const lang of ['zh', 'vi', 'en']) {
    if (lang === 'vi') await chooseLanguage(labels.zh, 'Tiếng Việt', 'vi-VN')
    if (lang === 'en') await chooseLanguage(labels.vi, 'English', 'en-US')
    const locale = labels[lang], copy = explanationCopy[lang]
    const panel = page.locator('.chapter-editor-explanations')
    const noteRow = panel.getByRole('button', { name: /Synthetic creator explanation/ })
    await noteRow.getByText(copy.confirmed, { exact: true }).waitFor()
    await start(locale)
    task.status = 'succeeded'
    task.progress = 100
    await visible(locale.success)
    const card = editor().locator('.ant-card').filter({ has: page.getByText(locale.result, { exact: true }) })
    const rows = card.locator('.ant-list-item')
    await card.locator('.ant-tag').getByText(locale.count + '3', { exact: true }).waitFor()
    assert.equal(await rows.count(), 3)
    for (const [index, issue] of explanationIssues.entries()) {
      const row = rows.nth(index)
      await row.getByText(issue.description, { exact: true }).waitFor()
      await row.getByText(copy.prefix + issue.suggestion, { exact: true }).waitFor()
      if (index < 2) {
        await row.getByText(copy.issue, { exact: true }).waitFor()
        await row.getByText(copy.guidance, { exact: true }).waitFor()
        await row.getByText(index === 0 ? note.text : copy.missing, { exact: true }).waitFor()
        await row.getByRole('button', { name: copy.stop, exact: true }).waitFor()
      }
    }
    const stop = rows.nth(0).getByRole('button', { name: copy.stop, exact: true })
    assert.equal(await stop.isEnabled(), true)
    // A model concern alone must not invalidate the existing creator explanation.
    await noteRow.getByText(copy.confirmed, { exact: true }).waitFor()
    await verifySource(locale)
    await stop.scrollIntoViewIfNeeded()
    await screenshot('explanation-issue-' + lang + '-1366.png')
    if (lang === 'vi') {
      await page.setViewportSize({ width: 390, height: 844 })
      await stop.scrollIntoViewIfNeeded()
      await screenshot('explanation-issue-vi-390.png')
      await page.setViewportSize({ width: 1366, height: 768 })
    }
    await stop.click()
    await visible(copy.notice)
    await noteRow.getByText(copy.pending, { exact: true }).waitFor()
    await rows.nth(0).getByText(note.text, { exact: true }).waitFor()
    assert.equal(await stop.isDisabled(), true)
    await verifySource(locale)
    assert.equal(await panel.locator('.chapter-explanation-row').count(), 1)
  }
  assert.equal(checks.length, 12)
  for (const check of checks.slice(9)) {
    assert.equal(check.script_text, raw)
    assert.equal(check.chapter_id, chapter.id)
    assert.deepEqual(check.source_explanations, [note])
  }
  assert.deepEqual(cancellations, ['check2', 'check5'])
  assert.deepEqual(unexpectedWrites, [])
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Consistency task copy: zh/vi/en, active reload, start/reuse/deferred and immediate cancel/success/failure, duplicate submission controls, current/legacy headers, last-check timestamp, all finite classification branches and fallback results, explanation issue warnings/explicit stop/retained text, empty/issue results and read error, creator source, desktop/mobile, mock-only PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output)
  console.error(await page?.locator('body').innerText())
  throw error
} finally {
  await cleanup()
}
