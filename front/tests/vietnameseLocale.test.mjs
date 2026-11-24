import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const src = fileURLToPath(new URL('../src/', import.meta.url))
const read = path => readFileSync(join(src, path), 'utf8')
const catalog = (locale, namespace) => JSON.parse(read(`locales/${locale}/${namespace}.json`))
const tokens = value => (value.match(/{{\s*[A-Za-z_][\w]*\s*}}/g) || []).sort()
function leaves(value, prefix = '') {
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) =>
    typeof item === 'string' ? [[prefix + key, item]] : Object.entries(leaves(item, prefix + key + '.'))))
}

test('Vietnamese is registered without changing the Chinese default or storage key', () => {
  const source = read('i18n.ts')
  assert.match(source, /'vi-VN':\s*{/)
  assert.match(source, /supportedLngs:\s*\[[^\]]*'vi-VN'/)
  assert.match(source, /fallbackLng:\s*'zh-CN'/)
  assert.match(source, /jellyfish_language/)
  assert.match(read('layouts/MainLayout.tsx'), /key: 'vi-VN'/)
  assert.match(read('main.tsx'), /antd\/locale\/vi_VN/)
})

test('All four Vietnamese structured namespaces have exact key and placeholder parity', () => {
  for (const ns of ['common', 'layout', 'settings', 'notFound']) {
    const chinese = leaves(catalog('zh-CN', ns))
    const vietnamese = leaves(catalog('vi-VN', ns))
    assert.deepEqual(Object.keys(vietnamese).sort(), Object.keys(chinese).sort(), ns)
    for (const [key, value] of Object.entries(vietnamese)) {
      assert.ok(value.trim(), `${ns}.${key}`)
      assert.deepEqual(tokens(value), tokens(chinese[key]), `${ns}.${key}`)
    }
  }
  assert.equal(catalog('vi-VN', 'layout').lang.vi, 'Tiếng Việt')
})

test('Vietnamese UI keeps original Chinese keys and exactly preserves all interpolation tokens', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  assert.deepEqual(Object.keys(vietnamese).sort(), Object.keys(english).sort())
  for (const [key, value] of Object.entries(vietnamese)) {
    assert.equal(typeof value, 'string', key)
    assert.ok(value.trim(), key)
    assert.deepEqual(tokens(value), tokens(key), key)
  }
  for (const [key, expected] of Object.entries({
    '工作概览': 'Tổng quan công việc',
    '任务中心': 'Trung tâm tác vụ',
    '确认付费测试？': 'Xác nhận chạy thử có tính phí?',
    '本次测试会向供应商发起真实调用，可能产生费用。': 'Lần thử này gửi yêu cầu thật đến nhà cung cấp và có thể phát sinh chi phí.',
    '供应商响应无法确认调用结果，再次测试可能重复计费。': 'Không thể xác nhận kết quả từ phản hồi của nhà cung cấp. Thử lại có thể bị tính phí lần nữa.',
  })) assert.equal(vietnamese[key], expected, key)
})

test('Vietnamese covers project, files, tasks, providers, labs, assets and navigation source messages', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const sourceFiles = [
    ...['layouts/navigation.ts', 'layouts/ManagementLayout.tsx'],
    ...['pages/aiStudio/project', 'pages/aiStudio/files', 'pages/aiStudio/components', 'pages/aiStudio/models', 'pages/aiStudio/experiment', 'pages/aiStudio/assets']
      .flatMap(directory => {
        const walk = (relative) => readdirSync(join(src, relative), { withFileTypes: true })
          .flatMap(item => item.isDirectory() ? walk(relative + '/' + item.name)
            : /\.tsx?$/.test(item.name) ? [relative + '/' + item.name] : [])
        return walk(directory)
      }),
  ]
  // Vietnamese uses "Video" as a loanword; punctuation-only fragments and variable labels are language-neutral.
  const intentionallyShared = new Set(['视频', '视频：', '{{type}}：{{name}}', '、'])
  const missing = new Set()
  for (const file of sourceFiles) {
    const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'uiText'
        && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
        const key = node.arguments[0].text
        if (Object.hasOwn(english, key) && vietnamese[key] === english[key] && !intentionallyShared.has(key)) missing.add(key)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  assert.deepEqual([...missing].sort(), [], 'Source messages missing Vietnamese translations')
})

test('Vietnamese covers source explanation editor literal and dynamic status messages', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/SourceExplanationsEditor.tsx'
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  // Conditional location labels and the status variable are not literal call arguments.
  const keys = new Set(['待定位', '全章', '已确认', '需按文字表达边界复核', '待复核'])
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) keys.add(node.arguments[0].text)
    ts.forEachChild(node, visit)
  }
  visit(source)
  for (const key of keys) assert.ok(Object.hasOwn(english, key), key)
  assert.deepEqual([...keys].filter(key => vietnamese[key] === english[key]).sort(), [])
})

test('Vietnamese covers all dynamic consistency check task copy fields', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/components/taskCopy.ts'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  const fields = new Map()
  function visit(node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'consistencyCheck'
      && ts.isObjectLiteralExpression(node.initializer)) {
      for (const property of node.initializer.properties) {
        assert.ok(ts.isPropertyAssignment(property) && ts.isStringLiteralLike(property.initializer))
        fields.set(property.name.getText(ast), property.initializer.text)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual([...fields.keys()].sort(), [
    'title', 'runningDescription', 'cancellingDescription', 'successDescription',
    'cancelledDescription', 'failedDescription', 'startedMessage', 'reusedMessage',
    'cancelledImmediatelyMessage', 'cancelRequestedMessage', 'runningMessage', 'cancellingMessage',
  ].sort())
  const drawer = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const drawerAst = ts.createSourceFile(drawer, read(drawer), ts.ScriptTarget.Latest, true)
  const used = new Set()
  function visitDrawer(node) {
    if (ts.isCallExpression(node) && node.expression.getText(drawerAst) === 'uiText'
      && node.arguments[0] && ts.isPropertyAccessExpression(node.arguments[0])
      && node.arguments[0].expression.getText(drawerAst) === 'consistencyTaskCopy') {
      used.add(node.arguments[0].name.text)
    }
    ts.forEachChild(node, visitDrawer)
  }
  visitDrawer(drawerAst)
  assert.deepEqual([...used].sort(), [...fields.keys()].sort())
  for (const key of fields.values()) {
    assert.match(key, /\p{Script=Han}/u)
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
  }
  assert.deepEqual([...fields].filter(([, key]) => vietnamese[key] === english[key]).map(([field]) => field), [])
})
