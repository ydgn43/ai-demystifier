import type { Card, Level } from '../data'
import JargonText from './JargonText'

interface Props {
  card: Card
  level: Level
  accentColor: string
  onClick: () => void
  animKey: number
}

const CATEGORY_COLOR: Record<string, string> = {
  MODELS: '#14171C',
  RESEARCH: '#14171C',
  'DEVELOPER TOOLS': '#14171C',
  'INDUSTRY NEWS': '#14171C',
}

export default function NewsCard({ card, level, accentColor, onClick, animKey }: Props) {
  const meta = [card.source, card.metric, card.timestamp].filter(Boolean).join(' · ')

  return (
    <article
      style={{
        background: '#FFFFFF',
        border: '1px solid #E3E6EA',
        borderRadius: 4,
        padding: '15px 20px',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {/* Row 1: metadata */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: '0.04em',
          color: '#8C939E',
          marginBottom: 7,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            border: '1px solid #E3E6EA',
            borderRadius: 2,
            padding: '1px 5px',
            color: '#8C939E',
            fontSize: 9,
            letterSpacing: '0.07em',
          }}
        >
          {card.category}
        </span>
        <span>{meta}</span>
      </div>

      {/* Row 2: headline */}
      <h2
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#14171C',
          margin: '0 0 8px',
        }}
      >
        {card.headline}
      </h2>

      {/* Row 3: summary — crossfades on toggle */}
      <p
        key={`${card.id}-${animKey}`}
        className="summary-fade"
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
          color: '#14171C',
          margin: '0 0 12px',
        }}
      >
        <JargonText text={card[level]} accentColor={accentColor} />
      </p>

      {/* Row 4: source link */}
      <a
        href={card.sourceUrl}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: accentColor,
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        VIEW SOURCE →
      </a>
    </article>
  )
}
