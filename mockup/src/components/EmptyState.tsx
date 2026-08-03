export default function EmptyState() {
  const nextUtc = (() => {
    const now = new Date()
    const next = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCHours() >= 6 ? now.getUTCDate() + 1 : now.getUTCDate(),
      6, 0, 0
    ))
    return next.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
  })()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      {/* Ruled placeholder */}
      <div
        style={{
          width: 48,
          borderTop: '1px solid #E3E6EA',
          marginBottom: 8,
        }}
      />

      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 17,
          fontWeight: 500,
          color: '#14171C',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        Today's digest hasn't landed yet.
      </p>

      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          color: '#5C6470',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Today's digest lands at 06:00 UTC.
      </p>

      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.05em',
          color: '#8C939E',
          marginTop: 4,
        }}
      >
        Next issue: {nextUtc}
      </span>
    </div>
  )
}
