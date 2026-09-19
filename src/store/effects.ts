import type { Initiative, StrategicKPI, StateEffect, Task } from './types'

export interface EffectState {
  kpis: StrategicKPI[]
  tasks: Task[]
  initiatives: Initiative[]
  delegations: { personId: string; amount: number; ruleId: string }[]
}

export interface EffectAudit {
  action: string
  entity: string
  previousState: string | null
  newState: string | null
}

export function applyEffect(
  state: EffectState,
  effect: StateEffect,
): { next: EffectState; audit: EffectAudit } {
  switch (effect.kind) {
    case 'KPI_FORECAST': {
      const kpi = state.kpis.find((item) => item.id === effect.kpiId)
      const previousValue = kpi
        ? `${kpi.forecast ?? kpi.actual} / ${kpi.zone}`
        : null

      return {
        next: {
          ...state,
          kpis: state.kpis.map((item) =>
            item.id === effect.kpiId
              ? { ...item, forecast: effect.to, zone: effect.toZone }
              : item,
          ),
        },
        audit: {
          action: 'KPI forecast updated',
          entity: effect.kpiId,
          previousState: previousValue,
          newState: `${effect.to} / ${effect.toZone}`,
        },
      }
    }
    case 'TASK_CREATE':
      return {
        next: {
          ...state,
          tasks: [...state.tasks, { ...effect.task, evidence: null }],
        },
        audit: {
          action: 'Task created',
          entity: effect.task.id,
          previousState: null,
          newState: effect.task.status,
        },
      }
    case 'TASK_STATUS': {
      const task = state.tasks.find((item) => item.id === effect.taskId)

      return {
        next: {
          ...state,
          tasks: state.tasks.map((item) =>
            item.id === effect.taskId ? { ...item, status: effect.to } : item,
          ),
        },
        audit: {
          action: 'Task status updated',
          entity: effect.taskId,
          previousState: task?.status ?? null,
          newState: effect.to,
        },
      }
    }
    case 'INITIATIVE_STATUS': {
      const initiative = state.initiatives.find(
        (item) => item.id === effect.initiativeId,
      )

      return {
        next: {
          ...state,
          initiatives: state.initiatives.map((item) =>
            item.id === effect.initiativeId
              ? { ...item, status: effect.to }
              : item,
          ),
        },
        audit: {
          action: 'Initiative status updated',
          entity: effect.initiativeId,
          previousState: initiative?.status ?? null,
          newState: effect.to,
        },
      }
    }
    case 'BUDGET_DELEGATE':
      return {
        next: {
          ...state,
          delegations: [
            ...state.delegations,
            {
              personId: effect.toPersonId,
              amount: effect.amount,
              ruleId: effect.ruleId,
            },
          ],
        },
        audit: {
          action: 'Budget delegated',
          entity: effect.toPersonId,
          previousState: null,
          newState: `SAR ${effect.amount.toLocaleString('en-US')} / ${effect.ruleId}`,
        },
      }
  }
}
