import { NavLink } from 'react-router-dom'
import { useDemoStore } from '../../store/demoStore'
import { navigationItems } from './navigation'

export function SideNav() {
  const role = useDemoStore((state) => state.role)
  const visibleItems = navigationItems.filter((item) =>
    item.allowedRoles.includes(role),
  )

  return (
    <nav className="side-nav" aria-label="Primary navigation">
      <span className="side-nav-heading">Workspace</span>
      <div className="side-nav-items">
        {visibleItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'side-nav-link active' : 'side-nav-link'
              }
              key={item.path}
              to={item.path}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
