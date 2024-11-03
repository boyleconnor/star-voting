export function getScores(votes: Map<string, number>[]) {
  const scores = new Map<string, number>()
  for (const vote of votes) {
    for (const candidate of vote.keys()) {
      const score = vote.get(candidate)
      if (!scores.has(candidate)) {
        scores.set(candidate, <number>score)
      } else {
        scores.set(candidate, <number>scores.get(candidate) + <number>score)
      }
    }
  }
  return scores
}

export function sortScores(scores: Map<string, number>) {
  return Array.from(scores.entries())
    .sort(([, firstScore], [, secondScore]) => firstScore - secondScore)
    .reverse()
}

export function getTopScorers(sortedScores: [string, number][]): string[] {
  if (sortedScores.length < 2) {
    throw new Error(`Invalid number of candidates: ${sortedScores.length}`)
  } else {
    const topScorers = sortedScores.slice(0, 2)
    const [, [, secondScore]] = topScorers
    for (let i = 2; i < sortedScores.length; i++) {
      const scorer = sortedScores[i]
      const [, score] = scorer
      if (score === secondScore) {
        topScorers.push(scorer)
      } else {
        break
      }
    }
    return topScorers.map(([candidate]) => candidate)
  }
}

export function getPreferences(
  firstCandidate: string,
  secondCandidate: string,
  votes: Map<string, number>[]
) {
  let [prefersFirst, prefersSecond] = [0, 0]
  for (const vote of votes) {
    const firstScore = <number>vote.get(<string>firstCandidate)
    const secondScore = <number>vote.get(<string>secondCandidate)
    if (firstScore > secondScore) {
      prefersFirst++
    } else if (firstScore < secondScore) {
      prefersSecond++
    }
  }
  const noPreference = votes.length - (prefersFirst + prefersSecond)

  console.log(`Preferences:`)
  for (const [candidate, prefersCount] of [
    [firstCandidate, prefersFirst],
    [secondCandidate, prefersSecond],
  ]) {
    console.log(`  - ${candidate} preferred by ${prefersCount} voters`)
  }
  console.log(
    `${noPreference} voters expressed no preference between ${firstCandidate} and ${secondCandidate}`
  )

  return { prefersFirst, prefersSecond, noPreference }
}

export function getSTARWinner(votes: Map<string, number>[]) {
  const scores = getScores(votes)

  console.log("Candidate scores:")
  for (const candidate of scores.keys()) {
    console.log(`${candidate}: ${scores.get(candidate)}`)
  }
  console.log("\n")

  // Find the top two candidates
  const sortedScores: [string, number][] = sortScores(scores)
  const topCandidates = getTopScorers(sortedScores)

  // FIXME: figure out what to do in the case of score ties
  if (topCandidates.length > 2) {
    throw new Error(
      `Logic not yet implemented for more than 2 top candidates: ${topCandidates.length}`
    )
  }
  const [firstCandidate, secondCandidate] = topCandidates
  const preferences = getPreferences(firstCandidate, secondCandidate, votes)
  console.log(preferences)
}
