import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';


function getSTARWinner(votes: Map<string, number>[]) {

    // Find the top two candidates
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

    console.log("Candidate scores:")
    for (const candidate of scores.keys()) {
        console.log(`${candidate}: ${scores.get(candidate)}`);
    }
    console.log("\n")

    let firstCandidate, secondCandidate;
    for (const candidate of scores.keys()) {
        if (firstCandidate === undefined) {
            firstCandidate = candidate;
        } else if (secondCandidate === undefined) {
            secondCandidate = candidate;
        } else {
            let score = <number>scores.get(candidate);
            let firstCandidateScore = <number>scores.get(firstCandidate);
            if (score >= firstCandidateScore) {
                secondCandidate = firstCandidate;
                firstCandidate = candidate;
            } else {
                let secondCandidateScore = <number>scores.get(secondCandidate);
                if (score >= secondCandidateScore) {
                    secondCandidate = candidate;
                }
            }
        }
    }

    // FIXME: figure out what to do in the case of score ties
    for (const candidate of scores.keys()) {
        if (candidate !== secondCandidate && scores.get(candidate) === scores.get(<string>secondCandidate)) {
            throw new Error(
                `At least one candidate (${candidate}; score=${scores.get(candidate)}) is tied with second-place \
                candidate (${secondCandidate}; score=${scores.get(<string>secondCandidate)})`);
        }
    }

    console.log("Top two candidates by score selected:")
    for (const candidate of [firstCandidate, secondCandidate]) {
        console.log(`  - ${candidate}; score=${scores.get(<string>candidate)}`)
    }

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

const csvFilePath = path.resolve(__dirname, 'votes.csv');
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

parse(fileContent, {
    delimiter: ',',
    cast: true,
    columns: true,
}, (error, result: object[]) => {
    if (error) {
        console.error(error);
    }

    const votes = result.map(
        (voteObject) => new Map(Object.entries(voteObject).filter(
            ([key, _]) => key != "Voter ID"
        ))
    );
    getSTARWinner(votes);
});

