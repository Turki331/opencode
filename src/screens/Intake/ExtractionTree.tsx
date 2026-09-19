import { useState } from 'react'
import { Drawer } from '../../components/ui/Drawer'
import { formatMetricValue, formatSar } from '../../lib/format'
import {
  selectPeople,
  selectSourcePassages,
  useDemoStore,
} from '../../store/demoStore'
import type { SourcePassage } from '../../store/types'

const REVIEW_NODE_ID = 'initiative-local-sourcing'

function confidenceFor(id: string) {
  if (id === REVIEW_NODE_ID) {
    return 0.76
  }

  if (id === 'objective-03') {
    return 0.94
  }

  return 0.92
}

function SourceCitation({
  passage,
  onOpen,
}: {
  passage: SourcePassage | null
  onOpen: (passage: SourcePassage) => void
}) {
  if (!passage) {
    return (
      <span className="extraction-source-missing">
        Source reference unavailable
      </span>
    )
  }

  return (
    <button
      className="extraction-source-link"
      onClick={() => onOpen(passage)}
      type="button"
    >
      p. {passage.page} · §{passage.section}
    </button>
  )
}

function ExtractionMeta({
  confidence,
  passage,
  onOpen,
}: {
  confidence: number
  passage: SourcePassage | null
  onOpen: (passage: SourcePassage) => void
}) {
  return (
    <div className="extraction-node-meta">
      <span data-metric>Confidence {confidence.toFixed(2)}</span>
      {confidence < 0.8 ? (
        <span className="extraction-review-marker">Needs review</span>
      ) : null}
      <SourceCitation onOpen={onOpen} passage={passage} />
    </div>
  )
}

function ExtractionNode({
  title,
  type,
  confidence,
  passage,
  onOpen,
}: {
  title: string
  type: string
  confidence: number
  passage: SourcePassage | null
  onOpen: (passage: SourcePassage) => void
}) {
  return (
    <div className="extraction-node">
      <div className="extraction-node-heading">
        <span className="extraction-node-type">{type}</span>
        <strong>{title}</strong>
      </div>
      <ExtractionMeta
        confidence={confidence}
        onOpen={onOpen}
        passage={passage}
      />
    </div>
  )
}

function PassageText({ passage }: { passage: SourcePassage }) {
  const matchIndex = passage.passage.indexOf(passage.matchedText)

  if (matchIndex === -1) {
    return <p>{passage.passage}</p>
  }

  return (
    <p>
      {passage.passage.slice(0, matchIndex)}
      <mark>{passage.matchedText}</mark>
      {passage.passage.slice(matchIndex + passage.matchedText.length)}
    </p>
  )
}

export function ExtractionTree() {
  const objectives = useDemoStore((state) => state.objectives)
  const initiatives = useDemoStore((state) => state.initiatives)
  const kpis = useDemoStore((state) => state.kpis)
  const people = useDemoStore(selectPeople)
  const authorityRules = useDemoStore((state) => state.authorityRules)
  const sourcePassages = useDemoStore(selectSourcePassages)
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(
    () => new Set(['objective-03']),
  )
  const [selectedPassage, setSelectedPassage] = useState<SourcePassage | null>(
    null,
  )

  function findPassage(page: number, section: string) {
    const exact = sourcePassages.find(
      (passage) => passage.page === page && passage.section === section,
    )

    return exact ?? sourcePassages[0] ?? null
  }

  function toggleObjective(id: string) {
    setExpandedObjectives((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <section className="extraction-section" aria-labelledby="extraction-title">
      <div className="extraction-heading">
        <div>
          <span className="screen-eyebrow">Intake agent output</span>
          <h2 id="extraction-title">Extracted strategy structure</h2>
        </div>
        <span className="extraction-heading-note">
          Select a source citation to inspect the passage.
        </span>
      </div>

      <div className="extraction-counts">
        <div>
          <strong data-metric>{objectives.length}</strong>
          <span>Objectives</span>
        </div>
        <div>
          <strong data-metric>{initiatives.length}</strong>
          <span>Initiatives</span>
        </div>
        <div>
          <strong data-metric>{kpis.length}</strong>
          <span>KPIs</span>
        </div>
        <div>
          <strong data-metric>{people.length}</strong>
          <span>Owners</span>
        </div>
        <div>
          <strong data-metric>{authorityRules.length}</strong>
          <span>Authority rules</span>
        </div>
      </div>

      <div className="extraction-tree">
        {objectives.map((objective) => {
          const expanded = expandedObjectives.has(objective.id)
          const sourceRef = objective.sourceRef
          const passage = sourceRef
            ? findPassage(sourceRef.page, sourceRef.section)
            : null
          const objectiveInitiatives = initiatives.filter(
            (initiative) => initiative.objectiveId === objective.id,
          )

          return (
            <div className="extraction-objective" key={objective.id}>
              <div className="extraction-objective-heading">
                <button
                  aria-expanded={expanded}
                  className="extraction-toggle"
                  onClick={() => toggleObjective(objective.id)}
                  type="button"
                >
                  <span aria-hidden="true">{expanded ? '−' : '+'}</span>
                  <span>
                    <small>Objective</small>
                    {objective.title}
                  </span>
                </button>
                <ExtractionMeta
                  confidence={confidenceFor(objective.id)}
                  onOpen={setSelectedPassage}
                  passage={passage}
                />
              </div>

              {expanded ? (
                <div className="extraction-children">
                  {objectiveInitiatives.map((initiative) => {
                    const owner = people.find(
                      (person) => person.id === initiative.ownerId,
                    )
                    const authorityRule = owner
                      ? authorityRules.find(
                          (rule) => rule.id === owner.authorityRuleId,
                        )
                      : undefined
                    const kpi = kpis.find(
                      (item) => item.initiativeId === initiative.id,
                    )

                    return (
                      <div
                        className="extraction-initiative"
                        key={initiative.id}
                      >
                        <ExtractionNode
                          confidence={confidenceFor(initiative.id)}
                          onOpen={setSelectedPassage}
                          passage={passage}
                          title={initiative.title}
                          type="Initiative"
                        />
                        {owner ? (
                          <ExtractionNode
                            confidence={confidenceFor(owner.id)}
                            onOpen={setSelectedPassage}
                            passage={passage}
                            title={`${owner.name} · ${owner.title}`}
                            type="Owner"
                          />
                        ) : null}
                        {kpi ? (
                          <ExtractionNode
                            confidence={confidenceFor(kpi.id)}
                            onOpen={setSelectedPassage}
                            passage={passage}
                            title={`${kpi.name} · target ${formatMetricValue(kpi.target, kpi.unit)}`}
                            type="KPI"
                          />
                        ) : null}
                        {authorityRule ? (
                          <ExtractionNode
                            confidence={confidenceFor(authorityRule.id)}
                            onOpen={setSelectedPassage}
                            passage={passage}
                            title={`${authorityRule.id} · ${formatSar(authorityRule.financialLimit)}`}
                            type="Authority"
                          />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <Drawer
        onClose={() => setSelectedPassage(null)}
        open={Boolean(selectedPassage)}
        title={
          selectedPassage
            ? `Source passage · p. ${selectedPassage.page} · §${selectedPassage.section}`
            : 'Source passage'
        }
      >
        {selectedPassage ? (
          <div className="extraction-source-passage">
            <p className="extraction-source-label">Matched passage</p>
            <PassageText passage={selectedPassage} />
          </div>
        ) : null}
      </Drawer>
    </section>
  )
}
