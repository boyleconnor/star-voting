import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [candidates, setCandidates] = useState(["Murphy", "O'Brien", "Walsh"]);
  const [newCandidate, setNewCandidate] = useState("");

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <input type="text" aria-label="new candidate" id="new-candidate" value={newCandidate} onChange={e => {
          setNewCandidate(e.target.value)
        }}/>
        <button onClick={() => setCandidates(candidates.concat([newCandidate]))}>
          Add candidate
        </button>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            {candidates.map((candidate, _) => <th>{candidate}</th>)}
          </tr>
          </thead>
        </table>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
