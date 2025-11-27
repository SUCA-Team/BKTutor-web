import { useEffect, useMemo, useRef, useState } from 'react'
import Footer from '../components/Footer'
import { courseAPI } from '../services/api'
import type { Course } from '../services/api'

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
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await courseAPI.getAllCourses()
        setCourses(data)
      } catch (err: any) {
        const msg = err.response?.data?.detail || err.message || 'Lỗi khi tải dữ liệu'
        setError(msg)
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
        alert(result.message || 'Đăng ký thất bại vì trùng lịch')
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Đăng ký thất bại vì trùng lịch'
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
      const title = normalizeSearch(c.name)
      const tutor = normalizeSearch(c.tutor)
      return title.includes(nq) || tutor.includes(nq)
    }).slice(0, pageSize)
  }, [q, courses, pageSize])

  // Use registeredCoursesMap for fast lookup
  const registered = registeredCoursesMap

  return (
    <>
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
        </div>
        <h1 className="page-title">Khóa học đề xuất</h1>

        <div className="course-grid">
          {filtered.map((c) => (
            <article key={c.id} className="course-card">
              <div className="card-head">
                <div className="course-code">{c.code}</div>
                <h2 className="course-title">{c.name}</h2>
              </div>
              <div className="card-body">
                <div className="tutor">Tutor: {c.tutor}</div>
                <div className="meta">Thời gian: {c.time} <br /> Hình thức: {c.mode} <br /> Lớp: {c.class_code} <br /> Nội dung: {c.content}</div>
              </div>
              <div className="card-actions">
                {registered[c.code] ? (
                  <button className="btn-registered" aria-label="Đã đăng ký" disabled>
                    Đã đăng ký
                  </button>
                ) : (
                  <button className="btn-register" onClick={() => handleRegister(c)} disabled={registeringCourses.has(c.code)}>
                    {registeringCourses.has(c.code) ? 'Đang đăng ký...' : 'Đăng ký'}
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
      <Footer />
    </>
  )
}
