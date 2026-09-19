import { NotificationBell } from './NotificationBell'
import { RoleSwitcher } from './RoleSwitcher'

export function TopBar() {
  return (
    <header className="top-bar">
      <div className="product-mark" aria-label="Autonomous Strategy OS">
        <span className="product-mark-name">Autonomous Strategy OS</span>
        <span className="agent-status">
          <span className="agent-status-dot" aria-hidden="true" />
          Agent mode active
        </span>
      </div>
      <div className="top-bar-actions">
        <RoleSwitcher />
        <NotificationBell />
      </div>
    </header>
  )
}
