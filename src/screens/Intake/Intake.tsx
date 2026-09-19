import { FileText, FileUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { ProgressStages } from '../../components/ui/ProgressStages'
import { ExtractionTree } from './ExtractionTree'
import { selectIngestionStages, useDemoStore } from '../../store/demoStore'

const INGESTION_TOTAL_MS = 4200
const CHUNKING_START_MS = 1000
const CHUNKING_DURATION_MS = 1500

export function Intake() {
  const navigate = useNavigate()
  const document = useDemoStore((state) => state.documents[0])
  const chapter = useDemoStore((state) => state.chapter)
  const pipeline = useDemoStore((state) => state.pipeline)
  const stageLabels = useDemoStore(selectIngestionStages)
  const ingestDocument = useDemoStore((state) => state.ingestDocument)
  const provisioning = useDemoStore((state) => state.provisioning)
  const provisionWorkspace = useDemoStore((state) => state.provisionWorkspace)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFileName, setPendingFileName] = useState<string | null>(null)

  const isBusy = Boolean(pipeline) || Boolean(document?.ingestedAt)
  const visibleFileName = document?.ingestedAt
    ? document.fileName
    : pendingFileName
  const chunkTarget = document?.chunkCount ?? 0
  const chunkProgress = pipeline
    ? pipeline.stage > 2
      ? 1
      : Math.min(
          1,
          Math.max(
            0,
            (pipeline.progress * INGESTION_TOTAL_MS - CHUNKING_START_MS) /
              CHUNKING_DURATION_MS,
          ),
        )
    : 0
  const chunkCount = Math.round(chunkProgress * chunkTarget)

  useEffect(() => {
    if (chapter === 'PRE_INGEST' && !pipeline && !document?.ingestedAt) {
      setPendingFileName(null)
    }
  }, [chapter, document?.ingestedAt, pipeline])

  function startIngestion(file?: File) {
    if (isBusy) {
      return
    }

    setPendingFileName(file?.name ?? document?.fileName ?? null)
    void ingestDocument(file)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      startIngestion(file)
    }
  }

  return (
    <section
      className="screen-section intake-screen"
      aria-labelledby="intake-title"
    >
      <div className="screen-heading">
        <span className="screen-eyebrow">Autonomous Strategy OS</span>
        <h1 id="intake-title">Document Intake</h1>
      </div>

      <Card>
        <div
          className={`intake-dropzone${isDragging ? ' intake-dropzone-active' : ''}`}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!isBusy) {
              setIsDragging(true)
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (!isBusy) {
              setIsDragging(true)
            }
          }}
          onDrop={handleDrop}
        >
          <input
            accept=".pdf,application/pdf"
            className="intake-file-input"
            disabled={isBusy}
            id="strategy-report-file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              event.currentTarget.value = ''
              if (file) {
                startIngestion(file)
              }
            }}
            type="file"
          />
          <label
            className="intake-dropzone-label"
            htmlFor="strategy-report-file"
          >
            <FileUp aria-hidden="true" size={30} strokeWidth={1.5} />
            <strong>Drop a strategy report here</strong>
            <span>
              PDF files are accepted. The report content stays in this browser.
            </span>
          </label>
          <button
            className="intake-sample-button"
            disabled={isBusy}
            onClick={() => startIngestion()}
            type="button"
          >
            Load sample report — Regional Growth Strategy 2026, 120 pages
          </button>
        </div>

        <div className="intake-accepted-copy">
          Accepts strategy reports, authority matrices, policy manuals and board
          packs.
        </div>

        {visibleFileName ? (
          <div className="intake-file-status" aria-live="polite">
            <FileText aria-hidden="true" size={18} />
            <div>
              <strong>{visibleFileName}</strong>
              <span>
                {document?.ingestedAt
                  ? 'Document ingested. Review the extracted structure below.'
                  : (pipeline?.label ?? 'Ready to process.')}
              </span>
            </div>
          </div>
        ) : null}

        {pipeline ? (
          <div className="intake-pipeline" aria-live="polite">
            {stageLabels.slice(0, pipeline.stage - 1).map((label, index) => (
              <div className="intake-stage-complete" key={label}>
                <span aria-hidden="true">✓</span>
                <span>
                  Stage {index + 1}: {label}
                </span>
              </div>
            ))}
            <ProgressStages
              label={pipeline.label}
              progress={pipeline.progress}
              stageCount={stageLabels.length}
              stageIndex={pipeline.stage}
            />
            {stageLabels.slice(pipeline.stage).map((label, index) => (
              <div className="intake-stage-pending" key={label}>
                Stage {pipeline.stage + index + 1}: {label}
              </div>
            ))}
            {pipeline.stage >= 2 ? (
              <div className="intake-chunk-counter" data-metric>
                <span>Chunks indexed</span>
                <strong>{chunkCount.toLocaleString('en-US')}</strong>
                <span>of {chunkTarget.toLocaleString('en-US')}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
      {document?.ingestedAt ? <ExtractionTree /> : null}
      {document?.ingestedAt ? (
        <Card className="intake-provision-card">
          <div className="intake-provision-content">
            <div>
              <span className="screen-eyebrow">Handoff</span>
              <h2>Provision the live strategy workspace.</h2>
              <p>
                Turn the extracted structure into a dashboard for the executive
                boardroom.
              </p>
            </div>
            <button
              className="intake-provision-button"
              disabled={provisioning}
              onClick={async () => {
                await provisionWorkspace()
                const state = useDemoStore.getState()
                if (!state.provisioning && state.documents[0]?.ingestedAt) {
                  navigate('/boardroom')
                }
              }}
              type="button"
            >
              {provisioning
                ? 'Provisioning Strategy OS...'
                : 'Provision Strategy OS and launch dashboard'}
            </button>
          </div>
        </Card>
      ) : null}
    </section>
  )
}
