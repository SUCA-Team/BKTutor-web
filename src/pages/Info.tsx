import { useEffect, useState } from 'react'

type Student = {
  name: string
  faculty?: string
  email?: string
  id?: string
  cohort?: string
  avatarUrl?: string
}

const FALLBACK: Student = {
  name: 'NGUYỄN NHẬT QUANG',
  faculty: 'Khoa Khoa học và Kỹ thuật Máy tính',
  email: 'unknown@example.com',
  id: '2352973',
  cohort: '2023',
}

export default function Info() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/student', { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (data && typeof data === 'object') setStudent(data as Student)
        else throw new Error('Invalid data')
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => ac.abort()
  }, [])

  const s = student ?? FALLBACK

  return (
    <main className="info-page">
      <h1 className="page-title">Thông Tin Sinh Viên</h1>

      {loading && <div className="loading">Đang tải thông tin...</div>}
      {error && <div className="error">Không tải được thông tin: {error}</div>}

      <section className="info-card">
        <div className="info-left">
          {s.avatarUrl ? (
            <img
              src={s.avatarUrl}
              alt="Avatar"
              className="info-avatar-img"
              onError={(e) => {
                // hide broken image and fall back to placeholder
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="info-avatar">Avatar</div>
          )}
        </div>
        <div className="info-right">
          <h2 className="info-name">{s.name}</h2>
          <div className="info-faculty">{s.faculty}</div>

          <div className="info-rows">
            <div className="row">
              <div className="label">E-mail</div>
              <div className="value">{s.email}</div>
            </div>
            <div className="row">
              <div className="label">MSSV</div>
              <div className="value">{s.id}</div>
            </div>
            <div className="row">
              <div className="label">Khóa</div>
              <div className="value">{s.cohort}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
