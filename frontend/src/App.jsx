import { Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <main className="welcome">
      <h1>🌱 Portal de Admissão — Green House</h1>
      <p>Esqueleto v0.1 — as telas do candidato e do RH nascem aqui.</p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* /c/:token — jornada do candidato (link mágico) */}
      {/* /rh — painel do RH */}
    </Routes>
  )
}
