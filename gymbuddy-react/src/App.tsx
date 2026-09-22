import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AppShell from './pages/AppShell'
import CaseStudy from './pages/CaseStudy'
import Team from './pages/Team'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app/*" element={<AppShell />} />
      <Route path="/case-study" element={<CaseStudy />} />
      <Route path="/team" element={<Team />} />
    </Routes>
  )
}
