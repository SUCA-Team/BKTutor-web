import { useEffect, useState } from 'react'
import { courseAPI } from '../services/api'
import type { Course } from '../services/api'
import Footer from '../components/Footer'
import CourseDetail from '../components/CourseDetail'

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<Course | null>(null)

  useEffect(() => {
    loadMyCourses()
  }, [])

  async function loadMyCourses() {
    try {
      setLoading(true)
      const myCourses = await courseAPI.getMyCourses()
      setCourses(myCourses)
      setError(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } } | Error
      let msg = 'Lỗi khi tải khóa học'
      if ('response' in e && e.response?.data?.detail) {
        msg = e.response.data.detail
      } else if (e instanceof Error && e.message) {
        msg = e.message
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <main className="my-courses-page">
      <h1 className="page-title">Khóa Học Của Tôi</h1>

      {loading && <div className="loading">Đang tải...</div>}
      
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        courses.length === 0 ? (
          <div className="empty-placeholder">Bạn chưa có khóa học</div>
        ) : (
          <div className="my-courses-list">
            {courses.map((c) => (
              <article key={c.id} className="my-course-card">
                <div className="card-inner">
                  <div className="meta-label">Mã môn học</div>
                  <div className="course-code big">{c.code}</div>
                  <div className="course-title big">{c.name}</div>
                  <div className="tutor">Tutor: <strong>{c.tutor}</strong></div>

                  <hr />

                  <div className="course-info">
                    <div>Thời gian: {c.time}</div>
                    <div>Hình thức: {c.mode}</div>
                    <div>Lớp: {c.class_code}</div>
                    <div>Nội dung: {c.content}</div>
                  </div>

                  <div className="my-course-actions">
                    <button className="btn-details" onClick={() => setActive(c)}>Chi Tiết</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      )}

      {active && (
        <CourseDetail
          course={active}
          onClose={() => setActive(null)}
          onUnregisterSuccess={loadMyCourses}
        />
      )}
    </main>
      <Footer />
    </>
  )
}






