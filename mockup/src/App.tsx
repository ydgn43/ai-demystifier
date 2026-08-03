import { useState, useEffect } from 'react'
import { CARDS, type Level, type Card } from './data'
import NewsCard from './components/NewsCard'
import DetailPage from './components/DetailPage'
import Toggle from './components/Toggle'
import FeedSkeleton from './components/FeedSkeleton'
import EmptyState from './components/EmptyState'

const ACCENT_CASUAL = '#C2410C'
const ACCENT_DEV = '#1F52E0'

type FeedState = 'loading' | 'empty' | 'loaded'

const TOTAL_ITEMS = 25

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= 480)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return mobile
}

export default function App() {
  const [level, setLevel] = useState<Level>('casual')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [animKey, setAnimKey] = useState(0)
  const [email, setEmail] = useState('')
  const [feedState, setFeedState] = useState<FeedState>('loaded')
  const isMobile = useIsMobile()

  const px = isMobile ? 16 : 24
  const accentColor = level === 'casual' ? ACCENT_CASUAL : ACCENT_DEV

  const handleLevelChange = (l: Level) => {
    setLevel(l)
    setAnimKey((k) => k + 1)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F5F6F8' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #E3E6EA',
          background: '#F5F6F8',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: `14px ${px}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#14171C',
              cursor: selectedCard ? 'pointer' : 'default',
            }}
            onClick={() => setSelectedCard(null)}
          >
            AI DIGEST
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#5C6470',
              letterSpacing: '0.03em',
            }}
          >
            {today}
          </span>
        </div>
      </header>

      {selectedCard ? (
        <DetailPage
          card={selectedCard}
          level={level}
          accentColor={accentColor}
          onLevelChange={handleLevelChange}
          animKey={animKey}
          onBack={() => setSelectedCard(null)}
          px={px}
        />
      ) : (
        <>
          {/* Sticky toggle */}
          <div
            style={{
              position: 'sticky',
              top: 49,
              zIndex: 20,
              background: '#F5F6F8',
              borderBottom: '1px solid #E3E6EA',
            }}
          >
            {isMobile ? (
              // Full-width segmented control, flush to viewport edges
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Toggle
                  level={level}
                  onChange={handleLevelChange}
                  accentColor={accentColor}
                  fullWidth
                />
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.05em',
                    color: accentColor,
                    opacity: 0.75,
                    padding: '6px 0 8px',
                    transition: 'color 220ms ease',
                  }}
                >
                  {level === 'casual' ? 'Plain language, no jargon' : 'Specs, numbers, and tradeoffs'}
                </span>
              </div>
            ) : (
              <div
                style={{
                  maxWidth: 700,
                  margin: '0 auto',
                  padding: `16px ${px}px 18px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Toggle level={level} onChange={handleLevelChange} accentColor={accentColor} showLabel />
              </div>
            )}
          </div>

          {/* Demo state switcher */}
          <div
            style={{
              maxWidth: 700,
              margin: '0 auto',
              padding: `12px ${px}px 0`,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.06em',
                color: '#8C939E',
                textTransform: 'uppercase',
                marginRight: 4,
              }}
            >
              State:
            </span>
            {(['loaded', 'loading', 'empty'] as FeedState[]).map((s) => (
              <button
                key={s}
                onClick={() => setFeedState(s)}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  border: `1px solid ${feedState === s ? '#14171C' : '#E3E6EA'}`,
                  borderRadius: 2,
                  background: feedState === s ? '#14171C' : 'transparent',
                  color: feedState === s ? '#FFFFFF' : '#5C6470',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Feed */}
          <main style={{ maxWidth: 700, margin: '0 auto', padding: `20px ${px}px 80px` }}>
            {feedState === 'loading' && <FeedSkeleton />}

            {feedState === 'empty' && <EmptyState />}

            {feedState === 'loaded' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CARDS.map((card) => (
                    <NewsCard
                      key={card.id}
                      card={card}
                      level={level}
                      accentColor={accentColor}
                      animKey={animKey}
                      onClick={() => setSelectedCard(card)}
                    />
                  ))}
                </div>

                {/* Feed counter */}
                <div
                  style={{
                    marginTop: 28,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: '#E3E6EA' }} />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.05em',
                      color: '#8C939E',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {CARDS.length} of {TOTAL_ITEMS}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#E3E6EA' }} />
                </div>
              </>
            )}
          </main>

          {/* Footer */}
          <footer style={{ borderTop: '1px solid #E3E6EA', background: '#FFFFFF' }}>
            <div
              style={{
                maxWidth: 700,
                margin: '0 auto',
                padding: `40px ${px}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#5C6470',
                  margin: 0,
                  letterSpacing: '0.03em',
                }}
              >
                One email each morning. No hype.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: 'flex', gap: 0, border: '1px solid #E3E6EA', borderRadius: 3, overflow: 'hidden', width: isMobile ? '100%' : undefined }}
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    padding: '9px 14px',
                    border: 'none',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#14171C',
                    flex: 1,
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    padding: '9px 16px',
                    border: 'none',
                    borderLeft: '1px solid #E3E6EA',
                    background: accentColor,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'background 200ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
