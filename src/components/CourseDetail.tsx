import React, { useState } from 'react';
import type { Course } from '../services/api';
import { courseAPI } from '../services/api';
import './CourseDetail.css';

interface Props {
  course: Course;
  onClose: () => void;
  onUnregisterSuccess?: () => void;
}

const CourseDetail: React.FC<Props> = ({ course, onClose, onUnregisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleUnregister = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký khóa học này?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await courseAPI.unregisterFromCourse(course.code);
      
      if (res.success) {
        alert('Đã hủy đăng ký thành công!');
        if (typeof onUnregisterSuccess === 'function') {
          onUnregisterSuccess();
        }
        onClose();
      } else {
        setError(res.message || 'Hủy đăng ký thất bại!');
      }
    } catch (e) {
      setError('Có lỗi xảy ra, vui lòng thử lại!');
    }
    setLoading(false);
  };
  return (
    <div className="course-detail-overlay" role="dialog" aria-modal="true">
      <div className="course-detail-container">
        <button className="course-detail-close" aria-label="Đóng" onClick={onClose}>×</button>
        <h1 className="course-detail-title">{course.name} ({course.code})</h1>

        <div className="course-detail-cards">
          <section className="study-material-card">
            <h2>TÀI LIỆU HỌC TẬP</h2>
            <ul className="material-list">
              <li>
                <span className="material-icon" aria-hidden>📄</span>
                <a href="#" onClick={(e) => e.preventDefault()}>Biên bản họp</a>
              </li>
              <li>
                <span className="material-icon" aria-hidden>🔗</span>
                <a href="#" onClick={(e) => e.preventDefault()}>Document nhóm</a>
              </li>
              <li>
                <span className="material-icon" aria-hidden>🔗</span>
                <a href="#" onClick={(e) => e.preventDefault()}>Link Google Meet</a>
              </li>
            </ul>
          </section>

          <section className="notification-card">
            <h2>THÔNG BÁO</h2>
            <div className="notification-empty">Chưa có thông báo</div>
          </section>
          <div className="course-detail-actions">
            <button
          className="unregister-btn"
          disabled={loading}
          onClick={handleUnregister}
        >{loading ? 'Đang xử lý...' : 'Hủy đăng ký'}</button>
        {error && (
          <div style={{color:'#d32f2f',textAlign:'right',marginRight:32,marginTop:8,fontWeight:500}}>{error}</div>
        )}
          </div>
        </div>
        <footer className="course-detail-footer">
          <small>Copyright © 2025 SUCA Team. All rights reserved.</small>
          <small>Version 0.01</small>
        </footer>
      </div>
    </div>
  );
};

export default CourseDetail;
