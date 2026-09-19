import type { StrategicKPI } from '../store/types'

const sarFormatter = new Intl.NumberFormat('en-US')
const demoTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})
const demoDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const auditTimestampFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatSar(value: number | null) {
  return value === null ? 'Uncapped' : `SAR ${sarFormatter.format(value)}`
}

export function formatMetricValue(value: number, unit: StrategicKPI['unit']) {
  if (unit === '%') {
    return `${value}%`
  }

  if (unit === 'SAR') {
    return formatSar(value)
  }

  if (unit === 'days') {
    return `${value} days`
  }

  return String(value)
}

export function formatDemoTime(timestamp: string) {
  return demoTimeFormatter.format(new Date(timestamp))
}

export function formatDemoDate(date: string) {
  return demoDateFormatter.format(new Date(`${date}T00:00:00Z`))
}

export function formatAuditTimestamp(timestamp: string) {
  return auditTimestampFormatter.format(new Date(timestamp))
}
