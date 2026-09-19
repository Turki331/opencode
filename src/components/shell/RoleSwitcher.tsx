import { useDemoStore } from '../../store/demoStore'
import type { Role } from '../../store/types'

interface Persona {
  role: Role
  name: string
  title: string
}

const personas: readonly Persona[] = [
  {
    role: 'EXECUTIVE',
    name: 'Faisal Al-Harbi',
    title: 'C-Suite Executive / Board',
  },
  {
    role: 'MANAGER',
    name: 'Sara Al-Mahmoud',
    title: 'Department Manager · Head of Operations',
  },
  {
    role: 'CONSULTANT',
    name: 'Maayish Advisory',
    title: 'Strategy Consultant',
  },
]

export function RoleSwitcher() {
  const role = useDemoStore((state) => state.role)
  const setRole = useDemoStore((state) => state.setRole)
  const sequenceActive = useDemoStore(
    (state) =>
      Boolean(state.pipeline) ||
      Boolean(state.verifying) ||
      Boolean(state.resolving) ||
      state.provisioning,
  )

  return (
    <label className="role-switcher">
      <span className="role-switcher-label">Viewing as</span>
      <select
        aria-label="Switch persona"
        disabled={sequenceActive}
        onChange={(event) => setRole(event.target.value as Role)}
        title={
          sequenceActive
            ? 'Role switching is paused while work is active.'
            : undefined
        }
        value={role}
      >
        {personas.map((persona) => (
          <option key={persona.role} value={persona.role}>
            {persona.name} · {persona.title}
          </option>
        ))}
      </select>
    </label>
  )
}
