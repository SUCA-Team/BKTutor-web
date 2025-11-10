import { useEffect, useState } from 'react'

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

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bktutor_registered')
      if (raw) {
        const arr = JSON.parse(raw) as Course[]
        setCourses(arr)
      } else setCourses([])
    } catch {
      setCourses([])
    }
  }, [])

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
                  {c.content && <div>Nội dung: {c.content}</div>}
                </div>

                <div className="my-course-actions">
                  <button className="btn-details">Chi Tiết</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
