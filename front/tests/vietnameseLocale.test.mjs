import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

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
