import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useEffect } from 'react'
import { AppShell } from './components/shell/AppShell'
import { Boardroom } from './screens/Boardroom/Boardroom'
import { AgentCenter } from './screens/AgentCenter/AgentCenter'
import { Intake } from './screens/Intake/Intake'
import { ManagerHub } from './screens/ManagerHub/ManagerHub'
import { Governance } from './screens/Governance/Governance'
import { StoreScratch } from './demo/StoreScratch'
import { chapterSeeds, parseChapter } from './demo/script'
import {
  canAccessRoute,
  landingPathByRole,
  navigationItems,
  type NavigationItem,
} from './components/shell/navigation'
import { useDemoStore } from './store/demoStore'
import { Card } from './components/ui/Card'
import type { ReactNode } from 'react'

function ScreenRoute({
  item,
  screen,
}: {
  item: NavigationItem
  screen?: ReactNode
}) {
  const role = useDemoStore((state) => state.role)

  if (!canAccessRoute(role, item.path)) {
    return <Navigate replace to={landingPathByRole[role]} />
  }

  if (screen) {
    return screen
  }

  return (
    <section className="screen-section" aria-labelledby="screen-title">
      <div className="screen-heading">
        <span className="screen-eyebrow">Autonomous Strategy OS</span>
        <h1 id="screen-title">{item.label}</h1>
      </div>
      <Card>
        <div className="screen-placeholder">
          <span className="screen-placeholder-kicker">Screen placeholder</span>
          <p>This screen is reserved for the next implementation step.</p>
        </div>
      </Card>
    </section>
  )
}

function LandingRedirect() {
  const role = useDemoStore((state) => state.role)

  return <Navigate replace to={landingPathByRole[role]} />
}

function SeedRoute() {
  const { chapter: chapterParam } = useParams<{ chapter: string }>()
  const navigate = useNavigate()
  const seed = useDemoStore((state) => state.seed)

  useEffect(() => {
    const chapter = parseChapter(chapterParam) ?? 'PRE_INGEST'
    seed(chapter)
    navigate(chapterSeeds[chapter].naturalPath, { replace: true })
  }, [chapterParam, navigate, seed])

  return (
    <section className="screen-section" aria-label="Preparing demo chapter">
      <Card>
        <div className="screen-placeholder">
          <span className="screen-placeholder-kicker">Demo controls</span>
          <p>Preparing the selected chapter.</p>
        </div>
      </Card>
    </section>
  )
}

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route element={<StoreScratch />} path="/scratch" />
          <Route element={<SeedRoute />} path="/seed/:chapter" />
          {navigationItems.map((item) => (
            <Route
              element={
                <ScreenRoute
                  item={item}
                  screen={
                    item.path === '/boardroom' ? (
                      <Boardroom />
                    ) : item.path === '/agents' ? (
                      <AgentCenter />
                    ) : item.path === '/intake' ? (
                      <Intake />
                    ) : item.path === '/hub' ? (
                      <ManagerHub />
                    ) : item.path === '/governance' ? (
                      <Governance />
                    ) : undefined
                  }
                />
              }
              key={item.path}
              path={item.path}
            />
          ))}
          <Route element={<LandingRedirect />} path="*" />
        </Route>
      </Routes>
    </HashRouter>
  )
}
