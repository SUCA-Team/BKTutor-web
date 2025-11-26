
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

export default function Info() {
  const { user } = useAuth()

  return (
    <>
      <main className="info-page">
        <h1 className="page-title">Thông Tin Sinh Viên</h1>
        <section className="info-card">
          <div className="info-left">
            {/* No avatarUrl in User type; always show placeholder */}
            <div className="info-avatar">Avatar</div>
          </div>
          <div className="info-right">
            <h2 className="info-name">{user?.full_name || 'Chưa đăng nhập'}</h2>
            <div className="info-rows">
              <div className="row">
                <div className="label">Khoa</div>
                <div className="value">Chưa cập nhật</div>
              </div>
              <div className="row">
                <div className="label">E-mail</div>
                <div className="value">{user?.email || ''}</div>
              </div>
              <div className="row">
                <div className="label">MSSV</div>
                <div className="value">{user?.id ?? ''}</div>
              </div>
              <div className="row">
                <div className="label">Khóa</div>
                <div className="value">Chưa cập nhật</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
