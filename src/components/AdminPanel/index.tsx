import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'

const ADMIN_PASSWORD = '713580'

interface SentenceDoc {
  id: string
  text: string
  createdAt: Timestamp
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [sentences, setSentences] = useState<SentenceDoc[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load sentences from Firebase
  useEffect(() => {
    if (!isAuthenticated) return

    const sentencesRef = collection(db, 'coverSentences')
    const q = query(sentencesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedSentences: SentenceDoc[] = []
        snapshot.forEach((docSnapshot) => {
          loadedSentences.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as SentenceDoc)
        })
        setSentences(loadedSentences)
        setIsLoading(false)
      },
      (error) => {
        console.error('Error loading sentences:', error)
        setError('載入資料失敗')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError(null)
    } else {
      setError('密碼錯誤')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coverSentences', id))
    } catch (error) {
      console.error('Error deleting sentence:', error)
      alert('刪除失敗，請重試')
    }
  }

  const handleEdit = (sentence: SentenceDoc) => {
    setEditingId(sentence.id)
    setEditText(sentence.text)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) {
      alert('內容不能為空')
      return
    }

    try {
      await updateDoc(doc(db, 'coverSentences', id), {
        text: editText.trim()
      })
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Error updating sentence:', error)
      alert('更新失敗，請重試')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString('zh-TW')
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">管理員登入</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="請輸入密碼"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              登入
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">內容管理</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            登出
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">載入中...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : sentences.length === 0 ? (
          <div className="text-center py-12 text-gray-400">目前沒有任何內容</div>
        ) : (
          <div className="space-y-4">
            {sentences.map((sentence) => (
              <div
                key={sentence.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                {editingId === sentence.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(sentence.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        儲存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <p className="text-lg mb-4 whitespace-pre-wrap">{sentence.text}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        建立時間: {formatDate(sentence.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(sentence)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(sentence.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-gray-400 text-sm">
          共 {sentences.length} 筆內容
        </div>
      </div>
    </div>
  )
}
