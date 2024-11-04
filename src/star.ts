import {Election} from "./models.ts";

export function getScores(election: Election) {
  const totalScores = new Map<string, number>()
  for (const vote of election.votes) {
    for (const [candidateIndex, candidate] of election.candidates.entries()) {
      const score = vote.scores[candidateIndex];
      if (!totalScores.has(candidate)) {
        totalScores.set(candidate, <number>score)
      } else {
        totalScores.set(candidate, <number>totalScores.get(candidate) + <number>score)
      }
    }
  }
  return totalScores
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
  election: Election
) {
  const [firstCandidateIndex, secondCandidateIndex] = [firstCandidate, secondCandidate].map((topCandidate) => election.candidates.findIndex((candidate) => candidate === topCandidate))
  let [prefersFirst, prefersSecond] = [0, 0]
  for (const vote of election.votes) {
    const [firstScore, secondScore] = [vote.scores[firstCandidateIndex], vote.scores[secondCandidateIndex]];
    if (firstScore > secondScore) {
      prefersFirst++
    } else if (firstScore < secondScore) {
      prefersSecond++
    }
  }
  const noPreference = election.votes.length - (prefersFirst + prefersSecond)

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
