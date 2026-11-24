import assert from 'node:assert/strict'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer, preview } from 'vite'
import { browserCleanup, browserOutput } from './browser-runtime.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const output = await browserOutput('filmforge-demo-')
const port = 4897
const origin = process.env.FILMFORGE_DEMO_ORIGIN || 'http://127.0.0.1:' + port
let browser, server
const cleanup = browserCleanup(() => ({ browser, server: server && ('close' in server ? server : { close: () => new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())) }) }))
const forbidden = []
const errors = []
try {
  if (!process.env.FILMFORGE_DEMO_ORIGIN) {
    server = process.env.FILMFORGE_DEMO_BUILD === '1'
      ? await preview({ root, preview: { host: '127.0.0.1', port, strictPort: true, open: false } })
      : await createServer({ root, cacheDir: join(output, 'vite-cache'),
        server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false, watch: { ignored: ['**/*'] } } })
    if (!process.env.FILMFORGE_DEMO_BUILD) await server.listen()
  }
  browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL })
  for (const [width, height] of [[1366, 768], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' })
    const page = await context.newPage()
    page.setDefaultTimeout(12000)
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', route => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.origin !== origin || (url.pathname === '/api' || url.pathname.startsWith('/api/')) || !['GET', 'HEAD'].includes(request.method())) {
        forbidden.push(request.method() + ' ' + url.pathname)
        return route.abort()
      }
      return route.continue()
    })
    const response = await page.goto(origin + '/demo', { waitUntil: 'domcontentloaded' })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { name: 'DEMO — FilmForge Studio' }).waitFor()
    await page.getByText('demo-project-01', { exact: true }).waitFor()
    await page.getByText('demo-scene-01', { exact: true }).waitFor()
    await page.getByText('demo-shot-01', { exact: true }).waitFor()
    await page.getByText('demo-asset-01', { exact: true }).waitFor()
    await page.getByText('demo-take-01', { exact: true }).waitFor()
    assert.equal(await page.locator('[data-shot-id="demo-shot-01"][data-scene-id="demo-scene-01"]').count(), 1)
    assert.equal(await page.locator('[data-asset-id="demo-asset-01"][data-shot-id="demo-shot-01"]').count(), 1)
    assert.equal(await page.locator('[data-take-id="demo-take-01"][data-shot-id="demo-shot-01"][data-reference-asset-id="demo-asset-01"]').count(), 1)
    const video = page.locator('video')
    await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2)
    assert.equal(await video.evaluate(v => v.duration), 2)
    assert.equal(await video.evaluate(v => v.videoWidth), 320)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(await page.locator('main').evaluate(el => el.scrollWidth <= el.clientWidth), true)
    await page.screenshot({ path: join(output, 'demo-' + width + '.png'), fullPage: true })
    await page.goto(origin + '/demo/demo-project-01', { waitUntil: 'domcontentloaded' })
    await page.getByText('demo-project-01', { exact: true }).waitFor()
    await page.goto(origin + '/demo/missing', { waitUntil: 'domcontentloaded' })
    await page.getByRole('alert').getByText('Demo project not found.').waitFor()
    await page.getByRole('link', { name: 'Open demo project' }).click()
    await page.getByRole('heading', { name: 'DEMO — FilmForge Studio' }).waitFor()
    await page.route('**/demo-media/fixture.mp4', route => route.abort())
    await page.reload()
    await page.getByRole('alert').getByText('Synthetic clip unavailable.').waitFor()
    await page.route('**/demo-media/reference.png', route => route.abort())
    await page.reload()
    await page.getByRole('alert').getByText('Synthetic reference unavailable.').waitFor()
    await context.close()
  }
  assert.deepEqual(forbidden, [], 'demo must not request external/admin/provider routes or write')
  assert.deepEqual(errors, [], 'uncaught page errors')
  console.log('PASS demo desktop/mobile, media, missing project, media error, zero forbidden requests/page errors')
} finally {
  await cleanup()
}
