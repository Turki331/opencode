import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { selectPendingProposalCount, useDemoStore } from '../../store/demoStore'

export function NotificationBell() {
  const navigate = useNavigate()
  const pendingCount = useDemoStore(selectPendingProposalCount)

  return (
    <button
      aria-label={`${pendingCount} decisions awaiting you`}
      className="notification-bell"
      onClick={() => navigate('/agents')}
      type="button"
    >
      <Bell aria-hidden="true" size={19} />
      {pendingCount > 0 ? (
        <span
          className="notification-count"
          aria-label={`${pendingCount} pending`}
        >
          {pendingCount}
        </span>
      ) : null}
    </button>
  )
}
