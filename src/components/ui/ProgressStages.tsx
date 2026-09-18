interface ProgressStagesProps {
  label: string
  progress: number
  stageIndex: number
  stageCount: number
}

export function ProgressStages({
  label,
  progress,
  stageIndex,
  stageCount,
}: ProgressStagesProps) {
  const percentage = Math.min(1, Math.max(0, progress)) * 100

  return (
    <section className="progress-stages" aria-label="Progress">
      <div className="progress-stages-header">
        <span className="progress-stages-label">{label}</span>
        <span className="progress-stages-counter">
          Stage {stageIndex} of {stageCount}
        </span>
      </div>
      <div
        aria-label={`${Math.round(percentage)} percent complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percentage}
        className="progress-stages-track"
        role="progressbar"
      >
        <div
          className="progress-stages-value"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  )
}
