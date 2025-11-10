import { useEffect, useMemo, useRef, useState } from 'react'

type Course = {
  id: string
  code: string
  title: string
  tutor: string
  time?: string
  mode?: string
  clazz?: string
  content?: string
}

const SAMPLE_COURSES: Course[] = [
  {
    id: '1',
    code: 'CO3001',
    title: 'Công nghệ Phần mềm',
    tutor: 'Đỗ Minh Huy',
    time: 'Thứ 3 20h-22h',
    mode: 'Online',
    clazz: 'CN01',
  },
  {
    id: '2',
    code: 'CO2013',
    title: 'Hệ cơ sở Dữ liệu',
    tutor: 'Trần Văn Duy',
    time: 'Thứ 3 10h-11h50',
    mode: 'Offline',
    clazz: 'CN01',
  },
  {
    id: '3',
    code: 'LA3025',
    title: 'Tiếng Nhật 5',
    tutor: 'Tô Nguyễn Khoa',
    time: 'Thứ 4 15h-16h50',
    mode: 'Online',
    clazz: 'CN01',
  },
  {
    id: '4',
    code: 'MA1001',
    title: 'Toán rời rạc',
    tutor: 'Nguyễn Văn A',
    time: 'Thứ 2 8h-10h',
    mode: 'Offline',
    clazz: 'CN02',
  },
]

function normalizeSearch(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .toLowerCase()
}

export default function Home() {
  const [q, setQ] = useState('')

  // data state
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // pagination / load-more
  const PAGE_INCREMENT = 6
  const [pageSize, setPageSize] = useState(PAGE_INCREMENT)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // fetch courses from API on mount
  useEffect(() => {
    const ac = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/courses', { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        // expect data to be Course[]; do a basic guard
        if (Array.isArray(data)) setCourses(data)
        else throw new Error('Invalid data')
      } catch (err) {
        // handle unknown error types (AbortError from fetch will be a DOMException in browsers)
        if (err instanceof DOMException && err.name === 'AbortError') return
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Lỗi khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => ac.abort()
  }, [reloadKey])

  // registered courses (persist in localStorage)
  const [registered, setRegistered] = useState<Record<string, Course>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bktutor_registered')
      if (raw) {
        const arr = JSON.parse(raw) as Course[]
        const map: Record<string, Course> = {}
        arr.forEach((c) => (map[c.id] = c))
        setRegistered(map)
      }
    } catch {
      // ignore
    }
  }, [])

  function saveRegistered(map: Record<string, Course>) {
    setRegistered(map)
    const arr = Object.values(map)
    try {
      localStorage.setItem('bktutor_registered', JSON.stringify(arr))
    } catch {
      // ignore
    }
  }

  function handleRegister(c: Course) {
    // add to registered map
    const next = { ...registered }
    next[c.id] = c
    saveRegistered(next)
  }

  // infinite scroll: load more when sentinel becomes visible
  useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading && pageSize < courses.length) {
          setPageSize((s) => s + PAGE_INCREMENT)
        }
      })
    })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [loading, courses.length, pageSize])

  const filtered = useMemo(() => {
    const source = courses.length ? courses : SAMPLE_COURSES
    if (!q) return source.slice(0, pageSize)
    const nq = normalizeSearch(q)
    return source.filter((c) => {
      const title = normalizeSearch(c.title)
      const tutor = normalizeSearch(c.tutor)
      return title.includes(nq) || tutor.includes(nq)
    }).slice(0, pageSize)
  }, [q, courses, pageSize])

  return (
    <main className="home-page">
      {loading && <div className="loading">Đang tải...</div>}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => setReloadKey((k) => k + 1)}>Thử lại</button>
        </div>
      )}
      <div className="search-bar">
        <input
          aria-label="Tìm kiếm"
          placeholder="Tìm kiếm khóa học, tutor,..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="search-input"
        />
        <button className="search-button" aria-label="Tìm">
          🔍
        </button>
      </div>

      <h1 className="page-title">Khóa học đề xuất</h1>

      <div className="course-grid">
        {filtered.map((c) => (
          <article key={c.id} className="course-card">
            <div className="card-head">
              <div className="course-code">{c.code}</div>
              <h2 className="course-title">{c.title}</h2>
            </div>
            <div className="card-body">
              <div className="tutor">Tutor: {c.tutor}</div>
              <div className="meta">{c.time} • {c.mode} • {c.clazz}</div>
            </div>
            <div className="card-actions">
              {registered[c.id] ? (
                <button className="btn-registered" aria-label="Đã đăng ký" disabled>
                  Đã đăng ký
                </button>
              ) : (
                <button className="btn-register" onClick={() => handleRegister(c)}>
                  Đăng ký
                </button>
              )}
            </div>
          </article>
        ))}
        {/* sentinel for infinite scroll */}
        <div ref={sentinelRef} />
      </div>
      {/* load more */}
      {!loading && courses.length > pageSize && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn-register" onClick={() => setPageSize((s) => s + PAGE_INCREMENT)}>
            Tải thêm
          </button>
        </div>
      )}
    </main>
  )
}
