import AuthGuard from '@/components/AuthGuard'
import Nav from '@/components/Nav'

// ทุกหน้าในกลุ่ม (app) ต้อง Login ก่อน
export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <Nav />
      <main className="container">{children}</main>
    </AuthGuard>
  )
}
