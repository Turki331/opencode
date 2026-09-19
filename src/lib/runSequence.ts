export interface SequenceStep {
  label: string
  durationMs: number
  onEnter?: () => void
}

export interface SequenceTick {
  stage: number
  label: string
  progress: number
}

interface RafFrame {
  kind: 'raf'
  id: number
}

interface TimeoutFrame {
  kind: 'timeout'
  id: ReturnType<typeof setTimeout>
}

type FrameHandle = RafFrame | TimeoutFrame

interface SequenceController {
  cancelled: boolean
  cancel: () => void
}

const activeSequences = new Set<SequenceController>()

function scheduleFrame(callback: FrameRequestCallback): FrameHandle {
  if (typeof requestAnimationFrame === 'function') {
    return { kind: 'raf', id: requestAnimationFrame(callback) }
  }

  return {
    kind: 'timeout',
    id: setTimeout(() => callback(performance.now()), 16),
  }
}

function cancelFrame(frame: FrameHandle) {
  if (frame.kind === 'raf') {
    cancelAnimationFrame(frame.id)
  } else {
    clearTimeout(frame.id)
  }
}

export function runSequence(
  steps: SequenceStep[],
  onTick: (state: SequenceTick) => void,
): Promise<void> {
  if (steps.length === 0) {
    return Promise.resolve()
  }

  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const durations = steps.map((step) =>
    reducedMotion ? 0 : Math.max(0, step.durationMs),
  )
  const totalDuration = durations.reduce(
    (total, duration) => total + duration,
    0,
  )
  let resolveSequence: () => void = () => undefined
  let rejectSequence: (reason: unknown) => void = () => undefined
  let settled = false
  let frame: FrameHandle | null = null
  let stepTimer: ReturnType<typeof setTimeout> | null = null
  let completedDuration = 0
  let stepIndex = 0

  const clearScheduledWork = () => {
    if (frame) {
      cancelFrame(frame)
      frame = null
    }
    if (stepTimer) {
      clearTimeout(stepTimer)
      stepTimer = null
    }
  }

  const settle = (error?: unknown) => {
    if (settled) {
      return
    }

    settled = true
    clearScheduledWork()
    activeSequences.delete(controller)

    if (error) {
      rejectSequence(error)
    } else {
      resolveSequence()
    }
  }

  const controller: SequenceController = {
    cancelled: false,
    cancel: () => {
      controller.cancelled = true
      settle()
    },
  }

  const promise = new Promise<void>((resolve, reject) => {
    resolveSequence = resolve
    rejectSequence = reject
  })

  const emitProgress = (label: string, stage: number, progress: number) => {
    onTick({
      stage,
      label,
      progress: totalDuration === 0 ? 1 : Math.min(1, progress),
    })
  }

  const enterStep = (index: number): void => {
    if (controller.cancelled || settled) {
      return
    }

    const step = steps[index]

    if (!step) {
      emitProgress(steps[steps.length - 1]?.label ?? '', steps.length, 1)
      settle()
      return
    }

    stepIndex = index
    step.onEnter?.()
    emitProgress(
      step.label,
      index + 1,
      completedDuration / Math.max(1, totalDuration),
    )

    const duration = durations[index] ?? 0

    if (duration === 0) {
      enterStep(index + 1)
      return
    }

    const stepStartedAt = performance.now()
    let stepFinished = false

    const finishStep = () => {
      if (stepFinished || controller.cancelled || settled) {
        return
      }

      stepFinished = true
      if (frame) {
        cancelFrame(frame)
        frame = null
      }
      if (stepTimer) {
        clearTimeout(stepTimer)
        stepTimer = null
      }
      completedDuration += duration
      emitProgress(step.label, index + 1, completedDuration / totalDuration)
      enterStep(index + 1)
    }

    const animate = (now: number) => {
      if (controller.cancelled || settled || stepFinished) {
        return
      }

      const elapsed = Math.min(duration, Math.max(0, now - stepStartedAt))
      emitProgress(
        step.label,
        index + 1,
        (completedDuration + elapsed) / totalDuration,
      )

      if (elapsed >= duration) {
        finishStep()
      } else {
        frame = scheduleFrame(animate)
      }
    }

    stepTimer = setTimeout(finishStep, duration)
    frame = scheduleFrame(animate)
  }

  activeSequences.add(controller)

  try {
    enterStep(stepIndex)
  } catch (error) {
    settle(error)
  }

  return promise
}

export function cancelAllSequences() {
  for (const sequence of [...activeSequences]) {
    sequence.cancel()
  }
}
