import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {getSTARWinner} from "./star.ts";


interface Vote {
  id: number;
  scores: Map<string, number>;
}

const INITIAL_VOTES: Vote[] = [
  {id: 1, scores: new Map([["O'Brien", 5], ["Murphy", 3], ["Walsh", 0]])},
  {id: 2, scores: new Map([["O'Brien", 3], ["Murphy", 2], ["Walsh", 1]])},
  {id: 3, scores: new Map([["O'Brien", 1], ["Murphy", 0], ["Walsh", 3]])},
  {id: 4, scores: new Map([["O'Brien", 2], ["Murphy", 3], ["Walsh", 2]])},
  {id: 5, scores: new Map([["O'Brien", 3], ["Murphy", 0], ["Walsh", 1]])},
];
const INITIAL_NEXT_ID = INITIAL_VOTES.map(vote => vote.id).reduce((previousId, id, _, __) => Math.max(previousId, id)) + 1;

function App() {
  const [candidates, setCandidates] = useState(["O'Brien", "Murphy", "Walsh"]);
  const [votes, setVotes] = useState(INITIAL_VOTES);
  const [newCandidate, setNewCandidate] = useState("");
  const [nextId, setNextId] = useState(INITIAL_NEXT_ID);

  const addVote = () => {
    setVotes(votes.concat({id: nextId, scores: new Map(candidates.map((candidate, _) => [candidate, 0]))}));
    setNextId(nextId + 1);
  }

  const addCandidate = () => {
    if (candidates.includes(newCandidate)) {
      return;
    }
    setCandidates(candidates.concat(newCandidate));
    const newVotes = votes.map((vote, _) => {
      const newScores = new Map(vote.scores.entries());
      newScores.set(newCandidate, 0);
      return {id: vote.id, scores: newScores};
    })
    setVotes(newVotes);
    setNewCandidate("");
  }

  const setScore = (id: number, candidate: string, score: number) => {
    const newVotes = votes.map((vote, _) => {
      if (vote.id == id) {
        const newScores = new Map(vote.scores.entries());
        newScores.set(candidate, score);
        return {id: vote.id, scores: newScores};
      } else {
        return {id: vote.id, scores: vote.scores};
      }
    })
    setVotes(newVotes);
  }

  const deleteVote = (id: number) => {
    const newVotes = votes.filter((vote) => vote.id != id);
    setVotes(newVotes);
  }

  const deleteCandidate = (candidate: string) => {
    const newVotes = votes
        .map(({id, scores}) => { return {
          id: id,
          scores: Array.from(scores.entries())};
        })
        .map(({id, scores}) => { return {
          id: id,
          scores: new Map(scores.filter(([_candidate, _score]) => _candidate != candidate))
        };});
    setVotes(newVotes);

    const newCandidates = candidates.filter(_candidate => _candidate != candidate);
    setCandidates(newCandidates);
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo"/>
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo"/>
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => getSTARWinner(votes.map(vote => vote.scores))}>
          Calculate winner
        </button>
        <table>
          <thead>
          <tr>
            <th></th>
            {candidates.map((candidate, _) => <th key={candidate}><button onClick={() => deleteCandidate(candidate)}>❌</button></th>)}
          </tr>
          <tr>
            <th>ID</th>
            {candidates.map((candidate, _) => <th key={candidate}>{candidate}</th>)}
            <th></th>
          </tr>
          {votes.map((vote, _) => <tr key={vote.id}>
            <td>{vote.id}</td>
            {candidates.map((candidate, _) => <td key={candidate}>
              <input type="number" value={vote.scores.get(candidate)} onChange={(e) => {setScore(vote.id, candidate, parseInt(e.target.value))}} />
            </td>)}
            <td><button onClick={() => {deleteVote(vote.id)}}>❌</button></td>
          </tr>)}
          </thead>
        </table>
      </div>
      <button onClick={addVote}>Add vote</button>
      <input type="text" value={newCandidate} onChange={(e) => setNewCandidate(e.target.value)}></input>
      <button onClick={addCandidate}>Add candidate</button>
    </>
  )
}

export default App
