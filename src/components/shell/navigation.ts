import type { LucideIcon } from 'lucide-react'
import { Bot, FileText, LayoutDashboard, Scale, Target } from 'lucide-react'
import type { Role } from '../../store/types'

export type AppRoutePath =
  '/intake' | '/boardroom' | '/hub' | '/agents' | '/governance'

export interface NavigationItem {
  path: AppRoutePath
  label: string
  icon: LucideIcon
  allowedRoles: readonly Role[]
}

export const navigationItems: readonly NavigationItem[] = [
  {
    path: '/intake',
    label: 'Document Intake',
    icon: FileText,
    allowedRoles: ['EXECUTIVE', 'CONSULTANT'],
  },
  {
    path: '/boardroom',
    label: 'Executive Boardroom',
    icon: LayoutDashboard,
    allowedRoles: ['EXECUTIVE', 'MANAGER', 'CONSULTANT'],
  },
  {
    path: '/hub',
    label: 'Manager Execution Hub',
    icon: Target,
    allowedRoles: ['EXECUTIVE', 'MANAGER'],
  },
  {
    path: '/agents',
    label: 'AI Agent Command Centre',
    icon: Bot,
    allowedRoles: ['EXECUTIVE', 'MANAGER', 'CONSULTANT'],
  },
  {
    path: '/governance',
    label: 'Matrix of Powers & Audit Log',
    icon: Scale,
    allowedRoles: ['EXECUTIVE'],
  },
]

export const landingPathByRole: Record<Role, AppRoutePath> = {
  EXECUTIVE: '/boardroom',
  MANAGER: '/hub',
  CONSULTANT: '/intake',
}

export function canAccessRoute(role: Role, path: AppRoutePath) {
  return (
    navigationItems
      .find((item) => item.path === path)
      ?.allowedRoles.includes(role) ?? false
  )
}
