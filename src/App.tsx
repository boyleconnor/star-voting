import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {getSTARWinner} from "./star.ts";
const votes = [
  new Map([["O'Brien", 5], ["Murphy", 3], ["Walsh", 0]]),
  new Map([["O'Brien", 3], ["Murphy", 2], ["Walsh", 1]]),
  new Map([["O'Brien", 1], ["Murphy", 0], ["Walsh", 3]]),
  new Map([["O'Brien", 2], ["Murphy", 3], ["Walsh", 2]]),
  new Map([["O'Brien", 3], ["Murphy", 0], ["Walsh", 1]]),
];

function App() {
  const [candidates, setCandidates] = useState(["O'Brien", "Murphy", "Walsh"]);

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
        <button onClick={() => getSTARWinner(votes)}>
          Calculate winner
        </button>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            {candidates.map((candidate, _) => <th>{candidate}</th>)}
          </tr>
          {votes.map((vote, i) => <tr>
            <td>{i}</td>
            {candidates.map((candidate, _) => <td>{vote.get(candidate)}</td>)}
          </tr>)}
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
