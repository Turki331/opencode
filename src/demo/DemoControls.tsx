import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chapterOrder, chapterSeeds } from './script'
import { useDemoStore } from '../store/demoStore'
import type { Chapter } from '../store/types'

export function DemoControls() {
  const navigate = useNavigate()
  const chapter = useDemoStore((state) => state.chapter)
  const reset = useDemoStore((state) => state.reset)
  const seed = useDemoStore((state) => state.seed)

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) {
        return
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        reset()
        navigate('/intake', { replace: true })
        return
      }

      const chapterIndex = Number.parseInt(event.key, 10) - 1
      const selectedChapter = chapterOrder[chapterIndex]

      if (selectedChapter) {
        event.preventDefault()
        seed(selectedChapter)
        navigate(chapterSeeds[selectedChapter].naturalPath, {
          replace: true,
        })
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [navigate, reset, seed])

  function handleChapterChange(value: Chapter) {
    seed(value)
    navigate(chapterSeeds[value].naturalPath, { replace: true })
  }

  return (
    <aside className="demo-controls" aria-label="Demo controls">
      <button
        className="demo-control-reset"
        onClick={() => {
          reset()
          navigate('/intake', { replace: true })
        }}
        type="button"
      >
        Reset demo
      </button>
      <label className="demo-control-seed">
        <span>Jump to chapter</span>
        <select
          aria-label="Jump to chapter"
          onChange={(event) =>
            handleChapterChange(event.target.value as Chapter)
          }
          value={chapter}
        >
          {chapterOrder.map((item) => (
            <option key={item} value={item}>
              {item.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
    </aside>
  )
}
