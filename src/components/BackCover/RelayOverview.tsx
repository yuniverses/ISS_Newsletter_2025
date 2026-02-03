import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface SentenceDoc {
  id: string
  text: string
}

interface RelayOverviewProps {
  ownText?: string
}

interface Size {
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const splitTextToRows = (text: string, maxChars: number) => {
  const cleaned = text.trim()
  if (!cleaned) {
    return ['等待下一位讀者加入 · Waiting for the next voice ·']
  }

  const rows: string[] = []
  let remaining = cleaned
  const softLimit = Math.max(10, Math.floor(maxChars * 0.6))

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      rows.push(remaining.trim())
      break
    }

    let cutIndex = remaining.lastIndexOf(' · ', maxChars)
    if (cutIndex < softLimit) {
      cutIndex = remaining.lastIndexOf(' ', maxChars)
    }
    if (cutIndex < softLimit) {
      cutIndex = maxChars
    }

    const slice = remaining.slice(0, cutIndex).trim()
    rows.push(slice)
    remaining = remaining.slice(cutIndex).trim()
    if (remaining.startsWith('·')) {
      remaining = remaining.slice(1).trim()
    }
  }

  return rows
}

const createSeededRandom = (seed: number) => {
  let t = seed
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), t | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const buildLightningPath = (
  width: number,
  baselineY: number,
  amplitude: number,
  segments: number,
  seed: number
) => {
  const safeSegments = Math.max(4, segments)
  const rng = createSeededRandom(seed)
  const avgStep = width / safeSegments
  let x = 0
  let d = `M 0 ${baselineY}`

  for (let i = 0; i < safeSegments; i += 1) {
    const step = i === safeSegments - 1
      ? width - x
      : avgStep * (0.55 + rng() * 0.9)
    x = Math.min(width, x + step)

    const jitter = (rng() * 2 - 1) * amplitude
    const y = baselineY + jitter
    d += ` L ${x} ${y}`
  }

  return d
}

const buildTextSpans = (content: string, highlight?: string) => {
  if (!highlight) {
    return [{ text: content, highlight: false }]
  }

  const cleanHighlight = highlight.trim()
  if (!cleanHighlight) {
    return [{ text: content, highlight: false }]
  }

  const spans: Array<{ text: string; highlight: boolean }> = []
  let cursor = 0

  while (cursor < content.length) {
    const index = content.indexOf(cleanHighlight, cursor)
    if (index === -1) {
      spans.push({ text: content.slice(cursor), highlight: false })
      break
    }

    if (index > cursor) {
      spans.push({ text: content.slice(cursor, index), highlight: false })
    }

    spans.push({ text: cleanHighlight, highlight: true })
    cursor = index + cleanHighlight.length
  }

  return spans
}

export default function RelayOverview({ ownText }: RelayOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sentences, setSentences] = useState<SentenceDoc[]>([])
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const q = query(collection(db, 'coverSentences'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { text?: string })
      })) as SentenceDoc[]
      setSentences(data.filter(item => item.text))
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }

    updateSize()

    const observer = new ResizeObserver(() => updateSize())
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const relayCount = sentences.length
  const isCompact = size.width < 640
  const baseText = useMemo(() => {
    return sentences
      .map(sentence => sentence.text.trim())
      .filter(Boolean)
      .join(' · ')
  }, [sentences])
  const layout = useMemo(() => {
    const fallbackRows = isCompact ? 5 : 7
    if (size.width === 0 || size.height === 0) {
      return {
        rows: fallbackRows,
        rowSpacing: 120,
        fontSize: isCompact ? 10 : 12,
        maxChars: 80,
        rowTexts: splitTextToRows(baseText, 80)
      }
    }

    let rows = fallbackRows
    const maxRows = isCompact ? 12 : 14
    let rowSpacing = size.height / (rows + 1)
    let fontSize = clamp(rowSpacing * 0.6, 8, isCompact ? 11 : 13)
    let maxChars = Math.max(20, Math.floor((size.width / (fontSize * 0.58)) * 0.95))
    let rowTexts = splitTextToRows(baseText, maxChars)

    for (let i = 0; i < 6; i += 1) {
      const neededRows = Math.min(maxRows, Math.max(rows, rowTexts.length))
      if (neededRows === rows) {
        break
      }
      rows = neededRows
      rowSpacing = size.height / (rows + 1)
      fontSize = clamp(rowSpacing * 0.6, 8, isCompact ? 11 : 13)
      maxChars = Math.max(20, Math.floor((size.width / (fontSize * 0.58)) * 0.95))
      rowTexts = splitTextToRows(baseText, maxChars)
    }

    return { rows, rowSpacing, fontSize, maxChars, rowTexts }
  }, [baseText, isCompact, size.height, size.width])

  const rows = layout.rows
  const rowSpacing = layout.rowSpacing
  const rowTexts = layout.rowTexts
  const displayRows = rowTexts.length > rows ? rowTexts.slice(rowTexts.length - rows) : rowTexts
  const amplitude = clamp(8 + relayCount * 0.35, 10, rowSpacing * 0.45)
  const segments = clamp(6 + Math.ceil(relayCount / 2), 8, 24)

  return (
    <section className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />

      <div ref={containerRef} className="relative z-10 h-screen w-full">
        {size.width > 0 && size.height > 0 && (
          <svg
            width={size.width}
            height={size.height}
            viewBox={`0 0 ${size.width} ${size.height}`}
            preserveAspectRatio="none"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <filter id="relayGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#A6FF00" floodOpacity="0.85" />
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#A6FF00" floodOpacity="0.6" />
              </filter>
            </defs>

            {Array.from({ length: rows }).map((_, rowIndex) => {
              const baseline = rowSpacing * (rowIndex + 1)
              const pathId = `relay-path-${rowIndex}`
              const seed = Math.round(size.width) + relayCount * 37 + rowIndex * 101
              const lightningPath = buildLightningPath(
                size.width,
                baseline,
                amplitude,
                segments + rowIndex,
                seed
              )
              const rowText = displayRows[rowIndex] ?? ''
              const fontSize = layout.fontSize
              const letterSpacing = clamp(rowSpacing * 0.05, 0.1, 1)
              const spans = buildTextSpans(rowText, ownText)

              return (
                <g key={pathId} opacity={0.7}>
                  <path id={pathId} d={lightningPath} fill="none" />
                  {rowText && (
                    <text
                      fill="rgba(255,255,255,0.65)"
                      fontSize={fontSize}
                      fontFamily="var(--font-serif, 'Noto Serif TC', serif)"
                      letterSpacing={letterSpacing}
                    >
                      <textPath href={`#${pathId}`} startOffset={`${(rowIndex % 2) * 10}%`}>
                        {spans.map((span, index) => (
                          <tspan
                            key={`${pathId}-span-${index}`}
                            fill={span.highlight ? '#A6FF00' : undefined}
                            style={span.highlight ? { filter: 'url(#relayGlow)' } : undefined}
                          >
                            {span.text}
                          </tspan>
                        ))}
                      </textPath>
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <div className="absolute bottom-6 left-6 text-[10px] tracking-[0.3em] uppercase text-white/40">
        文字接力總覽
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] tracking-[0.3em] uppercase text-[#A6FF00]/70">
        Your Line
      </div>
    </section>
  )
}
