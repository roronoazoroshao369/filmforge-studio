import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

// Deliberately synthetic, read-only data. Never load a project ID through the studio API.
const project = {
  id: 'demo-project-01',
  title: 'Light and motion study',
  scene: { id: 'demo-scene-01', title: '01 · Establishing scene' },
  shot: { id: 'demo-shot-01', sceneId: 'demo-scene-01', title: '01A · Motion test', durationMs: 2000 },
  asset: { id: 'demo-asset-01', shotId: 'demo-shot-01', title: 'Synthetic reference frame', src: '/demo-media/reference.png' },
  take: { id: 'demo-take-01', shotId: 'demo-shot-01', assetId: 'demo-asset-01', src: '/demo-media/fixture.mp4' },
} as const

function MediaPreview() {
  const [clipFailed, setClipFailed] = useState(false)
  const [referenceFailed, setReferenceFailed] = useState(false)
  return <div className="grid min-w-0 gap-5 md:grid-cols-2">
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="demo-reference" data-asset-id={project.asset.id} data-shot-id={project.asset.shotId}>
      <h2 id="demo-reference" className="text-lg font-semibold">Reference asset</h2>
      <p className="mt-1 text-sm text-slate-600">{project.asset.title}</p>
      <p className="mb-3 break-all font-mono text-xs text-slate-500">{project.asset.id}</p>
      {referenceFailed
        ? <p role="alert" className="rounded bg-amber-50 p-3 text-amber-900">Synthetic reference unavailable.</p>
        : <img src={project.asset.src} alt="Generated color and motion test reference frame" width={320} height={180}
            onError={() => setReferenceFailed(true)} className="aspect-video w-full rounded bg-slate-900 object-contain" />}
      <p className="mt-3 text-sm text-slate-600">Generated locally from the test clip; no third-party artwork.</p>
    </section>
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="demo-take" data-take-id={project.take.id} data-shot-id={project.take.shotId} data-reference-asset-id={project.take.assetId}>
      <h2 id="demo-take" className="text-lg font-semibold">Candidate Take</h2>
      <p className="mt-1 text-sm text-slate-600">Unreviewed · 2 seconds · 16:9</p>
      <p className="mb-3 break-all font-mono text-xs text-slate-500">{project.take.id}</p>
      {clipFailed
        ? <p role="alert" className="rounded bg-amber-50 p-3 text-amber-900">Synthetic clip unavailable.</p>
        : <video controls playsInline preload="auto" width={320} height={180}
            aria-label="Synthetic candidate Take" src={project.take.src} onError={() => setClipFailed(true)}
            className="aspect-video w-full rounded bg-slate-900 object-contain" />}
      <p className="mt-3 text-sm text-slate-600">Preview only. This Take is not approved, adopted into a Cut or exported.</p>
    </section>
  </div>
}

export default function FilmForgeDemoPage() {
  const { projectId } = useParams()
  const missing = projectId !== undefined && projectId !== project.id
  return <main lang="en" className="h-full overflow-auto bg-slate-100 text-slate-900">
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-800">Read-only · Synthetic fixture</p>
        <h1 className="text-2xl font-bold sm:text-3xl">DEMO — FilmForge Studio</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">A local test project for the scene → reference → Take workflow. No real projects, model calls or production writes.</p>
      </header>
      {missing ? <section role="alert" className="rounded-lg border border-amber-200 bg-white p-5">
        <p className="font-semibold">Demo project not found.</p>
        <Link to="/demo" className="mt-3 inline-block text-blue-800 underline">Open demo project</Link>
      </section> : <>
        <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5" aria-labelledby="demo-project">
          <h2 id="demo-project" className="text-lg font-semibold">{project.title}</h2>
          <p className="mt-1 break-all font-mono text-xs text-slate-500">{project.id}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div data-scene-id={project.scene.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scene</p>
              <p className="mt-1 font-medium">{project.scene.title}</p>
              <p className="break-all font-mono text-xs text-slate-500">{project.scene.id}</p>
            </div>
            <div data-shot-id={project.shot.id} data-scene-id={project.shot.sceneId}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shot</p>
              <p className="mt-1 font-medium">{project.shot.title}</p>
              <p className="break-all font-mono text-xs text-slate-500">{project.shot.id}</p>
            </div>
          </div>
        </section>
        <MediaPreview />
        <p className="mt-5 text-xs text-slate-600">Demo boundary: no task submission, no edit controls, no final master. All media is synthetic.</p>
      </>}
    </div>
  </main>
}
