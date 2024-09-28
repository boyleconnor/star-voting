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

        // Tie for first
        if (sortedScores.slice(1).map((_, score) => score).includes(highestScore)) {
            const endOfTiedScores = sortedScores.findIndex((_, score) => score < highestScore);
            return [TopScoresResult.TieForFirst, sortedScores.slice(0, endOfTiedScores).map(([candidate, _]) => candidate)];
        } else {
            // Tie for second
            const [_, secondHighestScore] = sortedScores[1];
            if (sortedScores.slice(2).map((_, score) => score).includes(secondHighestScore)) {
                const endOfTiedScores = sortedScores.findIndex((_, score) => score < highestScore);
                return [TopScoresResult.TieForSecond, sortedScores.slice(0, endOfTiedScores).map(([candidate, _]) => candidate)];
            }
            // No ties
            else {
                return [TopScoresResult.NoTie, sortedScores.slice(0, 2).map(([candidate, _]) => candidate)];
            }
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
