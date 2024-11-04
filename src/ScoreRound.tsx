export function ScoreRound(props: { sortedScores: [string, number][] }) {
  const [
    [firstCandidate, firstCandidateScore],
    [secondCandidate, secondCandidateScore],
    [, thirdCandidateScore],
  ] = props.sortedScores.slice(0, 3)

  return (
    <>
      {secondCandidateScore > thirdCandidateScore && (
        <p>
          <b>{firstCandidate}</b> (score: <b>{firstCandidateScore}</b>) and{" "}
          <b>{secondCandidate}</b> (score: <b>{secondCandidateScore}</b>)
          received the two highest total scores. The winner will be decided by
          voters' preferences between these candidates.
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Total score</th>
          </tr>
        </thead>
        <tbody>
          {props.sortedScores.map(([candidate, score]) => {
            const className =
              (candidate == firstCandidate && "first-candidate") ||
              (candidate == secondCandidate && "second-candidate") ||
              ""
            return (
              <tr key={candidate}>
                <td className={className}>{candidate}</td>
                <td>{score}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
