import { useState, useRef, useCallback, useEffect } from 'react'
import { JARGON } from '../data'

interface Props {
  text: string
  accentColor: string
}

export default function JargonText({ text, accentColor }: Props) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Dismiss on tap-outside (covers both mouse and touch)
  useEffect(() => {
    if (!activeTooltip) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTooltip(null)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [activeTooltip])

  const show = useCallback((term: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActiveTooltip(term)
  }, [])

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setActiveTooltip(null), 120)
  }, [])

  const parts = text.split(/(<[^>]+>)/)

  return (
    <span ref={containerRef}>
      {parts.map((part, i) => {
        const match = part.match(/^<(.+)>$/)
        if (match) {
          const term = match[1]
          const def = JARGON[term]
          if (!def) return <span key={i}>{term}</span>
          const isActive = activeTooltip === term
          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span
                className="jargon-term"
                style={{ borderBottomColor: accentColor, color: 'inherit' }}
                onMouseEnter={() => show(term)}
                onMouseLeave={hide}
                onFocus={() => show(term)}
                onBlur={hide}
                onTouchStart={(e) => {
                  e.preventDefault()
                  isActive ? setActiveTooltip(null) : show(term)
                }}
                onClick={() => isActive ? setActiveTooltip(null) : show(term)}
                tabIndex={0}
                role="button"
                aria-expanded={isActive}
                aria-label={`${term}: ${def}`}
              >
                {term}
              </span>
              {isActive && <span className="tooltip">{def}</span>}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}
