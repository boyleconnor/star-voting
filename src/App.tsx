import {useState} from 'react'
import './App.css'
import {getPreferences, getScores, getTopScorers, sortScores} from "./star.ts";
import useLocalStorage from "./local_storage.ts";


interface Vote {
  id: number;
  scores: number[];
}

const INITIAL_VOTES: Vote[] = [
  {id: 1, scores: [5, 4, 0, 1]},
  {id: 2, scores: [5, 2, 1, 0]},
  {id: 3, scores: [0, 0, 5, 2]},
  {id: 4, scores: [2, 5, 2, 0]},
  {id: 5, scores: [5, 3, 1, 0]},
];
const INITIAL_CANDIDATES = ["O'Brien", "Murphy", "Walsh", "Kelly"];

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

function arraysToMaps(candidates: string[], votes: Vote[]): Map<string, number>[] {
  return votes.map(vote => new Map(candidates.map((candidate, i) => [candidate, vote.scores[i]])));
}

function App() {
  const [candidates, setCandidates] = useLocalStorage("candidates", INITIAL_CANDIDATES);
  const [votes, setVotes] = useLocalStorage("votes", INITIAL_VOTES);
  const [newCandidate, setNewCandidate] = useState("");

  const getNextId = () => {
    return Math.max(...votes.map(vote => vote.id))+1;
  }

  const addVote = () => {
    setVotes(votes.concat({id: getNextId(), scores: Array.from(candidates.map(() => 0))}));
  }

  const addCandidate = () => {
    if (candidates.includes(newCandidate) || newCandidate === "") {
      alert("New candidate name must be unique and non-empty");
      return;
    }
    setCandidates(candidates.concat(newCandidate));
    const newVotes = votes.map((vote: Vote) => {
      const newScores = [...vote.scores, 0];
      return {id: vote.id, scores: newScores};
    })
    setVotes(newVotes);
    setNewCandidate("");
  }

  const setScore = (id: number, candidate: string, rawScore: number) => {
    // FIXME: This leads to some weird behavior in the UI (if you type another digit after an existing one, it jumps to 5)
    const sanitizedScore = Math.max(Math.min(rawScore, MAX_SCORE), MIN_SCORE);
    const candidateIndex = candidates.findIndex(value => value === candidate);
    const newVotes = votes.map(vote => {
      if (vote.id == id) {
        const newScores = [...vote.scores.slice(0, candidateIndex), sanitizedScore, ...vote.scores.slice(candidateIndex + 1)];
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
    const candidateIndex = candidates.findIndex(value => value === candidate);
    const newVotes = votes
        .map(({id, scores}) => { return {
          id: id,
          scores: [...scores.slice(0, candidateIndex), ...scores.slice(candidateIndex + 1)],};
        })
    setVotes(newVotes);

    const newCandidates = candidates.filter(_candidate => _candidate != candidate);
    setCandidates(newCandidates);
  }

  const totalScores = getScores(arraysToMaps(candidates, votes));
  const sortedScores = sortScores(totalScores);
  const topCandidates = getTopScorers(sortedScores);

  // FIXME: We just assume there are no ties and run this on the first two scorers in the sorted list
  const [firstCandidate, secondCandidate] = topCandidates.slice(0, 2)
  const [firstCandidateIndex, secondCandidateIndex] = [candidates.findIndex(value => value === firstCandidate), candidates.findIndex(value => value === secondCandidate)]
  const preferences = getPreferences(firstCandidate, secondCandidate, arraysToMaps(candidates, votes));

  // FIXME: We should display an explanation/reason for victory or tie
  let winner = null;
  if (preferences.prefersFirst > preferences.prefersSecond) {
    winner = firstCandidate;
  } else if (preferences.prefersFirst < preferences.prefersSecond) {
    winner = secondCandidate;
  } else if (totalScores.get(firstCandidate) !== totalScores.get(secondCandidate)) {
    winner = firstCandidate;
  }

  return (
    <>
      <h1>STAR Voting</h1>

      <h2>Introduction</h2>
      <p>
        In an election using the <a href="https://www.starvoting.org/">STAR voting</a> system, each voter assigns a
        score to every candidate (customarily, on the inclusive range of zero to five). The winner of the election
        will be decided based on a combination of the summed total scores that each candidate wins, as well as each
        voter's implicit preferences between the top-scoring candidates, which can be inferred from their relative
        scoring of the candidates.
      </p>
      <p>
        Below is a STAR election simulator. Try changing or adding ballots & candidates to see how it affects the
        election result!
      </p>
      <h2>Ballots</h2>
      <table className="ballots">
        <thead>
        <tr>
          <th colSpan={2}></th>
          {candidates.map(candidate => <th key={candidate} className="candidate-delete cell-button"
                                           onClick={() => deleteCandidate(candidate)}>✖</th>)}
          <th onClick={addCandidate} className="candidate-add cell-button" style={{fontSize: "18px"}}>+</th>
        </tr>
        <tr>
          <td></td>
          <th>Ballot No.</th>
          {candidates.map(candidate => <th key={candidate}>{candidate}</th>)}
          <th><input type="text" placeholder="candidate" className="candidate candidate-input" value={newCandidate}
                     onChange={(e) => setNewCandidate(e.target.value)} onKeyDown={e => {
            if (e.key == 'Enter') {
              addCandidate()
            }
          }}/></th>
        </tr>
        </thead>
        <tbody>
        {votes.map(vote => <tr className="ballot" key={vote.id}>
          <td className="vote-delete cell-button" onClick={() => {
            deleteVote(vote.id)
          }}>✖
          </td>
          <td>{vote.id}</td>
          {candidates.map((candidate, candidateIndex) => <td className="ballot" key={candidate}>
            <input className="score" style={{ backgroundColor: getColor(vote.scores[candidateIndex]) }}
                   type="number" min={MIN_SCORE} max={MAX_SCORE} value={vote.scores[candidateIndex]} onChange={(e) => {
              setScore(vote.id, candidate, parseInt(e.target.value))
            }}/>
          </td>)}
          <td></td>
        </tr>)}
        <tr>
          <td colSpan={2}/>
          <td colSpan={candidates.length} className="vote-add cell-button" onClick={addVote} style={{fontSize: 18}}><b>+</b></td>
        </tr>
        </tbody>
      </table>

      <h2>Score Round</h2>
      {topCandidates.length == 2 && (<p>
        <b>{firstCandidate}</b> (score: <b>{totalScores.get(firstCandidate)}</b>)
        and <b>{secondCandidate}</b> (score: <b>{totalScores.get(secondCandidate)}</b>) received the two highest total
        scores.
        The winner will be decided by voters' preferences between these candidates.
      </p>)}
      <table>
        <thead>
        <tr>
          <th>Candidate</th>
          <th>Total score</th>
        </tr>
        </thead>
        <tbody>
        {sortedScores.map(([candidate, score]) => <tr key={candidate}>
          <td className={(candidate == firstCandidate && "first-candidate") || (candidate == secondCandidate && "second-candidate") || ""}>{candidate}</td>
            <td>{score}</td>
          </tr>)}
        </tbody>
      </table>

      <h2>Runoff Round</h2>
      {(topCandidates.length == 2 && <>
        <table>
          <thead><tr>
            <th>Ballot No.</th>
            <th>{firstCandidate}</th>
            <th>{secondCandidate}</th>
            <th>Preference</th>
          </tr></thead>
          <tbody>
          {votes.map(vote => <tr>
            <td>{vote.id}</td>
            <td style={{ backgroundColor: getColor(vote.scores[firstCandidateIndex]) }}>{vote.scores[firstCandidateIndex]}</td>
            <td style={{ backgroundColor: getColor(vote.scores[secondCandidateIndex]) }}>{vote.scores[secondCandidateIndex]}</td>
            {
              (vote.scores[firstCandidateIndex] > vote.scores[secondCandidateIndex] && <td className="first-candidate">{firstCandidate}</td>) ||
              (vote.scores[firstCandidateIndex] < vote.scores[secondCandidateIndex] && <td className="second-candidate">{secondCandidate}</td>) ||
              <td style={{ backgroundColor: "gray"}}><i>neither</i></td>
            }
          </tr>)}
          </tbody>
        </table>

        <ul style={{ alignSelf: "center"}}>
          <li><b>{preferences.noPreference}</b> voter(s) (<i>{(100 * preferences.noPreference / votes.length).toFixed(2)}%</i>) expressed <b>no preference</b> between top candidates</li>
          <li><b>{preferences.prefersFirst}</b> voter(s) (<i>{(100 * preferences.prefersFirst / votes.length).toFixed(2)}%</i>) prefer <b className="first-candidate">{firstCandidate}</b> over <b className="second-candidate">{secondCandidate}</b></li>
          <li><b>{preferences.prefersSecond}</b> voter(s) (<i>{(100 * preferences.prefersSecond / votes.length).toFixed(2)}%</i>) prefer <b className="second-candidate">{secondCandidate}</b> over <b className="first-candidate">{firstCandidate}</b></li>
        </ul>

        <br/>
        <br/>
        {winner !== null &&
          <h1>Winner: <span
            className={winner === firstCandidate ? "first-candidate" : "second-candidate"}>{winner}</span>
          </h1>
          || <h1>Tie between <span className="first-candidate">{firstCandidate}</span> & <span
            className="second-candidate">{secondCandidate}</span></h1>
        }
      </>) || <>
      <i>Breaking ties in the scoring round is not yet supported in this app.</i>
      </>}
    </>
  )
}

export default App
