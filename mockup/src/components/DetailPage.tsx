import type { Card, Level } from '../data'
import JargonText from './JargonText'
import Toggle from './Toggle'

interface Props {
  card: Card
  level: Level
  accentColor: string
  onLevelChange: (l: Level) => void
  animKey: number
  onBack: () => void
  px?: number
}

export default function DetailPage({ card, level, accentColor, onLevelChange, animKey, onBack, px = 24 }: Props) {
  const meta = [card.source, card.metric, card.timestamp].filter(Boolean).join(' · ')

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: `0 ${px}px 80px` }}>
      {/* Sticky toggle bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#F5F6F8',
          borderBottom: '1px solid #E3E6EA',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#5C6470',
            padding: 0,
            textTransform: 'uppercase',
          }}
        >
          ← BACK
        </button>
        <Toggle level={level} onChange={onLevelChange} accentColor={accentColor} />
      </div>

      <div style={{ paddingTop: 40 }}>
        {/* Metadata */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: '#5C6470',
            marginBottom: 12,
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
              padding: '2px 6px',
              color: '#14171C',
              fontSize: 10,
              letterSpacing: '0.08em',
            }}
          >
            {card.category}
          </span>
          <span>{meta}</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.25,
            color: '#14171C',
            margin: '0 0 8px',
          }}
        >
          {card.headline}
        </h1>

        {/* Technical title */}
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: '#5C6470',
            margin: '0 0 28px',
            letterSpacing: '0.02em',
          }}
        >
          {card.technicalTitle}
        </p>

        <div style={{ borderTop: '1px solid #E3E6EA', paddingTop: 28, marginBottom: 28 }}>
          {/* Summary */}
          <p
            key={`detail-${animKey}`}
            className="summary-fade"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 17,
              lineHeight: 1.7,
              color: '#14171C',
              margin: '0 0 24px',
            }}
          >
            <JargonText text={card[level]} accentColor={accentColor} />
          </p>

          {/* Why it matters */}
          <div
            style={{
              borderLeft: `2px solid ${accentColor}`,
              paddingLeft: 16,
              marginBottom: 28,
              transition: 'border-color 200ms ease',
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: accentColor,
                marginBottom: 8,
                textTransform: 'uppercase',
                transition: 'color 200ms ease',
              }}
            >
              WHY THIS MATTERS
            </div>
            <p
              key={`why-${animKey}`}
              className="summary-fade"
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 15,
                lineHeight: 1.6,
                color: '#5C6470',
                margin: 0,
              }}
            >
              {card.whyItMatters[level]}
            </p>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {[card.category, card.source].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  border: '1px solid #E3E6EA',
                  borderRadius: 2,
                  padding: '3px 8px',
                  color: '#5C6470',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* View source button */}
          <a
            href={card.sourceUrl}
            style={{
              display: 'inline-block',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              background: accentColor,
              padding: '10px 20px',
              borderRadius: 3,
              textDecoration: 'none',
              transition: 'background 200ms ease',
            }}
          >
            VIEW SOURCE →
          </a>
        </div>
      </div>
    </div>
  )
}
