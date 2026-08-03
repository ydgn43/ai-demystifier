// Static hairline skeleton — no animation, no shimmer
const BLOCK_HEIGHTS = [
  { meta: true, headline: 18, lines: 2 },
  { meta: true, headline: 18, lines: 3 },
  { meta: true, headline: 18, lines: 2 },
  { meta: true, headline: 18, lines: 3 },
  { meta: true, headline: 18, lines: 2 },
]

function Block({ color = '#E3E6EA', height = 10, width = '100%', style = {} }: {
  color?: string
  height?: number
  width?: string | number
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: color,
        height,
        width,
        borderRadius: 2,
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

export default function FeedSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {BLOCK_HEIGHTS.map((card, i) => (
        <div
          key={i}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E3E6EA',
            borderRadius: 4,
            padding: '15px 20px',
          }}
        >
          {/* Metadata row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 9, alignItems: 'center' }}>
            <Block height={8} width={52} color="#ECEEF1" />
            <Block height={8} width={80} color="#ECEEF1" />
            <Block height={8} width={48} color="#ECEEF1" />
          </div>

          {/* Headline */}
          <Block height={card.headline} width="72%" color="#E3E6EA" style={{ marginBottom: 10 }} />

          {/* Summary lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {Array.from({ length: card.lines }).map((_, j) => (
              <Block
                key={j}
                height={9}
                width={j === card.lines - 1 ? '55%' : '100%'}
                color="#ECEEF1"
              />
            ))}
          </div>

          {/* Source link stub */}
          <Block height={8} width={72} color="#ECEEF1" />
        </div>
      ))}
    </div>
  )
}
