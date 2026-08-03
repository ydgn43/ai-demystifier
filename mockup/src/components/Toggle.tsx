import type { Level } from '../data'

interface Props {
  level: Level
  onChange: (l: Level) => void
  accentColor: string
  showLabel?: boolean
  fullWidth?: boolean
}

const MODE_LABEL: Record<Level, string> = {
  casual: 'Plain language, no jargon',
  developer: 'Specs, numbers, and tradeoffs',
}

export default function Toggle({ level, onChange, accentColor, showLabel = false, fullWidth = false }: Props) {
  const slideRight = level === 'developer'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: fullWidth ? '100%' : undefined }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: fullWidth ? '100%' : 'inline-flex',
          border: `1px solid ${accentColor}`,
          borderRadius: fullWidth ? 0 : 3,
          overflow: 'hidden',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.09em',
          transition: 'border-color 220ms ease',
        }}
      >
        {/* Sliding fill */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '50%',
            background: accentColor,
            transform: slideRight ? 'translateX(100%)' : 'translateX(0%)',
            transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), background 220ms ease',
            pointerEvents: 'none',
          }}
        />

        {(['casual', 'developer'] as Level[]).map((opt) => {
          const active = level === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                position: 'relative',
                zIndex: 1,
                flex: fullWidth ? 1 : undefined,
                padding: fullWidth ? '12px 0' : '10px 32px',
                border: 'none',
                borderRadius: 0,
                cursor: 'pointer',
                background: 'transparent',
                color: active ? '#FFFFFF' : accentColor,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                textTransform: 'uppercase',
                transition: 'color 220ms ease',
                minWidth: fullWidth ? undefined : 130,
                textAlign: 'center',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {showLabel && (
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.05em',
            color: accentColor,
            transition: 'color 220ms ease',
            opacity: 0.75,
          }}
        >
          {MODE_LABEL[level]}
        </span>
      )}
    </div>
  )
}
