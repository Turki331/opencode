import { useEffect, useState } from 'react'
import { Card } from './components/ui/Card'
import { DataTable } from './components/ui/DataTable'
import { Drawer } from './components/ui/Drawer'
import { ProgressStages } from './components/ui/ProgressStages'
import { StatCard } from './components/ui/StatCard'
import { ToastHost, type ToastItem } from './components/ui/Toast'
import { ZoneBadge, type Zone } from './components/ui/ZoneBadge'

interface SampleRow {
  metric: string
  actual: string
  zone: Zone
}

const sampleRows: readonly SampleRow[] = [
  { metric: 'Order fulfilment speed', actual: '52%', zone: 'RED' },
  { metric: 'Customer retention', actual: '84%', zone: 'GREEN' },
]

const sampleColumns = [
  { key: 'metric', header: 'KPI' },
  { key: 'actual', header: 'Actual' },
  {
    key: 'zone',
    header: 'Zone',
    render: (row: SampleRow) => <ZoneBadge value={row.zone} zone={row.zone} />,
  },
] as const

function ScratchRoute() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toastNumber, setToastNumber] = useState(1)
  const [toasts, setToasts] = useState<ToastItem[]>([
    { id: 'toast-1', message: 'Design system loaded for review.' },
  ])

  function showToast() {
    const nextNumber = toastNumber + 1
    setToastNumber(nextNumber)
    setToasts((current) => [
      ...current,
      { id: `toast-${nextNumber}`, message: 'Action ready for review.' },
    ])
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return (
    <main className="scratch-page" aria-label="UI primitive scratch route">
      <header className="scratch-header">
        <div>
          <h1>Autonomous Strategy OS</h1>
          <p>WP-02 design tokens and UI primitives</p>
        </div>
        <a className="scratch-link" href="#/">
          Return to home
        </a>
      </header>

      <div className="scratch-grid">
        <Card
          header={
            <>
              <h2>Card</h2>
              <p>Surface, rule border and optional header slot</p>
            </>
          }
        >
          <p>
            Shared surfaces keep the five screens quiet and consistent. There
            are no shadows or decorative treatments here.
          </p>
        </Card>

        <Card
          header={
            <>
              <h2>ZoneBadge</h2>
              <p>Status colors are reserved for KPI status</p>
            </>
          }
        >
          <div className="scratch-actions">
            <ZoneBadge value="84%" zone="GREEN" />
            <ZoneBadge value="67%" zone="YELLOW" />
            <ZoneBadge value="52%" zone="RED" />
          </div>
        </Card>

        <StatCard label="Active objectives" value="12" />
        <StatCard label="Warehouse fulfilment speed" value="52%" zone="RED" />

        <Card
          className="scratch-wide"
          header={
            <>
              <h2>DataTable</h2>
              <p>Horizontal overflow keeps dense tables usable</p>
            </>
          }
        >
          <DataTable
            columns={sampleColumns}
            rows={sampleRows}
            rowKey={(row) => row.metric}
          />
        </Card>

        <Card
          header={
            <>
              <h2>ProgressStages</h2>
              <p>Determinate progress for simulated processing</p>
            </>
          }
        >
          <ProgressStages
            label="Extracting objectives, KPIs and owners"
            progress={0.62}
            stageCount={4}
            stageIndex={2}
          />
        </Card>

        <Card
          header={
            <>
              <h2>Drawer and Toast</h2>
              <p>Keyboard-operable overlays with reduced-motion support</p>
            </>
          }
        >
          <div className="scratch-actions">
            <button
              className="scratch-button"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              Open drawer
            </button>
            <button
              className="scratch-button"
              onClick={showToast}
              type="button"
            >
              Show toast
            </button>
          </div>
        </Card>
      </div>

      <Drawer
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title="Primitive drawer"
      >
        <p>
          Focus stays inside this panel while it is open. Press Escape or use
          the close button to return to the trigger.
        </p>
        <button
          className="scratch-button"
          onClick={() => setDrawerOpen(false)}
          type="button"
        >
          Close drawer
        </button>
      </Drawer>
      <ToastHost onDismiss={dismissToast} toasts={toasts} />
    </main>
  )
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (hash === '#/scratch' || hash === '') {
    return <ScratchRoute />
  }

  return (
    <main className="scratch-page" aria-label="Autonomous Strategy OS">
      <h1>Autonomous Strategy OS</h1>
      <p>Foundation scaffold ready.</p>
      <a className="scratch-link" href="#/scratch">
        Open UI primitive scratch route
      </a>
    </main>
  )
}
