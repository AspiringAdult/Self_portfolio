import './globals.css'

export const metadata = {
  title: 'Diptangkush Das — Multiverse of Systems',
  description: 'A cinematic 3D portfolio. Digital vigilante engineer operating across AI, cybersecurity, trading systems and data intelligence.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased overflow-x-hidden bg-[#03050a] text-white selection:bg-cyan-500/40 selection:text-white">
        {children}
      </body>
    </html>
  )
}
