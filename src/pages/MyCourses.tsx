import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI, type CourseCreateRequest } from '../services/api'
import type { Course } from '../services/api'
import Footer from '../components/Footer'
import CourseDetail from '../components/CourseDetail'

export default function MyCourses() {
  const { user } = useAuth()
  const canCreate = !!user && ['teacher', 'admin'].includes(user.role || '')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<Course | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [form, setForm] = useState<CourseCreateRequest>({
    code: '',
    name: '',
    tutor: '',
    time: '',
    mode: '',
    class_code: '',
    content: ''
  })

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

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const created = await courseAPI.createCourse(form)
      // refresh list and close form
      await loadMyCourses()
      setShowCreate(false)
      setForm({ code: '', name: '', tutor: '', time: '', mode: '', class_code: '', content: '' })
      alert(`Tạo khóa học thành công: ${created.name}`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } } | Error
      let msg = 'Tạo khóa học thất bại'
      if ('response' in e && e.response?.data?.detail) msg = e.response.data.detail
      else if (e instanceof Error && e.message) msg = e.message
      setCreateError(msg)
    }
    setCreating(false)
  }

  return (
    <>
    <main className="my-courses-page">
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Khóa Học Của Tôi</h1>
        {canCreate && (
          <button
            className="btn-create-course"
            onClick={() => setShowCreate(true)}
            aria-label="Tạo khóa học"
          >Tạo khóa học</button>
        )}
      </div>

      {loading && <div className="loading">Đang tải...</div>}
      
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !showCreate && (
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

      {showCreate && canCreate && (
        <section className="create-course-card">
          <h2 style={{ marginTop: 0 , textAlign: "center" }}>Tạo Khóa Học Mới</h2>
          <form onSubmit={handleCreateCourse} className="create-course-form">
            <label>
              Mã môn học
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </label>
            <label>
              Tên môn học
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Tutor
              <input value={form.tutor} onChange={(e) => setForm({ ...form, tutor: e.target.value })} required />
            </label>
            <label>
              Thời gian
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </label>
            <label>
              Hình thức
              <input value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} required />
            </label>
            <label>
              Lớp
              <input value={form.class_code} onChange={(e) => setForm({ ...form, class_code: e.target.value })} required />
            </label>
            <label>
              Nội dung
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} />
            </label>

            {createError && <div className="error" style={{ color: '#c62828' }}>{createError}</div>}

            <div className="actions">
              <button className="btn-primary" type="submit" disabled={creating}>
                {creating ? 'Đang tạo...' : 'Tạo khóa học'}
              </button>
              <button className="btn-secondary" type="button" onClick={() => setShowCreate(false)}>Hủy</button>
            </div>
          </form>
        </section>
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






