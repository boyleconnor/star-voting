export enum TopScoresResult {
    NoTie = "No Tie",
    TieForFirst = "Tie for First",
    TieForSecond = "Tie for Second"
}

export function getScores(votes: Map<string, number>[]) {
    let scores = new Map<string, number>();
    for (const vote of votes) {
        for (const candidate of vote.keys()) {
            const score = vote.get(candidate);
            if (!scores.has(candidate)) {
                scores.set(candidate, <number>score);
            } else {
                scores.set(candidate,
                  <number>scores.get(candidate) + <number>score);
            }
        }
    }
    return scores;
}

export function getTopScorers(scores: Map<string, number>): [TopScoresResult, string[]] {
    if (scores.size < 2) {
        throw new Error(`Invalid number of candidates: ${scores.size}`);
    } else {
        const sortedScores = Array.from(scores.entries()).sort(([_firstCandidate, firstScore], [_secondCandidate, secondScore]) => firstScore - secondScore).reverse();
        const [_, highestScore] = sortedScores[0];

        if (sortedScores[0][1] == sortedScores[1][1]) {
            // Tie for first
            return [TopScoresResult.TieForFirst, sortedScores.filter(([_, score]) => score == highestScore).map(([candidate, _]) => candidate)]
        } else if (sortedScores.length >= 3 && sortedScores[1][1] == sortedScores[2][1]) {
            // Tie for second
            const secondHighestScore = sortedScores[1][1];
            let i
            for (i = 2; i < sortedScores.length; i++) {
                if (sortedScores[i][1] < secondHighestScore) {
                    break;
                }
            }
            return [TopScoresResult.TieForSecond, sortedScores.slice(0, i).map(([candidate, _]) => candidate)];
        } else {
            // No tie
            return [TopScoresResult.NoTie, sortedScores.slice(0, 2).map(([candidate, _]) => candidate)];
        }
    }
}

export function getSTARWinner(votes: Map<string, number>[]) {

    let scores = getScores(votes);

    console.log("Candidate scores:")
    for (const candidate of scores.keys()) {
        console.log(`${candidate}: ${scores.get(candidate)}`);
    }
    console.log("\n")

    // Find the top two candidates
    let [topScoreResult, topCandidates] = getTopScorers(scores);

    // FIXME: figure out what to do in the case of score ties
    if (topScoreResult !== TopScoresResult.NoTie) {
        throw new Error(
            `Logic not yet implemented for result: ${topScoreResult.toString()}`
        );
    }

    console.log("Top two candidates by score selected:")
    for (const candidate of topCandidates) {
        console.log(`  - ${candidate}; score=${scores.get(candidate)}`)
    }

    // FIXME: Make this work with more than two candidates
    const [firstCandidate, secondCandidate] = topCandidates;
    let [prefersFirst, prefersSecond] = [0, 0];
    for (const vote of votes) {
        const firstScore = <number>vote.get(<string>firstCandidate)
        const secondScore = <number>vote.get(<string>secondCandidate)
        if (firstScore > secondScore) {
            prefersFirst++;
        } else if (firstScore < secondScore) {
            prefersSecond++;
        }
    }
    const noPreference = votes.length - (prefersFirst + prefersSecond);

    let winner: string | undefined;
    if (prefersFirst > prefersSecond) {
        winner = firstCandidate;
    } else if (prefersFirst < prefersSecond) {
        winner = secondCandidate;
    }

    console.log(`Preferences:`)
    for (const [candidate, prefersCount] of [[firstCandidate, prefersFirst], [secondCandidate, prefersSecond]]) {
        console.log(`  - ${candidate} preferred by ${prefersCount} voters`);
    }
    console.log(`${noPreference} voters expressed no preference between ${firstCandidate} and ${secondCandidate}`)

    if (winner !== undefined) {
        console.log(`Winner: ${winner}`);
    } else {
        console.log(`Election was a tie between ${firstCandidate} and ${secondCandidate}`);
    }
}
