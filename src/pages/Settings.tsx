import { useEffect, useState } from 'react'

export default function Settings() {
  const [lang, setLang] = useState('vi')
  const [notifyByEmail, setNotifyByEmail] = useState(true)

  useEffect(() => {
    try {
      const l = localStorage.getItem('bktutor_lang')
      if (l) setLang(l)
    } catch {
      // ignore
    }
    try {
      const n = localStorage.getItem('bktutor_notify')
      if (n) setNotifyByEmail(n === '1')
    } catch {
      // ignore
    }
  }, [])

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setLang(v)
    try {
      localStorage.setItem('bktutor_lang', v)
    } catch {
      // ignore
    }
  }

  function handleToggle() {
    const next = !notifyByEmail
    setNotifyByEmail(next)
    try {
      localStorage.setItem('bktutor_notify', next ? '1' : '0')
    } catch {
      // ignore
    }
  }

  return (
    <main className="settings-page">
      <h1 className="page-title">Cài Đặt</h1>

      <section className="settings-card">
        <div className="settings-label">NGÔN NGỮ</div>
        <div className="settings-control">
          <select aria-label="Ngôn ngữ" value={lang} onChange={handleLangChange} className="settings-select">
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-label">THÔNG BÁO</div>
        <div className="settings-control" style={{ alignItems: 'center' }}>
          <div>Bật thông báo qua email</div>
          <div className="toggle-wrapper">
            <button
              className={"toggle-switch" + (notifyByEmail ? ' on' : '')}
              aria-pressed={notifyByEmail}
              onClick={handleToggle}
              aria-label="Bật tắt thông báo qua email"
            >
              <span className="knob" />
            </button>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-label">HỖ TRỢ</div>
        <div className="settings-control support-grid">
          <a className="support-link" href="#">Liên hệ Tổ kỹ thuật</a>
          <a className="support-link" href="#">FAQ Hướng dẫn</a>
          <a className="support-link" href="#">Góp ý, Báo lỗi</a>
        </div>
      </section>
    </main>
  )
}
