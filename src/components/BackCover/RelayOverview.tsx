import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface SentenceDoc {
  id: string
  text: string
}

interface RelayOverviewProps {
  ownText?: string
  receivedText?: string
}

interface Size {
  width: number
  height: number
}

/**
 * Build a gentle sine-wave SVG path for text to follow.
 */
const buildWavyPath = (
  startX: number,
  endX: number,
  startY: number,
  endY: number,
  amplitude: number,
  wavelength: number,
): string => {
  const total = endX - startX
  const step = 3
  const steps = Math.ceil(total / step)
  const parts: string[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = startX + t * total
    const baseY = startY + (endY - startY) * t
    const wave = Math.sin(((x - startX) / wavelength) * Math.PI * 2) * amplitude
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(baseY + wave).toFixed(1)}`)
  }

  return parts.join(' ')
}

/**
 * Estimate rendered text width accounting for CJK full-width characters.
 */
const estimateTextWidth = (text: string, fontSize: number): number => {
  let w = 0
  for (const char of text) {
    const code = char.charCodeAt(0)
    if (code > 0x2e80) {
      w += fontSize // CJK full-width
    } else if (char === ' ') {
      w += fontSize * 0.3
    } else {
      w += fontSize * 0.55 // Latin, digits, punctuation
    }
  }
  return w
}

export default function RelayOverview({
  ownText,
  receivedText,
}: RelayOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sentences, setSentences] = useState<SentenceDoc[]>([])
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const q = query(
      collection(db, 'coverSentences'),
      orderBy('createdAt', 'asc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as { text?: string }),
      })) as SentenceDoc[]
      setSentences(data.filter((item) => item.text))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const update = () => {
      const r = node.getBoundingClientRect()
      setSize({ width: r.width, height: r.height })
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  const isCompact = size.width < 640

  // Font sizes
  const baseFontSize = isCompact ? 12 : 16
  const receivedFontSize = isCompact ? 16 : 20
  const mineFontSize = isCompact ? 22 : 26
  const labelFontSize = isCompact ? 7 : 10

  // Wave parameters — mobile: wave crosses through card area; desktop: lower card area
  const pathStartX = -size.width * 0.15
  const pathEndX = size.width * 1.5
  const waveStartY = isCompact ? size.height * 0.58 : size.height * 0.82
  const waveEndY = isCompact ? size.height * 0.44 : size.height * 0.66
  const amplitude = isCompact ? 8 : 20
  const wavelength = isCompact ? 160 : 320

  // Only show labels when actual user contribution data exists
  const showLabels = Boolean(receivedText?.trim() || ownText?.trim())

  // Build crescendo items
  const crescendoItems = useMemo(() => {
    const allTexts = sentences.map((s) => s.text.trim()).filter(Boolean)
    const items: Array<{ text: string; type: 'received' | 'mine' }> = []

    if (receivedText?.trim() || ownText?.trim()) {
      if (receivedText?.trim())
        items.push({ text: receivedText.trim(), type: 'received' })
      if (ownText?.trim())
        items.push({ text: ownText.trim(), type: 'mine' })
    } else if (allTexts.length > 0) {
      const last = allTexts.slice(-2)
      last.forEach((t, i) =>
        items.push({ text: t, type: i === last.length - 1 ? 'mine' : 'received' }),
      )
    }

    return items
  }, [sentences, receivedText, ownText])

  // Build layout — mine text always centered
  const layout = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null

    const allTexts = sentences.map((s) => s.text.trim()).filter(Boolean)
    const base =
      allTexts.length > 0
        ? allTexts.join(' ; ') + ' ; '
        : 'Waiting for the next voice ; '

    // Calculate mine text width to center it (CJK-aware)
    const mineItem = crescendoItems.find((i) => i.type === 'mine')
    const receivedItem = crescendoItems.find((i) => i.type === 'received')
    const mineTextWidth = mineItem ? estimateTextWidth(mineItem.text, mineFontSize) : 0
    const receivedTextWidth = receivedItem
      ? estimateTextWidth(receivedItem.text, receivedFontSize) + estimateTextWidth(' ; ', baseFontSize)
      : 0

    // Mine text center = viewport center
    const mineStartX = size.width * 0.5 - mineTextWidth / 2
    // Work backwards: history fills everything before received + mine
    const crescendoStartX = mineStartX - receivedTextWidth
    const historyWidth = crescendoStartX - pathStartX
    const avgHistoryCharWidth = estimateTextWidth(base, baseFontSize) / base.length
    const historyCharsNeeded = Math.max(20, Math.ceil(historyWidth / avgHistoryCharWidth))

    // Repeat history text to fill
    let history = base
    while (history.length < historyCharsNeeded) {
      history += base
    }
    if (history.length > historyCharsNeeded + 50) {
      let cutIdx = history.lastIndexOf(' ; ', historyCharsNeeded)
      if (cutIdx < historyCharsNeeded * 0.5) {
        cutIdx = history.lastIndexOf(' ', historyCharsNeeded)
      }
      if (cutIdx > 0) history = history.slice(0, cutIdx)
    }
    history += ' ; '

    // Wavy path (text only, no deco)
    const textPath = buildWavyPath(
      pathStartX, pathEndX, waveStartY, waveEndY, amplitude, wavelength,
    )

    return { history, textPath }
  }, [
    size, sentences, crescendoItems, baseFontSize, receivedFontSize, mineFontSize,
    pathStartX, pathEndX, waveStartY, waveEndY, amplitude, wavelength,
  ])

  if (!layout || size.width === 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  // dy offsets for inline labels
  // RECEIVED: shift up above the received text baseline
  const receivedLabelDy = -(receivedFontSize * 1.0 + 8)
  // YOU WROTE: shift down below the mine text baseline
  const mineLabelDy = isCompact ? 20 : 28

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size.width} ${size.height}`}
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Text wave path */}
        <path id="wavy-relay" d={layout.textPath} fill="none" />

        {/* All text flows along the wavy path — labels are INLINE */}
        <text
          fontFamily="'Noto Sans TC', sans-serif"
          fill="rgba(255,255,255,0.25)"
          fontSize={baseFontSize}
        >
          <textPath href="#wavy-relay" startOffset="0%">
            {/* History text */}
            <tspan>{layout.history}</tspan>

            {/* Crescendo: labels + received + mine */}
            {crescendoItems.map((item, i) => {
              const isReceived = item.type === 'received'
              const isMine = item.type === 'mine'
              const fs = isReceived ? receivedFontSize : mineFontSize
              const op = isReceived ? 0.7 : 0.95
              const fw = isMine ? 'bold' : 'normal'
              const sep = i < crescendoItems.length - 1 ? ' ; ' : ''
              const labelDy = isReceived ? receivedLabelDy : mineLabelDy
              const labelText = isReceived ? 'RECEIVED' : 'YOU WROTE'
              const labelOp = isReceived ? 0.4 : 0.45
              // Estimate label width (with 0.2em letter-spacing) to pull back with dx
              const labelWidth = labelText.length * labelFontSize * 0.82

              return showLabels ? (
                <tspan key={i}>
                  {/* Label: offset vertically via dy */}
                  <tspan
                    dy={labelDy}
                    fontSize={labelFontSize}
                    fill={`rgba(255,255,255,${labelOp})`}
                    letterSpacing="0.2em"
                  >
                    {labelText}
                  </tspan>
                  {/* Reset baseline + pull back horizontally so text doesn't gap */}
                  <tspan
                    dy={-labelDy}
                    dx={-labelWidth}
                    fontSize={fs}
                    fontWeight={fw}
                    fill={`rgba(255,255,255,${op})`}
                  >
                    {item.text}{sep}
                  </tspan>
                </tspan>
              ) : (
                <tspan
                  key={i}
                  fontSize={fs}
                  fontWeight={fw}
                  fill={`rgba(255,255,255,${op})`}
                >
                  {item.text}{sep}
                </tspan>
              )
            })}

            {/* Trailing decorative */}
            <tspan fontSize={baseFontSize} fill="rgba(255,255,255,0.08)">
              {'；' + '×'.repeat(60)}
            </tspan>
          </textPath>
        </text>
      </svg>
    </div>
  )
}
