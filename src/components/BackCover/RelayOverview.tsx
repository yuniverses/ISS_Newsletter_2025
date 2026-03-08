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

/**
 * Build a zigzag path where ALL segments go left→right for readable text.
 * Odd (RTL) segments are reversed via separate subpaths (M commands)
 * so text never appears mirrored.
 *
 *  L ────↘──── R   (seg 0, LTR)
 *  L ────↗──── R   (seg 1, reversed to LTR)
 *  L ────↘──── R   (seg 2, LTR)
 */
const buildSerpentinePath = (
  width: number,
  height: number,
  rows: number,
  paddingX: number,
  paddingTop: number,
  paddingBottom: number,
): string => {
  const leftX = paddingX
  const rightX = width - paddingX
  const usableHeight = height - paddingTop - paddingBottom
  const rowHeight = usableHeight / rows

  // Compute zigzag vertices: V0(left), V1(right), V2(left), V3(right), ...
  const vertices: Array<[number, number]> = []
  for (let i = 0; i <= rows; i++) {
    const y = paddingTop + i * rowHeight
    const x = i % 2 === 0 ? leftX : rightX
    vertices.push([x, y])
  }

  // Build path — all segments go left→right
  const segments: string[] = []
  for (let i = 0; i < rows; i++) {
    const [x1, y1] = vertices[i]
    const [x2, y2] = vertices[i + 1]

    if (i % 2 === 0) {
      // Even: left→right, already LTR
      segments.push(`M ${x1} ${y1} L ${x2} ${y2}`)
    } else {
      // Odd: would be right→left, reverse for readable text
      segments.push(`M ${x2} ${y2} L ${x1} ${y1}`)
    }
  }

  return segments.join(' ')
}

/**
 * Highlight the user's own text within the content string.
 */
const buildTextSpans = (content: string, highlight?: string) => {
  if (!highlight) {
    return [{ text: content, isHighlight: false }]
  }

  const cleanHighlight = highlight.trim()
  if (!cleanHighlight) {
    return [{ text: content, isHighlight: false }]
  }

  const spans: Array<{ text: string; isHighlight: boolean }> = []
  let cursor = 0

  while (cursor < content.length) {
    const index = content.indexOf(cleanHighlight, cursor)
    if (index === -1) {
      spans.push({ text: content.slice(cursor), isHighlight: false })
      break
    }

    if (index > cursor) {
      spans.push({ text: content.slice(cursor, index), isHighlight: false })
    }

    spans.push({ text: cleanHighlight, isHighlight: true })
    cursor = index + cleanHighlight.length
  }

  return spans
}

export default function RelayOverview({ ownText }: RelayOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sentences, setSentences] = useState<SentenceDoc[]>([])
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  // ── Firebase subscription ──
  useEffect(() => {
    const q = query(collection(db, 'coverSentences'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { text?: string }),
      })) as SentenceDoc[]
      setSentences(data.filter((item) => item.text))
    })
    return () => unsubscribe()
  }, [])

  // ── Container size tracking ──
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

  const isCompact = size.width < 640

  // ── Crescendo config (last 4 sentences) ──
  const crescendoConfig = useMemo(() => {
    const last4 = sentences.slice(-4)
    const sizesDesktop = [14, 24, 36, 50]
    const sizesCompact = [12, 18, 26, 36]
    const opacities = [0.5, 0.65, 0.8, 0.95]
    const sizes = isCompact ? sizesCompact : sizesDesktop
    const count = last4.length

    return last4.map((s, i) => {
      const tierIdx = sizes.length - count + i
      const fontSize = sizes[Math.max(0, tierIdx)]
      const opacity = opacities[Math.max(0, tierIdx)]
      const isLast = i === count - 1
      return {
        text: s.text.trim(),
        fontSize,
        opacity,
        fontWeight: isLast ? ('bold' as const) : ('normal' as const),
      }
    })
  }, [sentences, isCompact])

  // ── Build the continuous text blob ──
  const { normalText, crescendoText } = useMemo(() => {
    const allTexts = sentences.map((s) => s.text.trim()).filter(Boolean)
    const joined = allTexts.length > 0 ? allTexts.join(' ; ') : 'Waiting for the next voice ;'
    return {
      normalText: joined,
      crescendoText: crescendoConfig,
    }
  }, [sentences, crescendoConfig])

  // ── Path & text layout computation ──
  const pathData = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null

    // Odd rows ensure the last segment goes left-to-right, keeping crescendo text readable
    const rows = isCompact ? 9 : 11
    const paddingX = Math.round(size.width * 0.05)
    const paddingTop = Math.round(size.height * 0.04)
    // Extra bottom padding to accommodate crescendo large text
    const paddingBottom = Math.round(size.height * 0.08)

    const serpentinePath = buildSerpentinePath(
      size.width,
      size.height,
      rows,
      paddingX,
      paddingTop,
      paddingBottom,
    )

    // Calculate path length to determine how much text is needed
    const leftX = paddingX
    const rightX = size.width - paddingX
    const usableHeight = size.height - paddingTop - paddingBottom
    const rowHeight = usableHeight / rows
    const legLength = Math.sqrt(
      Math.pow(rightX - leftX, 2) + Math.pow(rowHeight, 2),
    )
    const totalPathLength = legLength * rows

    // Estimate characters needed to fill the path
    const baseFontSize = isCompact ? 10 : 12
    const charWidth = baseFontSize * 0.6
    // Reserve some path length for crescendo (roughly last 15-20% of path)
    const crescendoReserve = crescendoText.reduce((acc, span) => {
      return acc + span.text.length * span.fontSize * 0.6 + span.fontSize // extra for separator
    }, 0)
    const normalPathLength = totalPathLength - crescendoReserve
    const totalCharsNeeded = Math.max(1, Math.floor(normalPathLength / charWidth))

    // Repeat the normal text to fill the path
    let expandedNormalText = normalText
    while (expandedNormalText.length < totalCharsNeeded) {
      expandedNormalText += ' ; ' + normalText
    }
    // Trim to approximately fit
    if (expandedNormalText.length > totalCharsNeeded + 50) {
      // Cut at a sensible boundary
      let cutIdx = expandedNormalText.lastIndexOf(' ; ', totalCharsNeeded)
      if (cutIdx < totalCharsNeeded * 0.5) {
        cutIdx = expandedNormalText.lastIndexOf(' ', totalCharsNeeded)
      }
      if (cutIdx > 0) {
        expandedNormalText = expandedNormalText.slice(0, cutIdx)
      }
    }
    // Add separator before crescendo
    expandedNormalText += ' ; '

    return {
      serpentinePath,
      expandedNormalText,
      baseFontSize,
      totalPathLength,
    }
  }, [size, isCompact, normalText, crescendoText])

  // ── Build all text spans for the textPath ──
  const allSpans = useMemo(() => {
    if (!pathData) return { normalSpans: [], crescendoSpans: crescendoText }

    const normalSpans = buildTextSpans(pathData.expandedNormalText, ownText)
    return { normalSpans, crescendoSpans: crescendoText }
  }, [pathData, ownText, crescendoText])

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && size.height > 0 && pathData && (
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <filter id="relayGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor="#A6FF00"
                floodOpacity="0.85"
              />
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="8"
                floodColor="#A6FF00"
                floodOpacity="0.6"
              />
            </filter>
          </defs>

          {/* Single serpentine path */}
          <path
            id="relay-serpentine"
            d={pathData.serpentinePath}
            fill="none"
          />

          {/* All text flows along the single path */}
          <text
            fill="rgba(255,255,255,0.45)"
            fontSize={pathData.baseFontSize}
            fontFamily="'Noto Sans TC', sans-serif"
          >
            <textPath href="#relay-serpentine" startOffset="0%">
              {/* Normal text spans */}
              {allSpans.normalSpans.map((span, i) => (
                <tspan
                  key={`n-${i}`}
                  fontSize={pathData.baseFontSize}
                  fill={span.isHighlight ? '#A6FF00' : undefined}
                  style={span.isHighlight ? { filter: 'url(#relayGlow)' } : undefined}
                >
                  {span.text}
                </tspan>
              ))}
              {/* Crescendo spans — last sentences with increasing size */}
              {allSpans.crescendoSpans.map((span, i) => {
                const separator = i < allSpans.crescendoSpans.length - 1 ? ' ; ' : ''
                return (
                  <tspan
                    key={`c-${i}`}
                    fontSize={span.fontSize}
                    fontWeight={span.fontWeight}
                    fill={`rgba(255,255,255,${span.opacity})`}
                  >
                    {span.text}{separator}
                  </tspan>
                )
              })}
            </textPath>
          </text>
        </svg>
      )}
    </div>
  )
}
