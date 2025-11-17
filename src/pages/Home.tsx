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
  const [reloadKey] = useState(0)

  // pagination / load-more
  const PAGE_INCREMENT = 6
  const [pageSize, setPageSize] = useState(PAGE_INCREMENT)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // fetch courses from API on mount
  useEffect(() => {
    async function load() {
      setLoading(true)
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
  }, [reloadKey])

  // registered courses 
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>([])
  const [registeringCourses, setRegisteringCourses] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadMyCourses() {
      try {
        const myCourses = await courseAPI.getMyCourses()
        setRegisteredCourses(myCourses)
      } catch (err) {
        // User might not be logged in, ignore error
        console.warn('Could not load user courses:', err)
      }
    }
    loadMyCourses()
  }, [])

  const registeredCoursesMap = useMemo(() => {
    const map: Record<string, Course> = {}
    registeredCourses.forEach((c) => (map[c.code] = c))
    return map
  }, [registeredCourses])

  async function handleRegister(c: Course) {
    if (registeringCourses.has(c.code)) return
    
    setRegisteringCourses(prev => new Set([...prev, c.code]))
    try {
      const result = await courseAPI.registerForCourse(c.code)
      if (result.success) {
        // Refresh the registered courses
        const myCourses = await courseAPI.getMyCourses()
        setRegisteredCourses(myCourses)
      } else {
        alert(result.message || 'Đăng ký thất bại')
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Đăng ký thất bại'
      alert(msg)
    } finally {
      setRegisteringCourses(prev => {
        const next = new Set(prev)
        next.delete(c.code)
        return next
      })
    }
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
    if (!q) return courses.slice(0, pageSize)
    const nq = normalizeSearch(q)
    return courses.filter((c: Course) => {
      const title = normalizeSearch(c.title)
      const tutor = normalizeSearch(c.tutor)
      return title.includes(nq) || tutor.includes(nq)
    }).slice(0, pageSize)
  }, [q, courses, pageSize])

  return (
    <main className="home-page">
      {loading && <div className="loading">Đang tải...</div>}
      {/* No error UI: fail silently and use SAMPLE_COURSES */}
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
