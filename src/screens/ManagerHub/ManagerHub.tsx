import { FileUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { formatDemoDate } from '../../lib/format'
import { selectManagerTasks, useDemoStore } from '../../store/demoStore'
import type { Task } from '../../store/types'

function taskStatusLabel(status: Task['status']) {
  return status.replace(/_/g, ' ')
}

export function ManagerHub() {
  const tasks = useDemoStore(selectManagerTasks)
  const initiatives = useDemoStore((state) => state.initiatives)
  const verifying = useDemoStore((state) => state.verifying)
  const submitEvidence = useDemoStore((state) => state.submitEvidence)
  const q3Task = tasks.find((task) => task.id === 'task-q3-logistics-audit')
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFileName, setPendingFileName] = useState<string | null>(null)

  useEffect(() => {
    if (!q3Task?.evidence && !verifying) {
      setPendingFileName(null)
    }
  }, [q3Task?.evidence, verifying])

  function startVerification(fileName: string) {
    if (!q3Task || q3Task.status === 'VERIFIED' || verifying) {
      return
    }

    setPendingFileName(fileName)
    void submitEvidence(q3Task.id, fileName)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      startVerification(file.name)
    }
  }

  return (
    <section className="screen-section manager-hub" aria-labelledby="hub-title">
      <div className="screen-heading">
        <span className="screen-eyebrow">Manager workspace</span>
        <h1 id="hub-title">Manager Execution Hub</h1>
        <p className="manager-heading-subtitle">
          Sara Al-Mahmoud · Head of Operations
        </p>
      </div>

      <div className="manager-task-list">
        {tasks.map((task) => {
          const initiative = initiatives.find(
            (item) => item.id === task.initiativeId,
          )
          const isNew = task.id === 'task-q4-secondary-provider'
          const isQ3 = task.id === 'task-q3-logistics-audit'

          return (
            <Card
              className={`manager-task-card${isNew ? ' manager-task-new' : ''}`}
              key={task.id}
            >
              <div className="manager-task-header">
                <div>
                  {isNew ? (
                    <span className="manager-task-new-label">
                      New from approved action
                    </span>
                  ) : null}
                  <h2>{task.title}</h2>
                </div>
                <span className="manager-task-status">
                  {taskStatusLabel(task.status)}
                </span>
              </div>
              <div className="manager-task-meta">
                <span>Due {formatDemoDate(task.dueDate)}</span>
                <span>Requirement {task.requirementRef}</span>
                <span>{initiative?.title ?? 'Initiative not linked'}</span>
              </div>

              {isQ3 ? (
                <div className="evidence-verification">
                  {verifying === task.id ? (
                    <div className="evidence-verifying" aria-live="polite">
                      Evidence verification agent: checking document structure,
                      signatures and requirement coverage
                    </div>
                  ) : task.evidence?.verdict ? (
                    <div className="evidence-verified" aria-live="polite">
                      <strong>Verified</strong>
                      <span>{task.evidence.verdict}</span>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`evidence-dropzone${isDragging ? ' evidence-dropzone-active' : ''}`}
                        onDragEnter={(event) => {
                          event.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={(event) => {
                          event.preventDefault()
                          setIsDragging(false)
                        }}
                        onDragOver={(event) => {
                          event.preventDefault()
                          setIsDragging(true)
                        }}
                        onDrop={handleDrop}
                      >
                        <FileUp aria-hidden="true" size={20} />
                        <span>Drop a completion document here</span>
                        <input
                          accept=".pdf,application/pdf"
                          className="evidence-file-input"
                          id="q3-evidence-file"
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0]
                            event.currentTarget.value = ''
                            if (file) {
                              startVerification(file.name)
                            }
                          }}
                          type="file"
                        />
                        <label htmlFor="q3-evidence-file">Choose file</label>
                      </div>
                      <button
                        className="evidence-prepared-button"
                        onClick={() =>
                          startVerification(
                            'Q3_Logistics_Audit_Verification.pdf',
                          )
                        }
                        type="button"
                      >
                        {pendingFileName ??
                          'Attach Q3_Logistics_Audit_Verification.pdf'}
                      </button>
                    </>
                  )}
                </div>
              ) : task.evidence?.verdict ? (
                <div className="task-evidence-summary">
                  {task.evidence.verdict}
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
