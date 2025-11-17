import { useEffect, useState } from 'react'
import { courseAPI } from '../services/api'
import type { Course } from '../services/api'
import { useEffect, useMemo, useState } from 'react'

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

type Material = { title: string; href: string }

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [active, setActive] = useState<Course | null>(null)

  useEffect(() => {
    async function loadMyCourses() {
      try {
        setLoading(true)
        const myCourses = await courseAPI.getMyCourses()
        setCourses(myCourses)
        setError(null)
      } catch (err: any) {
        const msg = err.response?.data?.detail || err.message || 'Lỗi khi tải khóa học'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    loadMyCourses()
  }, [])

  // sample materials per course; fallback to generic when not found
  const materialMap = useMemo<Record<string, Material[]>>(
    () => ({
      '1': [
        { title: 'Biên bản họp', href: '#' },
        { title: 'Document nhóm', href: '#' },
        { title: 'Link Google Meet', href: '#' },
      ],
      '2': [
        { title: 'Tài liệu SQL', href: '#' },
        { title: 'Slide tuần này', href: '#' },
        { title: 'Link Google Meet', href: '#' },
      ],
      '3': [
        { title: 'Ngữ pháp N3', href: '#' },
        { title: 'Từ vựng tuần', href: '#' },
      ],
      '4': [
        { title: 'Bài tập chương 1', href: '#' },
        { title: 'Tài liệu tham khảo', href: '#' },
      ],
    }),
    []
  )

  const materials: Material[] = active ? materialMap[active.id] ?? [] : []

  return (
    <main className="my-courses-page">
      <h1 className="page-title">Khóa Học Của Tôi</h1>

      {courses.length === 0 ? (
        <div className="empty-placeholder">Bạn chưa có khóa học</div>
      ) : (
        <div className="my-courses-list">
          {courses.map((c) => (
            <article key={c.id} className="my-course-card">
              <div className="card-inner">
                <div className="meta-label">Mã môn học</div>
                <div className="course-code big">{c.code}</div>
                <h2 className="course-title big">{c.title}</h2>

                <div className="tutor">Tutor: <strong>{c.tutor}</strong></div>

                <hr />

                <div className="course-info">
                  <div>Thời gian: {c.time}</div>
                  <div>Hình thức: {c.mode}</div>
                  <div>Lớp: {c.clazz}</div>
                  <div>Nội dung: {c.content}</div>
                </div>

                <div className="my-course-actions">
                  <button className="btn-details" onClick={() => setActive(c)}>Chi Tiết</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {active && (
        <div
          className="course-detail-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.currentTarget === e.target) setActive(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem',
            zIndex: 1000,
          }}
        >
          <div
            className="course-detail-panel"
            style={{
              background: '#061b4a',
              color: '#fff',
              width: 'min(1100px, 100%)',
              borderRadius: 16,
              padding: '1.25rem 1.25rem 2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>
                {active.title} ({active.code})
              </h2>
              <button
                aria-label="Đóng"
                onClick={() => setActive(null)}
                style={{
                  background: 'transparent',
                  color: '#cfd8ff',
                  fontSize: 28,
                  border: 'none',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 16, display: 'grid', gap: 20 }}>
              <section
                className="study-materials"
                style={{ background: '#fff', color: '#0b1d4a', borderRadius: 16, padding: '20px 24px' }}
              >
                <h3 style={{ marginTop: 0 }}>Tài liệu học tập</h3>
                {materials.length === 0 ? (
                  <div style={{ opacity: 0.7 }}>Chưa có tài liệu</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                    {materials.map((m, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🔗</span>
                        <a href={m.href} target="_blank" rel="noreferrer" style={{ color: '#0b5ed7', textDecoration: 'none' }}>
                          {m.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section
                className="announcements"
                style={{ background: '#fff', color: '#0b1d4a', borderRadius: 16, padding: '20px 24px', minHeight: 180 }}
              >
                <h3 style={{ marginTop: 0 }}>Thông báo</h3>
                <div style={{ opacity: 0.6, fontSize: 24, textAlign: 'center', paddingTop: 30 }}>Chưa có thông báo</div>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
