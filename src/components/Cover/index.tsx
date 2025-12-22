import { useEffect, useRef, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore'
import { SemicolonLogo } from '../ui/SemicolonLogo'

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
            if (retryCount < maxRetries) {
              retryCount++
              setTimeout(() => {
                if (unsubscribe) unsubscribe()
                setupListener()
              }, 1000 * retryCount)
            } else {
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
        setSentences([
          '服務聲既是一個社群；也是一份期刊',
          '服務聲延續你的想法；邀請你一起創作',
        ])
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(setupListener, 100)
    return () => {
      clearTimeout(timeoutId)
      if (unsubscribe) unsubscribe()
    }
  }, [isLoading])

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
    const calculateSpacings = () => {
      if (!coverRef.current) return
      const viewportHeight = window.innerHeight
      const coverTop = coverRef.current.getBoundingClientRect().top

      const newSpacings = charRefs.current.map((charEl) => {
        if (!charEl) return { letterSpacing: 0.2, marginBottom: 1, opacity: 0.3 }
        const charRect = charEl.getBoundingClientRect()
        const charTop = charRect.top
        const positionFromCoverTop = charTop - coverTop
        const positionInVh = positionFromCoverTop / viewportHeight

        let spacingRatio = 0
        let opacity = 0.3

        if (positionInVh > 1 && positionInVh <= 2) {
          spacingRatio = (positionInVh - 1)
          opacity = 0.4 + (spacingRatio * 0.6)
        } else if (positionInVh > 2) {
          spacingRatio = 1
          opacity = 1.0
        }

        const letterSpacing = 0.2 + (spacingRatio * 2.5)
        const marginBottom = 1 + (spacingRatio * 45)
        return { letterSpacing, marginBottom, opacity }
      })
      setCharSpacings(newSpacings)
    }
    setTimeout(calculateSpacings, 100)
  }, [characters.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim()) {
      const text = userInput.trim()
      if (text.length > 200) return
      setUserInput('')
      try {
        const sentencesRef = collection(db, 'coverSentences')
        await addDoc(sentencesRef, {
          text: text,
          createdAt: Timestamp.now()
        })
      } catch (error) {
        console.error('Error adding sentence:', error)
        setSentences(prev => [...prev, text])
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
                  </div>
                </form>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top section: Main cover area (0-100vh) */}
      <div className="absolute top-0 left-0 right-0 h-screen flex items-center justify-center">
        <div className="relative w-[85vw] max-w-[1200px] h-screen flex flex-col items-center justify-center">
          
          {/* Centered Logo */}
          <div className="z-10 animate-fade-in-slow">
            <SemicolonLogo className="h-[30vh] w-auto" />
          </div>

          {/* Title */}
          <div className="absolute left-[5%] top-[15%] h-[7vh] w-auto z-10">
            <img src="/assets/title.svg" alt="Title" className="h-full w-auto" />
          </div>

          {/* Year */}
          <p className="absolute left-[5%] top-[25%] text-[2.5vh] text-white font-bold z-10">2025</p>

          {/* Description */}
          <p className="absolute right-[5%] bottom-[20%] w-[30%] text-[1.6vh] text-white/80 text-right z-10">
            Since 2008, the institute has adopted unique educational practices to embed humanity into the learning environment.
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
          <div className="text-xs text-gray-400 tracking-wider">SCROLL</div>
          <div className="w-px h-12 bg-gray-400" />
        </div>
      </div>
    </div>
  )
}