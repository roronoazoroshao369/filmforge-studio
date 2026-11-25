import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-chapter-source-save-locale-')
const port = 4788, origin = `http://127.0.0.1:${port}`
const base = origin + '/projects/p1?tab=chapters'
const title = '青云传 · Bản thảo', original = '她推开门。', condensed = '推门。'
const chapter = { id: 'ch1', project_id: 'p1', index: 1, title, raw_text: original, condensed_text: condensed, sequence_count: 2, status: 'draft', basis_version: 'v1', source_explanations: [] }
const other = { ...chapter, id: 'ch2', index: 2, title: '另一章', sequence_count: 0 }
const scenes = [1, 2].map(i => ({ id: `s${i}`, position: i - 1, title: `场次 ${i}`, version: 1, source_excerpt: original, source_text: original, source_changed: true }))
const beforeOther = structuredClone(other), beforeScenes = structuredClone(scenes)
const writes = [], forbidden = [], errors = [], guardReads = new Set()
let observingGuard = false
let pendingWrite
const server = await createServer({ root, cacheDir: join(output, 'vite-cache'), server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } } })
let browser, page
const cleanup = browserCleanup(() => ({ browser, server }))
const copy = {
  zh: { create: '新建章节', content: '章节内容', edit: '正文编辑', view: '正文视图', placeholder: '编辑章节原文…', lang: 'zh-CN', account: '用户与语言设置', source: '章节原文', name: '章节名称', save: '保存', note: '修改原文不会同步已有场次', warning: '修改章节原文不会自动更新已有场次的划分和原文范围。本章已有 2 个场次，保存后需要重新核对。已有设计和素材保留，继续试拍前还需核对相关设计与计划依据。', cancel: '继续编辑', confirm: '确认保存原文', saved: '原文已保存，请逐场核对原文范围及设计与计划依据。', review: '查看本章场次并核对' },
  vi: { create: 'Tạo chương', content: 'Nội dung chương', edit: 'Chỉnh sửa nội dung', view: 'Chế độ xem nội dung', placeholder: 'Chỉnh sửa nguyên văn chương…', lang: 'vi-VN', account: 'Tài khoản và ngôn ngữ', source: 'Nguyên văn chương', name: 'Tên chương', save: 'Lưu', note: 'Chỉnh sửa nguyên văn không đồng bộ các phân cảnh hiện có', warning: 'Chỉnh sửa nguyên văn của chương không tự động cập nhật cách phân chia và phạm vi nguyên văn của các phân cảnh hiện có. Chương này có 2 phân cảnh; cần rà soát lại sau khi lưu. Các thiết kế và tư liệu hiện có được giữ nguyên; trước khi quay thử tiếp, cần kiểm tra căn cứ thiết kế và kế hoạch liên quan.', cancel: 'Tiếp tục chỉnh sửa', confirm: 'Xác nhận lưu nguyên văn', saved: 'Đã lưu nguyên văn. Hãy rà soát phạm vi nguyên văn và căn cứ thiết kế, kế hoạch của từng phân cảnh.', review: 'Xem và rà soát các phân cảnh của chương' },
  en: { create: 'Create chapter', content: 'Chapter content', edit: 'Edit text', view: 'Text view', placeholder: 'Edit chapter source…', lang: 'en-US', account: 'User and language settings', source: 'Chapter source', name: 'Chapter name', save: 'Save', note: 'Editing the source does not update existing scenes', warning: 'Changing the source does not update the 2 existing scenes. Review their ranges after saving. Designs and assets are retained. Check related designs and plans before the next shoot.', cancel: 'Continue editing', confirm: 'Confirm source save', saved: 'Source saved. Check each scene’s range and the basis for its design and plan.', review: 'View and review chapter scenes' },
}
async function switchLanguage(from, label, to) {
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: from.account, exact: true }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()
  await page.locator(`html[lang="${to.lang}"]`).waitFor()
}
async function exercise(c, draft, commit) {
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  const beforeCreate = writes.length
  await page.getByRole('button', { name: c.create }).click()
  const create = page.getByRole('dialog', { name: c.create, exact: true })
  await create.getByRole('group', { name: c.view, exact: true }).waitFor()
  const newSource = create.getByRole('textbox', { name: c.source, exact: true })
  assert.equal(await newSource.inputValue(), '')
  assert.equal(await newSource.getAttribute('placeholder'), c.placeholder)
  assert.equal(writes.length, beforeCreate)
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
  const editor = page.locator('.chapter-editor-drawer')
  const source = editor.getByRole('textbox', { name: c.source, exact: true })
  await source.waitFor()
  const content = editor.locator('.chapter-editor-pane-switch')
  assert.equal(await content.getAttribute('aria-label'), c.content)
  if (page.viewportSize().width === 390) assert.equal(await content.isVisible(), true)
  assert.equal(await source.getAttribute('placeholder'), c.placeholder)
  await editor.locator('[aria-label="' + c.edit + '"]').waitFor()
  assert.equal(await editor.getByRole('group', { name: c.view, exact: true }).count(), 0)
  assert.equal(await source.inputValue(), chapter.raw_text)
  assert.equal(await editor.getByRole('textbox', { name: c.name, exact: true }).inputValue(), title)
  await editor.getByText(c.note, { exact: true }).waitFor()
  const before = writes.length, savedRaw = chapter.raw_text, basis = chapter.basis_version
  await source.fill(draft)
  const save = editor.getByRole('button', { name: c.save, exact: true })
  await save.click()
  await editor.getByText(c.warning, { exact: true }).waitFor()
  assert.equal(writes.length, before)
  await editor.getByRole('button', { name: c.cancel, exact: true }).click()
  await editor.getByRole('button', { name: c.confirm, exact: true }).waitFor({ state: 'hidden' })
  assert.equal(await source.inputValue(), draft)
  assert.equal(chapter.raw_text, savedRaw)
  assert.equal(writes.length, before)
  await save.click()
  await editor.getByText(c.warning, { exact: true }).waitFor()
  assert.equal(await editor.evaluate(e => e.scrollWidth <= e.clientWidth + 1), true)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
  await page.screenshot({ path: join(output, `${c.lang}-confirm.png`), animations: 'disabled' })
  if (commit) {
    await editor.getByRole('button', { name: c.confirm, exact: true }).click()
    await editor.getByText(c.saved, { exact: true }).waitFor()
    assert.equal(writes.length, before + 1)
    assert.deepEqual(writes.at(-1), { expected_basis_version: basis, raw_text: draft })
    assert.equal(await source.inputValue(), draft)
    assert.equal(await editor.getByRole('textbox', { name: c.name, exact: true }).inputValue(), title)
    await page.screenshot({ path: join(output, `${c.lang}-saved.png`), animations: 'disabled' })
    await editor.getByRole('button', { name: c.review, exact: true }).click()
    await page.waitForURL('**/chapters/ch1/workbench-management?step=division')
    assert.equal(writes.length, before + 1)
  } else {
    await editor.getByRole('button', { name: c.cancel, exact: true }).click()
    assert.equal(writes.length, before)
  }
  assert.equal(chapter.title, title)
  assert.equal(chapter.condensed_text, condensed)
  assert.deepEqual(chapter.source_explanations, [])
  assert.deepEqual(other, beforeOther)
  assert.deepEqual(scenes, beforeScenes)
}
const guardCopy = {
  zh: ['返回', '有未保存的修改', '取消，继续编辑', '放弃修改并继续', '保存后继续', '继续前，请处理以下修改。保存不会确认版本、开始生成或改变当前采用。'],
  vi: ['Quay lại', 'Có thay đổi chưa lưu', 'Hủy, tiếp tục chỉnh sửa', 'Bỏ thay đổi và tiếp tục', 'Lưu và tiếp tục', 'Hãy xử lý các thay đổi sau trước khi tiếp tục. Việc lưu không xác nhận phiên bản, bắt đầu tạo nội dung hay thay đổi kết quả đang được sử dụng.'],
  en: ['Back', 'Unsaved changes', 'Cancel and continue editing', 'Discard changes and continue', 'Save and continue', 'Resolve these changes before continuing. Saving does not confirm versions, start generation or change adopted results.'],
}
async function exerciseGuard(c, labels) {
  const [back, heading, cancel, discard, save, warning] = labels
  observingGuard = true
  const before = writes.length, originalChapter = structuredClone(chapter)
  const editor = page.locator('.chapter-editor-drawer')
  const source = editor.getByRole('textbox', { name: c.source, exact: true })
  const name = editor.getByRole('textbox', { name: c.name, exact: true })
  const guard = page.getByRole('dialog', { name: heading, exact: true })
  const open = async () => {
    await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
    await source.waitFor()
  }
  const dirty = async (suffix) => {
    await source.fill(originalChapter.raw_text + suffix)
    await name.fill(originalChapter.title + suffix)
  }
  const showGuard = async (suffix) => {
    await editor.getByRole('button', { name: back, exact: true }).click()
    await guard.getByText(warning, { exact: true }).waitFor()
    await guard.getByText(c.warning, { exact: true }).waitFor()
    for (const label of [cancel, discard, save]) await guard.getByRole('button', { name: label, exact: true }).waitFor()
    assert.equal(await source.inputValue(), originalChapter.raw_text + suffix)
    assert.equal(await name.inputValue(), originalChapter.title + suffix)
    assert.equal(writes.length, before)
    assert.deepEqual(chapter, originalChapter)
    assert.equal(await guard.evaluate(e => e.scrollWidth <= e.clientWidth + 1), true)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
  }
  await open()
  await dirty(' discard')
  await showGuard(' discard')
  await page.screenshot({ path: join(output, `${c.lang}-leave-guard.png`), animations: 'disabled' })
  await guard.getByRole('button', { name: cancel, exact: true }).click()
  await guard.waitFor({ state: 'hidden' })
  assert.equal(await source.inputValue(), originalChapter.raw_text + ' discard')
  assert.equal(await name.inputValue(), originalChapter.title + ' discard')
  await showGuard(' discard')
  await guard.getByRole('button', { name: discard, exact: true }).click()
  await editor.waitFor({ state: 'hidden' })
  assert.equal(writes.length, before)
  assert.deepEqual(chapter, originalChapter)
  await open()
  assert.equal(await source.inputValue(), originalChapter.raw_text)
  assert.equal(await name.inputValue(), originalChapter.title)
  await dirty(' save ' + c.lang)
  await showGuard(' save ' + c.lang)
  await guard.getByRole('button', { name: save, exact: true }).click()
  await editor.waitFor({ state: 'hidden' })
  assert.equal(writes.length, before + 1)
  assert.deepEqual(writes.at(-1), { expected_basis_version: originalChapter.basis_version, title: originalChapter.title + ' save ' + c.lang, raw_text: originalChapter.raw_text + ' save ' + c.lang })
  await open()
  assert.equal(await source.inputValue(), chapter.raw_text)
  assert.equal(await name.inputValue(), chapter.title)
  assert.equal(chapter.condensed_text, originalChapter.condensed_text)
  assert.deepEqual(chapter.source_explanations, originalChapter.source_explanations)
  assert.deepEqual(other, beforeOther)
  assert.deepEqual(scenes, beforeScenes)
  await editor.getByRole('button', { name: back, exact: true }).click()
  await editor.waitFor({ state: 'hidden' })
  observingGuard = false
}


const busyCopy = {
  zh: ['当前操作尚未完成', '留在当前页', '请等待当前操作完成后再切换。'],
  vi: ['Thao tác hiện tại chưa hoàn tất', 'Ở lại trang hiện tại', 'Vui lòng chờ thao tác hiện tại hoàn tất trước khi chuyển trang.'],
  en: ['Current operation incomplete', 'Stay on this page', 'Wait for the current operation before switching.'],
}
async function exerciseBusyGuard(c, labels, busyLabels) {
  const [back, , , discard, save] = labels
  const [heading, stay, warning] = busyLabels
  const before = writes.length, originalChapter = structuredClone(chapter)
  const draftTitle = originalChapter.title + ' busy ' + c.lang
  const draftSource = originalChapter.raw_text + ' busy ' + c.lang
  await page.goto(base + '&edit=ch1', { waitUntil: 'domcontentloaded' })
  const editor = page.locator('.chapter-editor-drawer')
  const source = editor.getByRole('textbox', { name: c.source, exact: true })
  const name = editor.getByRole('textbox', { name: c.name, exact: true })
  await source.waitFor()
  await source.fill(draftSource)
  await name.fill(draftTitle)
  const release = Promise.withResolvers()
  pendingWrite = release.promise
  observingGuard = true
  try {
    await editor.getByRole('button', { name: c.save, exact: true }).click()
    await editor.getByRole('button', { name: c.confirm, exact: true }).click()
    await page.waitForFunction(() => !!document.querySelector('.chapter-editor-drawer input[disabled]'))
    const guard = page.getByRole('dialog', { name: heading, exact: true })
    const showGuard = async () => {
      await editor.getByRole('button', { name: back, exact: true }).click()
      await guard.getByText(warning, { exact: true }).waitFor()
      assert.equal(await guard.getByRole('button', { name: discard, exact: true }).isDisabled(), true)
      assert.equal(await guard.getByRole('button', { name: save, exact: true }).isDisabled(), true)
      assert.equal(await guard.getByRole('button', { name: stay, exact: true }).isEnabled(), true)
      assert.equal(await source.inputValue(), draftSource)
      assert.equal(await name.inputValue(), draftTitle)
      assert.equal(writes.length, before + 1)
      assert.deepEqual(writes.at(-1), { expected_basis_version: originalChapter.basis_version, title: draftTitle, raw_text: draftSource })
      assert.deepEqual(chapter, originalChapter)
      assert.equal(await guard.evaluate(e => e.scrollWidth <= e.clientWidth + 1), true)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
    }
    await showGuard()
    await page.screenshot({ path: join(output, c.lang + '-busy-guard.png'), animations: 'disabled' })
    await guard.getByRole('button', { name: stay, exact: true }).click()
    await guard.waitFor({ state: 'hidden' })
    assert.equal(await source.inputValue(), draftSource)
    assert.equal(await name.inputValue(), draftTitle)
    await showGuard()
    await guard.getByRole('button', { name: stay, exact: true }).click()
    await guard.waitFor({ state: 'hidden' })
  } finally {
    release.resolve()
    pendingWrite = undefined
    observingGuard = false
  }
  await editor.getByText(c.saved, { exact: true }).waitFor()
  assert.equal(writes.length, before + 1)
  assert.equal(chapter.title, draftTitle)
  assert.equal(chapter.raw_text, draftSource)
  assert.equal(await name.inputValue(), draftTitle)
  assert.equal(await source.inputValue(), draftSource)
  assert.equal(chapter.condensed_text, originalChapter.condensed_text)
  assert.deepEqual(chapter.source_explanations, originalChapter.source_explanations)
  assert.deepEqual(other, beforeOther)
  assert.deepEqual(scenes, beforeScenes)
  await editor.getByRole('button', { name: back, exact: true }).click()
  await editor.waitFor({ state: 'hidden' })
  assert.equal(writes.length, before + 1)
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
    if (observingGuard && req.method() === 'GET') guardReads.add(path)
    const respond = data => route.fulfill({ json: { success: true, code: 200, data } })
    if (path.endsWith('/studio/chapters/ch1') && req.method() === 'PATCH') {
      const body = req.postDataJSON(); writes.push(body)
      assert.equal(body.expected_basis_version, chapter.basis_version)
      if (pendingWrite) await pendingWrite
      chapter.raw_text = body.raw_text; if (body.title !== undefined) chapter.title = body.title; chapter.basis_version = `v${writes.length + 1}`
      return respond(chapter)
    }
    if (req.method() !== 'GET') { forbidden.push(`${req.method()} ${path}`); return route.fulfill({ status: 405, json: { detail: 'Unexpected write' } }) }
    if (path.endsWith('/projects/p1')) return respond({ id: 'p1', name: 'Synthetic project', stats: {} })
    if (path.endsWith('/studio/chapters/ch1')) return respond(chapter)
    if (path.endsWith('/chapters')) return respond({ items: [chapter, other], pagination: { page: 1, page_size: 10, total: 2, max_page: 1 } })
    if (/\/directing\/chapters\/ch1(?:\/overview|\/workbench-management)?$/.test(path)) return respond({ chapter_id: 'ch1', title, raw_text: chapter.raw_text, source_version: chapter.basis_version, has_source: true, sequences: scenes, historical_sequences: [] })
    return respond({ items: [], total: 0 })
  })
  await exercise(copy.zh, '中文草稿。', true)
  await switchLanguage(copy.zh, 'Tiếng Việt', copy.vi)
  await page.setViewportSize({ width: 390, height: 844 })
  await exercise(copy.vi, '她推开门。\nBản thảo Việt.', true)
  await page.setViewportSize({ width: 1366, height: 768 })
  await switchLanguage(copy.vi, 'English', copy.en)
  await exercise(copy.en, 'Final fixture source.', true)
  await switchLanguage(copy.en, 'Tiếng Việt', copy.vi)
  await exercise(copy.vi, 'Chưa lưu.', false)
  assert.equal(writes.length, 3)
  await page.setViewportSize({ width: 390, height: 844 })
  await exerciseGuard(copy.vi, guardCopy.vi)
  await page.setViewportSize({ width: 1366, height: 768 })
  await switchLanguage(copy.vi, 'English', copy.en)
  await exerciseGuard(copy.en, guardCopy.en)
  await switchLanguage(copy.en, '简体中文', copy.zh)
  await exerciseGuard(copy.zh, guardCopy.zh)
  assert.equal(writes.length, 6)
  await exerciseBusyGuard(copy.zh, guardCopy.zh, busyCopy.zh)
  await switchLanguage(copy.zh, 'Tiếng Việt', copy.vi)
  await page.setViewportSize({ width: 390, height: 844 })
  await exerciseBusyGuard(copy.vi, guardCopy.vi, busyCopy.vi)
  await page.setViewportSize({ width: 1366, height: 768 })
  await switchLanguage(copy.vi, 'English', copy.en)
  await exerciseBusyGuard(copy.en, guardCopy.en, busyCopy.en)
  assert.equal(writes.length, 9)
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Mock read-only paths during guard exercise:', [...guardReads].sort())
  console.log('Source-save impact and dirty-draft leave: zh/vi/en cancel/discard/save/review, six exact PATCH bodies, preserved unrelated data, mobile/desktop PASS.')
  console.log('Busy-navigation guard: zh/vi/en, three additional exact PATCH bodies, stay twice while response held, disabled save/discard, no duplicate writes PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output, await page?.locator('body').innerText())
  throw error
} finally { await cleanup() }
