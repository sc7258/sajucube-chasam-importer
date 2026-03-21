import { BrowserRouter, Routes, Route, Link } from 'react-router'
import ImportPage from './pages/ImportPage'
import ReviewPage from './pages/ReviewPage'
import ManualInputPage from './pages/ManualInputPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-3 flex items-center gap-6">
          <h1 className="font-bold text-lg">차샘 만세력 Importer</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="text-blue-600 hover:underline">JSON 임포트</Link>
            <Link to="/manual" className="text-blue-600 hover:underline">수동 입력</Link>
          </nav>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<ImportPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/manual" element={<ManualInputPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
