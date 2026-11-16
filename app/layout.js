import './globals.css'

export const metadata = {
  title: 'Drone Fleet & Mission Management',
  description: 'ระบบจัดการฝูงโดรนและภารกิจแบบครบวงจร (AIE313)',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
