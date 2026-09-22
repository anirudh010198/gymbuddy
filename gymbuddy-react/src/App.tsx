import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// Route-level code splitting: visiting /app alone shouldn't ship the case
// study/team console bundles, and vice versa.
const Landing = lazy(() => import('./pages/Landing'))
const AppShell = lazy(() => import('./pages/AppShell'))
const CaseStudy = lazy(() => import('./pages/CaseStudy'))
const Team = lazy(() => import('./pages/Team'))
const Exercises = lazy(() => import('./pages/Exercises'))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<AppShell />} />
        <Route path="/case-study" element={<CaseStudy />} />
        <Route path="/team" element={<Team />} />
        <Route path="/exercises" element={<Exercises />} />
      </Routes>
    </Suspense>
  )
}
