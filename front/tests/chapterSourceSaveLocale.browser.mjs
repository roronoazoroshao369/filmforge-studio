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
const writes = [], forbidden = [], errors = []
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
    if (path.endsWith('/studio/chapters/ch1') && req.method() === 'PATCH') {
      const body = req.postDataJSON(); writes.push(body)
      assert.equal(body.expected_basis_version, chapter.basis_version)
      chapter.raw_text = body.raw_text; chapter.basis_version = `v${writes.length + 1}`
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
  assert.deepEqual(forbidden, [])
  assert.deepEqual(errors, [])
  console.log('Source-save impact: zh/vi/en cancel/confirm/review, exact PATCH and preserved source/other data, mobile/desktop PASS.')
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png'), fullPage: true })
  console.error('Evidence:', output, await page?.locator('body').innerText())
  throw error
} finally { await cleanup() }
