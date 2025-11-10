import Home from './Home'
import Info from './Info'
import MyCourses from './MyCourses'
import Settings from './Settings'

export type AppRoute = {
  path: string
  name: string
  component: React.ComponentType
}

export const ROUTES: AppRoute[] = [
  { path: '/', name: 'Trang chủ', component: Home },
  { path: '/info', name: 'Thông Tin', component: Info },
  { path: '/courses', name: 'Khóa học của tôi', component: MyCourses },
  { path: '/settings', name: 'Cài đặt', component: Settings },
]

export default ROUTES
