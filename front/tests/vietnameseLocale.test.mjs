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

test('Vietnamese covers all dynamic script simplification fields and the shared cancellation description', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/components/taskCopy.ts'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  const presets = new Map()
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'TASK_COPY') {
      const object = node.initializer.expression
      assert.ok(ts.isObjectLiteralExpression(object))
      for (const preset of object.properties) {
        assert.ok(ts.isPropertyAssignment(preset) && ts.isObjectLiteralExpression(preset.initializer))
        const fields = new Map()
        for (const property of preset.initializer.properties) {
          assert.ok(ts.isPropertyAssignment(property) && ts.isStringLiteralLike(property.initializer))
          fields.set(property.name.getText(ast), property.initializer.text)
        }
        presets.set(preset.name.getText(ast), fields)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  const fields = presets.get('scriptSimplify')
  assert.deepEqual([...fields.keys()].sort(), [
    'title', 'runningDescription', 'cancellingDescription', 'successDescription',
    'cancelledDescription', 'failedDescription', 'startedMessage', 'reusedMessage',
    'cancelledImmediatelyMessage', 'cancelRequestedMessage', 'runningMessage', 'cancellingMessage',
  ].sort())
  const shared = fields.get('cancellingDescription')
  assert.deepEqual([...presets].filter(([, preset]) => preset.get('cancellingDescription') === shared).map(([name]) => name).sort(),
    ['scriptSimplify', 'scriptOptimize', 'smartDetect', 'imageGeneration', 'videoGeneration', 'shotFramePrompt', 'shotFrameImage'].sort())
  const drawer = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const drawerAst = ts.createSourceFile(drawer, read(drawer), ts.ScriptTarget.Latest, true)
  const used = new Set()
  function visitDrawer(node) {
    if (ts.isCallExpression(node) && node.expression.getText(drawerAst) === 'uiText'
      && node.arguments[0] && ts.isPropertyAccessExpression(node.arguments[0])
      && node.arguments[0].expression.getText(drawerAst) === 'simplifyTaskCopy') {
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

test('Vietnamese covers all dynamic source correction fields and the shared cancellation description', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/components/taskCopy.ts'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  const presets = new Map()
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'TASK_COPY') {
      const object = node.initializer.expression
      assert.ok(ts.isObjectLiteralExpression(object))
      for (const preset of object.properties) {
        assert.ok(ts.isPropertyAssignment(preset) && ts.isObjectLiteralExpression(preset.initializer))
        const fields = new Map()
        for (const property of preset.initializer.properties) {
          assert.ok(ts.isPropertyAssignment(property) && ts.isStringLiteralLike(property.initializer))
          fields.set(property.name.getText(ast), property.initializer.text)
        }
        presets.set(preset.name.getText(ast), fields)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  const fields = presets.get('scriptOptimize')
  assert.deepEqual([...fields.keys()].sort(), [
    'title', 'runningDescription', 'cancellingDescription', 'successDescription',
    'cancelledDescription', 'failedDescription', 'startedMessage', 'reusedMessage',
    'cancelledImmediatelyMessage', 'cancelRequestedMessage', 'runningMessage', 'cancellingMessage',
  ].sort())
  const shared = fields.get('cancellingDescription')
  assert.deepEqual([...presets].filter(([, preset]) => preset.get('cancellingDescription') === shared).map(([name]) => name).sort(),
    ['scriptSimplify', 'scriptOptimize', 'smartDetect', 'imageGeneration', 'videoGeneration', 'shotFramePrompt', 'shotFrameImage'].sort())
  const drawer = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const drawerAst = ts.createSourceFile(drawer, read(drawer), ts.ScriptTarget.Latest, true)
  const used = new Set()
  function visitDrawer(node) {
    if (ts.isCallExpression(node) && node.expression.getText(drawerAst) === 'uiText'
      && node.arguments[0] && ts.isPropertyAccessExpression(node.arguments[0])
      && node.arguments[0].expression.getText(drawerAst) === 'optimizeTaskCopy') {
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


test('Vietnamese covers Chapter source repair guard and error messages', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  const expected = [
    '读取一键优化结果失败', '一键优化失败', '一键优化失败：未返回有效内容',
    '取消一键优化任务失败', '检查依据已变化或为旧版检查，请重新检查',
    '请先进行原文一致性检查', '请先明确所选歧义的处理意见，或将其设为暂不确定',
    '请先选择已确认的原文异常', '检查结果已过期或为旧版检查，请重新检查后修复',
    '请先输入原文',
  ]
  const usage = new Map(expected.map(key => [key, 0]))
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && usage.has(node.arguments[0].text)) {
      const key = node.arguments[0].text
      usage.set(key, usage.get(key) + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual([...usage.entries()].filter(([, count]) => count > 1).sort(), [
    ['一键优化失败', 2], ['读取一键优化结果失败', 2], ['请先输入原文', 3],
  ].sort())
  assert.equal([...usage.values()].reduce((sum, count) => sum + count, 0), 14)
  assert.equal(usage.get('请先输入原文'), 3, 'shared by simplify, consistency and optimize')
  for (const key of expected) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual(expected.filter(key => vietnamese[key] === english[key]), [])
})

test('Vietnamese covers Chapter condensation result and cancellation messages', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const expected = new Map([
    ['读取智能精简结果失败', 2],
    ['智能精简失败', 2],
    ['智能精简失败：未返回有效内容', 1],
    ['智能精简完成', 1],
    ['取消智能精简任务失败', 1],
  ])
  const usage = new Map([...expected.keys()].map(key => [key, 0]))
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && usage.has(node.arguments[0].text)) {
      const key = node.arguments[0].text
      usage.set(key, usage.get(key) + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual(usage, expected)
  for (const key of expected.keys()) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual([...expected.keys()].filter(key => vietnamese[key] === english[key]), [])
})

test('Vietnamese covers Chapter consistency result and cancellation messages', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const expected = new Map([
    ['读取一致性检查结果失败', 2],
    ['发现 {{value1}} 个原文一致性问题', 1],
    ['未发现原文一致性问题', 2],
    ['取消一致性检查任务失败', 1],
  ])
  const usage = new Map([...expected.keys()].map(key => [key, 0]))
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && usage.has(node.arguments[0].text)) {
      const key = node.arguments[0].text
      usage.set(key, usage.get(key) + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual(usage, expected)
  for (const key of expected.keys()) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual([...expected.keys()].filter(key => vietnamese[key] === english[key]), [])
})

test('Vietnamese covers source repair decision and preview controls', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const drawer = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(drawer, read(drawer), ts.ScriptTarget.Latest, true)
  const expected = [
    '原文异常修复预览', '修改前', '修改后', '应用修复稿', '放弃建议', '生成修复建议', '取消优化',
    '原文异常，需要修复', '问题{{value1}}性质', '确认问题性质', '正常表述，需要解释', '正常，无需处理', '暂不确定',
  ]
  const used = new Set()
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && expected.includes(node.arguments[0].text)) used.add(node.arguments[0].text)
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual([...used].sort(), [...expected].sort())
  for (const key of expected) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
  }
  assert.deepEqual(expected.filter(key => vietnamese[key] === english[key]), [])
})

test('Vietnamese covers Chapter condensation discard and source replacement safeguards', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const expected = new Map([
    ['放弃精简结果', 'Bỏ kết quả tinh giản'],
    ['确认用精简稿替换当前原文？', 'Thay nguyên văn hiện tại bằng bản tinh giản?'],
    ['确认替换', 'Xác nhận thay thế'],
    ['用精简稿替换原文', 'Thay nguyên văn bằng bản tinh giản'],
    ['原文在精简后有修改，可重新精简。', 'Nguyên văn đã thay đổi sau khi tinh giản. Bạn có thể tinh giản lại.'],
    ['无法核对本次任务使用的原文，请对照当前原文后再采用。', 'Không thể xác minh nguyên văn mà tác vụ đã sử dụng. Hãy đối chiếu với nguyên văn hiện tại trước khi áp dụng.'],
  ])
  const usage = new Map([...expected.keys()].map(key => [key, 0]))
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && usage.has(node.arguments[0].text)) {
      const key = node.arguments[0].text
      usage.set(key, usage.get(key) + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual([...usage.values()], Array(expected.size).fill(1))
  for (const key of expected.keys()) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual([...expected.keys()].filter(key => vietnamese[key] === english[key]), [])
  for (const [key, value] of expected) assert.equal(vietnamese[key], value, key)
})

test('Vietnamese covers Chapter condensation result, retry and task controls', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const expected = new Map([
    ['精简中', [1, 'Đang tinh giản']],
    ['取消精简', [2, 'Hủy tinh giản']],
    ['精简结果', [2, 'Kết quả tinh giản']],
    ['精简内容', [6, 'Nội dung tinh giản']],
    ['当前原文', [2, 'Nguyên văn hiện tại']],
    ['重新精简', [2, 'Tinh giản lại']],
    ['重新精简将替换右侧精简内容', [1, 'Tinh giản lại sẽ thay thế nội dung tinh giản bên phải']],
  ])
  const usage = new Map([...expected.keys()].map(key => [key, 0]))
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && usage.has(node.arguments[0].text)) {
      const key = node.arguments[0].text
      usage.set(key, usage.get(key) + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual(usage, new Map([...expected].map(([key, [count]]) => [key, count])))
  for (const key of expected.keys()) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual([...expected.keys()].filter(key => vietnamese[key] === english[key]), [])
  for (const [key, [, value]] of expected) assert.equal(vietnamese[key], value, key)
})

test('Vietnamese covers Chapter consistency result headers and task controls', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const expected = new Map([
    ['上次检查', 'Lần kiểm tra gần nhất'],
    ['检查中', 'Đang kiểm tra'],
    ['原文一致性检查', 'Kiểm tra tính nhất quán của nguyên văn'],
    ['取消检查', 'Hủy kiểm tra'],
    ['原文一致性检查结果', 'Kết quả kiểm tra tính nhất quán của nguyên văn'],
    ['角色混淆检查结果（旧版）', 'Kết quả kiểm tra nhầm lẫn nhân vật (phiên bản cũ)'],
    ['发现问题', 'Phát hiện vấn đề'],
    ['无问题', 'Không có vấn đề'],
    ['问题：', 'Số vấn đề: '],
  ])
  const usage = new Map([...expected.keys()].map(key => [key, 0]))
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText'
      && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])
      && usage.has(node.arguments[0].text)) {
      const key = node.arguments[0].text
      usage.set(key, usage.get(key) + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual(usage, new Map([...expected.keys()].map(key => [key, 1])))
  for (const key of expected.keys()) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual([...expected.keys()].filter(key => vietnamese[key] === english[key]), [])
  for (const [key, value] of expected) assert.equal(vietnamese[key], value, key)
})

test('Vietnamese covers every finite Chapter consistency issue type and classification branch', () => {
  const english = catalog('en-US', 'ui')
  const vietnamese = catalog('vi-VN', 'ui')
  const file = 'pages/aiStudio/chapter/components/ChapterRawTextEditorDrawer.tsx'
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const maps = {
    issue_type: { language: '语言表达', semantics: '语义表达', character_confusion: '身份指代', spatial: '文字空间关系', action_time: '文字时序', prop_state: '道具描述', fact: '文本事实' },
    classification: { contradiction: '明确矛盾', ambiguity: '待确认歧义', optional: '可选补充' },
  }
  const fallbacks = { issue_type: '文字问题', classification: '待确认' }
  const expected = new Map([
    ['语言表达', 'Cách diễn đạt'],
    ['语义表达', 'Ngữ nghĩa'],
    ['身份指代', 'Danh tính và cách quy chiếu nhân vật'],
    ['文字空间关系', 'Quan hệ không gian theo văn bản'],
    ['文字时序', 'Trình tự thời gian trong văn bản'],
    ['道具描述', 'Mô tả đạo cụ'],
    ['文本事实', 'Dữ kiện trong văn bản'],
    ['文字问题', 'Vấn đề trong văn bản'],
    ['明确矛盾', 'Mâu thuẫn rõ ràng'],
    ['待确认歧义', 'Điểm mơ hồ cần xác nhận'],
    ['可选补充', 'Chi tiết bổ sung tùy chọn'],
    ['待确认', 'Chờ xác nhận'],
    ['· 问题', '· Vấn đề'],
  ])
  const found = new Map()
  let suffixCount = 0
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'uiText') {
      const arg = node.arguments[0]
      if (arg && ts.isStringLiteralLike(arg) && arg.text === '· 问题') suffixCount++
      if (arg && ts.isBinaryExpression(arg) && arg.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
        && ts.isElementAccessExpression(arg.left) && ts.isStringLiteralLike(arg.right)) {
        const selector = arg.left.argumentExpression
        if (ts.isBinaryExpression(selector) && ts.isPropertyAccessExpression(selector.left)
          && selector.left.expression.getText(ast) === 'it' && Object.hasOwn(maps, selector.left.name.text)) {
          const field = selector.left.name.text
          let obj = arg.left.expression
          while (ts.isParenthesizedExpression(obj) || ts.isAsExpression(obj)) obj = obj.expression
          assert.ok(ts.isObjectLiteralExpression(obj), field)
          assert.ok(!found.has(field), field)
          const entries = obj.properties.map(prop => {
            assert.ok(ts.isPropertyAssignment(prop) && ts.isStringLiteralLike(prop.initializer), field)
            return [prop.name.getText(ast), prop.initializer.text]
          })
          assert.deepEqual(Object.fromEntries(entries), maps[field])
          assert.equal(arg.right.text, fallbacks[field])
          found.set(field, true)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.deepEqual([...found.keys()].sort(), Object.keys(maps).sort())
  assert.equal(suffixCount, 1)
  assert.deepEqual([...expected.keys()].sort(), [...Object.values(maps).flatMap(Object.values), ...Object.values(fallbacks), '· 问题'].sort())
  for (const key of expected.keys()) {
    assert.ok(Object.hasOwn(english, key) && Object.hasOwn(vietnamese, key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(key), key)
    assert.deepEqual(tokens(vietnamese[key]), tokens(english[key]), key)
  }
  assert.deepEqual([...expected.keys()].filter(key => vietnamese[key] === english[key]), [])
  for (const [key, value] of expected) assert.equal(vietnamese[key], value, key)
})
