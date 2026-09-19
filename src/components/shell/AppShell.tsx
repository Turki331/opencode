import { Outlet } from 'react-router-dom'
import { ToastHost } from '../ui/Toast'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'
import { DemoControls } from '../../demo/DemoControls'
import { useDemoStore } from '../../store/demoStore'

export function AppShell() {
  const toasts = useDemoStore((state) => state.toasts)
  const dismissToast = useDemoStore((state) => state.dismissToast)

  return (
    <div className="app-shell">
      <TopBar />
      <div className="shell-body">
        <SideNav />
        <main className="shell-main">
          <Outlet />
        </main>
      </div>
      <DemoControls />
      <ToastHost onDismiss={dismissToast} toasts={toasts} />
    </div>
  )
}
