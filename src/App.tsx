import {useState} from 'react'
import './App.css'
import {getPreferences, getScores, getSTARWinner, getTopScorers, sortScores, TopScoresResult} from "./star.ts";


interface Vote {
  id: number;
  scores: Map<string, number>;
}

const INITIAL_VOTES: Vote[] = [
  {id: 1, scores: new Map([["O'Brien", 5], ["Murphy", 3], ["Walsh", 0], ["Kelly", 1], ["O'Sullivan", 2]])},
  {id: 2, scores: new Map([["O'Brien", 3], ["Murphy", 2], ["Walsh", 1], ["Kelly", 1], ["O'Sullivan", 3]])},
  {id: 3, scores: new Map([["O'Brien", 2], ["Murphy", 0], ["Walsh", 3], ["Kelly", 2], ["O'Sullivan", 2]])},
  {id: 4, scores: new Map([["O'Brien", 2], ["Murphy", 3], ["Walsh", 2], ["Kelly", 1], ["O'Sullivan", 3]])},
  {id: 5, scores: new Map([["O'Brien", 3], ["Murphy", 0], ["Walsh", 1], ["Kelly", 2], ["O'Sullivan", 2]])},
];
const INITIAL_CANDIDATES = Array.from(INITIAL_VOTES[0].scores.keys());
const INITIAL_NEXT_ID = INITIAL_VOTES.map(vote => vote.id).reduce((previousId, id) => Math.max(previousId, id)) + 1;

// min & max scores (inclusive)
const MIN_SCORE = 0;
const MAX_SCORE = 5;

const GRADIENT_LEFT = [0xff, 0x00, 0x00];
const GRADIENT_RIGHT = [0x00, 0xff, 0x00];

function getColor(score: number) {
  const progress = (score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
  const colorCodes = GRADIENT_LEFT.map((code, i) => {
    return Math.ceil((1 - progress) * code) +
    Math.ceil(progress * GRADIENT_RIGHT[i]);
  });
  return `#${colorCodes[0].toString(16).padStart(2, "0")}${colorCodes[1].toString(16).padStart(2, "0")}${colorCodes[2].toString(16).padStart(2, "0")}`;
}

function App() {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [votes, setVotes] = useState(INITIAL_VOTES);
  const [newCandidate, setNewCandidate] = useState("");
  const [nextId, setNextId] = useState(INITIAL_NEXT_ID);

  const addVote = () => {
    setVotes(votes.concat({id: nextId, scores: new Map(candidates.map(candidate => [candidate, 0]))}));
    setNextId(nextId + 1);
  }

  const addCandidate = () => {
    if (candidates.includes(newCandidate) || newCandidate === "") {
      alert("New candidate name must be unique and non-empty");
      return;
    }
    setCandidates(candidates.concat(newCandidate));
    const newVotes = votes.map(vote => {
      const newScores = new Map(vote.scores.entries());
      newScores.set(newCandidate, 0);
      return {id: vote.id, scores: newScores};
    })
    setVotes(newVotes);
    setNewCandidate("");
  }

  const setScore = (id: number, candidate: string, score: number) => {
    const newVotes = votes.map(vote => {
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
          scores: new Map(scores.filter(([_candidate,]) => _candidate != candidate))
        };});
    setVotes(newVotes);

    const newCandidates = candidates.filter(_candidate => _candidate != candidate);
    setCandidates(newCandidates);
  }

  const totalScores = getScores(votes.map(vote => vote.scores));
  const sortedScores = sortScores(totalScores);
  const [topScoreResult, topCandidates] = getTopScorers(sortedScores);

  // FIXME: We just assume there are no ties and run this on the first two scorers in the sorted list
  const [firstCandidate, secondCandidate] = topCandidates.slice(0, 2)
  const preferences = getPreferences(firstCandidate, secondCandidate, votes.map(vote => vote.scores));

  // FIXME: We should display an explanation/reason for victory or tie
  let winner = null;
  if (preferences.prefersFirst > preferences.prefersSecond) {
    winner = firstCandidate;
  } else if (preferences.prefersFirst < preferences.prefersSecond) {
    winner = secondCandidate;
  } else if (topScoreResult !== TopScoresResult.TieForFirst) {
    winner = firstCandidate;
  }

  return (
    <>
      <h1>STAR Voting</h1>
      <div className="card">
        <button onClick={() => getSTARWinner(votes.map(vote => vote.scores))}>
          Calculate winner
        </button>
        <table>
          <thead>
          <tr>
            <th></th>
            {candidates.map(candidate => <th key={candidate}><button onClick={() => deleteCandidate(candidate)}>✖</button></th>)}
          </tr>
          <tr>
            <th>ID</th>
            {candidates.map(candidate => <th key={candidate}>{candidate}</th>)}
            <th></th>
          </tr>
          </thead>
          <tbody>
          {votes.map(vote => <tr key={vote.id}>
            <td>{vote.id}</td>
            {candidates.map(candidate => <td key={candidate}>
              <input style={{ backgroundColor: getColor(vote.scores.get(candidate) as number)}} type="number" min={MIN_SCORE} max={MAX_SCORE} value={vote.scores.get(candidate)} onChange={(e) => {setScore(vote.id, candidate, parseInt(e.target.value))}} />
            </td>)}
            <td><button onClick={() => {deleteVote(vote.id)}}>✖</button></td>
          </tr>)}
          <tr>
            <td></td>
            {candidates.map(candidate => <td key={candidate}></td>)}
            <td><button onClick={addVote} style={{ fontSize: 18 }}><b>+</b></button></td>
          </tr>
          </tbody>
        </table>
      </div>
      <input type="text" value={newCandidate} onChange={(e) => setNewCandidate(e.target.value)}></input>
      <button onClick={addCandidate}>Add candidate</button>

      <h2>Score round</h2>
      <table>
        <thead><tr>
          <th>Candidate</th>
          <th>Total score</th>
        </tr></thead>
        <tbody>
          {sortedScores.map(([candidate, score]) => <tr>
            <td style={{backgroundColor: (topCandidates.includes(candidate) && "#EEEEEE") || "#FFFFFF"}}>{candidate}</td>
            <td>{score}</td>
          </tr>)}
        </tbody>
      </table>

      <h2>Run-off Round</h2>
      {(topScoreResult === TopScoresResult.NoTie && <>
        <table>
          <thead>
          <tr>
            <th colSpan={3}>How many voters prefer:</th>
          </tr>
          <tr>
            <th>{firstCandidate}</th>
            <th><i>neither</i></th>
            <th>{secondCandidate}</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{preferences.prefersFirst}</td>
            <td>{preferences.noPreference}</td>
            <td>{preferences.prefersSecond}</td>
          </tr>
          </tbody>
        </table>
        <p>Winner: {winner !== null ? winner: <i>Tie</i>}</p>
      </>) || <>
        <i>Breaking ties in the scoring round is not yet supported in this app.</i>
      </>}
    </>
  )
}

export default App
