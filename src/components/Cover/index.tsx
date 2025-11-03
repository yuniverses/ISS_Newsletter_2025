import { useEffect, useRef, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore'

interface CoverProps {
  onEnter?: () => void
}

interface SentenceDoc {
  text: string
  createdAt: Timestamp
}

export default function Cover({ onEnter }: CoverProps) {
  const coverRef = useRef<HTMLDivElement>(null)
  const textDisplayRef = useRef<HTMLDivElement>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [userInput, setUserInput] = useState('')
  const [sentences, setSentences] = useState<string[]>([])
  const [charSpacings, setCharSpacings] = useState<{ letterSpacing: number; marginBottom: number; opacity: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Join all text and split into characters
  const allText = sentences.join('；') + (sentences.length > 0 ? '；' : '')
  const characters = allText.split('')

  // Load sentences from Firebase and listen for real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let retryCount = 0
    const maxRetries = 3

    const setupListener = () => {
      try {
        const sentencesRef = collection(db, 'coverSentences')
        const q = query(sentencesRef, orderBy('createdAt', 'asc'))

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const loadedSentences: string[] = []
            snapshot.forEach((doc) => {
              const data = doc.data() as SentenceDoc
              loadedSentences.push(data.text)
            })

            // If no sentences exist, add default ones
            if (loadedSentences.length === 0 && !isLoading) {
              const defaultSentences = [
                '服務聲既是一個社群；也是一份期刊',
                '我們不滿意 服務只是一類，不是一顆上帝子殺人如麻 下輩子視機傳道 研究滿意度',
                '我最不滿意 我做觀察被歸因：結果跟發了 服務只是一類，不是一顆上帝子殺人如麻',
                '下輩子視機傳道 研究滿意度，我最不滿意 我做觀察被歸因',
                '服務聲延續你的想法；邀請你一起創作',
              ]

              // Add default sentences to Firebase
              Promise.all(
                defaultSentences.map((sentence) =>
                  addDoc(sentencesRef, {
                    text: sentence,
                    createdAt: Timestamp.now()
                  }).catch(err => {
                    console.warn('Failed to add default sentence:', err)
                  })
                )
              ).catch(err => {
                console.warn('Failed to add default sentences:', err)
              })
            } else if (loadedSentences.length > 0) {
              setSentences(loadedSentences)
            }

            setIsLoading(false)
            retryCount = 0 // Reset retry count on success
          },
          (error) => {
            console.error('Error loading sentences:', error)

            // Retry logic
            if (retryCount < maxRetries) {
              retryCount++
              console.log(`Retrying... (${retryCount}/${maxRetries})`)
              setTimeout(() => {
                if (unsubscribe) unsubscribe()
                setupListener()
              }, 1000 * retryCount) // Exponential backoff
            } else {
              // Fallback to default sentences if all retries fail
              setSentences([
                '服務聲既是一個社群；也是一份期刊',
                '服務聲延續你的想法；邀請你一起創作',
              ])
              setIsLoading(false)
            }
          }
        )
      } catch (error) {
        console.error('Error setting up listener:', error)
        // Fallback to default sentences
        setSentences([
          '服務聲既是一個社群；也是一份期刊',
          '服務聲延續你的想法；邀請你一起創作',
        ])
        setIsLoading(false)
      }
    }

    // Delay initial setup slightly to ensure Firebase is initialized
    const timeoutId = setTimeout(setupListener, 100)

    return () => {
      clearTimeout(timeoutId)
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!coverRef.current) return

      const rect = coverRef.current.getBoundingClientRect()
      if (rect.bottom <= window.innerHeight && onEnter) {
        onEnter()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onEnter])

  useEffect(() => {
    // Calculate spacing based on actual position in viewport
    const calculateSpacings = () => {
      if (!coverRef.current) return

      const viewportHeight = window.innerHeight
      const coverTop = coverRef.current.getBoundingClientRect().top

      const newSpacings = charRefs.current.map((charEl) => {
        if (!charEl) return { letterSpacing: 0.2, marginBottom: 1, opacity: 0.3 }

        const charRect = charEl.getBoundingClientRect()
        const charTop = charRect.top

        // Calculate position relative to cover start (0vh = top of cover)
        const positionFromCoverTop = charTop - coverTop
        const positionInVh = positionFromCoverTop / viewportHeight

        // 0-100vh: fixed dense spacing (spacingRatio = 0)
        // 100-200vh: increasingly sparse (spacingRatio = 0 to 1)
        let spacingRatio = 0
        let opacity = 0.3

        if (positionInVh > 1 && positionInVh <= 2) {
          // In the 100-200vh range
          spacingRatio = (positionInVh - 1) // 0 at 100vh to 1 at 200vh
          opacity = 0.4 + (spacingRatio * 0.6) // 0.4 to 1.0
        } else if (positionInVh > 2) {
          // Beyond 200vh
          spacingRatio = 1 // max spacing
          opacity = 1.0
        }
        // else: positionInVh <= 1 (0-100vh), keep spacingRatio = 0, opacity = 0.3

        const letterSpacing = 0.2 + (spacingRatio * 2.5) // 0.2em (dense) to 2.7em (sparse)
        const marginBottom = 1 + (spacingRatio * 45) // 1px (dense) to 46px (sparse)

        return { letterSpacing, marginBottom, opacity }
      })

      setCharSpacings(newSpacings)
    }

    // Calculate on mount and when characters change
    setTimeout(calculateSpacings, 100)
    // Also recalculate after a bit more time to ensure layout is stable
    setTimeout(calculateSpacings, 500)
  }, [characters.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim()) {
      const text = userInput.trim()

      // Check character limit
      if (text.length > 200) {
        alert('內容超過 200 字元限制，請縮短後再試。')
        return
      }

      setUserInput('') // Clear input immediately for better UX

      // Retry logic for adding sentence
      let retries = 3
      while (retries > 0) {
        try {
          const sentencesRef = collection(db, 'coverSentences')
          await addDoc(sentencesRef, {
            text: text,
            createdAt: Timestamp.now()
          })
          // Success - exit retry loop
          break
        } catch (error) {
          retries--
          console.error(`Error adding sentence (${3 - retries}/3):`, error)

          if (retries === 0) {
            // All retries failed - fallback to local state
            console.warn('All retries failed, adding to local state only')
            setSentences(prev => [...prev, text])
            alert('無法連接到伺服器，您的輸入已暫存在本地。請稍後重試。')
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
          }
        }
      }
    }
  }

  return (
    <div ref={coverRef} className="relative w-full bg-black text-white" style={{ height: '200vh' }}>
      {/* Large shared text display - continuous text from bottom */}
      <div
        ref={textDisplayRef}
        className="absolute inset-0 overflow-hidden pointer-events-none z-0 animate-text-fade-in"
      >
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <div className="inline-block max-w-full">
            <div
              className="text-gray-400 text-sm md:text-base pointer-events-none"
              style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                wordBreak: 'break-all',
                lineHeight: 0,
              }}
            >
              {characters.map((char, index) => {
                const spacing = charSpacings[index] || { letterSpacing: 0.2, marginBottom: 1, opacity: 0.3 }

                return (
                  <span
                    key={index}
                    ref={(el) => {
                      charRefs.current[index] = el
                    }}
                    style={{
                      letterSpacing: `${spacing.letterSpacing}em`,
                      marginBottom: `${spacing.marginBottom}px`,
                      opacity: spacing.opacity,
                      display: 'inline-block',
                      lineHeight: '1.5',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
              <span className="inline-block ml-1 pointer-events-auto">
                <form onSubmit={handleSubmit} className="inline-block align-baseline relative z-30 pointer-events-auto">
                  <div className="inline-block relative">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="輸入連接你的想法"
                      className="bg-transparent border-b border-gray-600 focus:border-white outline-none py-1 text-sm md:text-base text-white placeholder-gray-500 placeholder-opacity-35 transition-colors relative z-30 pointer-events-auto"
                      style={{
                        fontFamily: 'Noto Sans TC, sans-serif',
                        width: '300px',
                      }}
                    />
                    {userInput.length > 0 && (
                      <div
                        className={`absolute left-0 top-full mt-1 pb-4 text-xs pointer-events-none ${
                          userInput.length > 200
                            ? 'text-red-400'
                            : userInput.length > 180
                            ? 'text-yellow-400'
                            : 'text-gray-500'
                        }`}
                        style={{ fontFamily: 'Noto Sans TC, sans-serif' }}
                      >
                        {userInput.length}/200 字元
                        {userInput.length > 200 && ' （超出限制）'}
                      </div>
                    )}
                  </div>
                </form>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top section: Main cover area (0-100vh) */}
      <div className="absolute top-0 left-0 right-0 h-screen">
        {/* Decorative connected blocks - from SVG design */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[1200px] aspect-[1152/382]">
          {/* Black blocks - rgba(0, 0, 0, 0.5) with flicker animation */}
          <div className="absolute backdrop-blur-lg left-0 top-0 w-[14.55%] h-[10.05%] animate-block-flicker-black" />
          <div className="absolute backdrop-blur-lg left-0 top-[30.05%] w-[85.45%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.1s' }} />
          <div className="absolute backdrop-blur-lg left-[14.55%] top-[20%] w-[85.45%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.2s' }} />
          <div className="absolute backdrop-blur-lg left-[85.45%] top-[39.85%] w-[14.55%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.3s' }} />
          <div className="absolute backdrop-blur-lg left-0 top-[70.05%] w-[85.45%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.4s' }} />
          <div className="absolute backdrop-blur-lg left-[14.55%] top-[60%] w-[85.45%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.5s' }} />
          <div className="absolute backdrop-blur-lg left-[85.45%] top-[89.95%] w-[14.55%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.6s' }} />
          <div className="absolute backdrop-blur-lg left-0 top-[50%] w-[14.55%] h-[10.05%] animate-block-flicker-black" style={{ animationDelay: '0.7s' }} />

          {/* White blocks - rgba(255, 255, 255, 0.21) with flicker animation */}
          <div className="absolute backdrop-blur-lg left-0 top-[40.1%] w-[85.45%] h-[9.8%] animate-block-flicker-white" />
          <div className="absolute backdrop-blur-lg left-[14.55%] top-[9.95%] w-[85.45%] h-[10.05%] animate-block-flicker-white" style={{ animationDelay: '0.1s' }} />
          <div className="absolute backdrop-blur-lg left-[85.45%] top-[30.05%] w-[14.55%] h-[10.05%] animate-block-flicker-white" style={{ animationDelay: '0.2s' }} />
          <div className="absolute backdrop-blur-lg left-0 top-[20%] w-[14.55%] h-[10.05%] animate-block-flicker-white" style={{ animationDelay: '0.3s' }} />
          <div className="absolute backdrop-blur-lg left-0 top-[80.15%] w-[85.45%] h-[9.8%] animate-block-flicker-white" style={{ animationDelay: '0.4s' }} />
          <div className="absolute backdrop-blur-lg left-[14.55%] top-[49.95%] w-[85.45%] h-[10.05%] animate-block-flicker-white" style={{ animationDelay: '0.5s' }} />
          <div className="absolute backdrop-blur-lg left-[85.45%] top-[70.05%] w-[14.55%] h-[10.05%] animate-block-flicker-white" style={{ animationDelay: '0.6s' }} />
          <div className="absolute backdrop-blur-lg left-0 top-[60%] w-[14.55%] h-[10.05%] animate-block-flicker-white" style={{ animationDelay: '0.7s' }} />
        </div>

        {/* Main content container - centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[1200px] h-auto">
          {/* Main title image */}
          <div className="absolute left-[5%] top-[-10vh] h-[7vh] w-auto z-10">
            <img
              src="/assets/title.svg"
              alt="服務聲 ISS Sounds Quarterly 醫"
              className="h-full w-auto"
            />
          </div>

          {/* Year 2025 */}
          <p
            className="absolute left-[5%] top-[2vh] text-[2.5vh] leading-normal text-white font-bold z-10"
            style={{ fontFamily: 'sans-serif' }}
          >
            2025
          </p>

          {/* Semicolon image - rotated */}
          <div
            className="absolute right-[10%] top-[-12vh] flex items-center justify-center mix-blend-luminosity z-10"
            style={{
              width: '12vh',
              height: '30vh',
            }}
          >
            <div className="rotate-90">
              <img
                src="/assets/semicolon-new.svg"
                alt="semicolon"
                className="w-[30vh] h-auto block"
              />
            </div>
          </div>

          {/* Description text */}
          <p
            className="absolute right-[10%] top-[5vh] w-[25%] text-[1.6vh] leading-normal text-white whitespace-pre-wrap z-10"
            style={{ fontFamily: 'sans-serif' }}
          >
            Since 2008, the institute has adopted unique educational practices to embed humanity into the learning environment, to involve industries into the educational context, and to generate domain relevant research outputs with theoretical methodologies.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
          <div className="text-xs text-gray-400 tracking-wider">SCROLL</div>
          <div className="w-px h-12 bg-gray-400" />
        </div>
      </div>

    </div>
  )
}
