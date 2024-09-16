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
        } else if (<number>scores.get(candidate) >= <number>scores.get(firstCandidate)) {
            secondCandidate = <string>firstCandidate;
            firstCandidate = candidate;
        } else if (<number>scores.get(candidate) >= <number>scores.get(secondCandidate)) {
            secondCandidate = candidate;
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
}


// let votes: Map<string, number>[] = [];
// votes.push(new Map<string, number>({"O'"}))
//
// let vote = new Map<string, number>([
//     ["Murphy", 1],
//     ["O'Brien", 0],
//     ["O'Doherty", 3],
//     ["Kelly", 2],
//     ["Walsh", 2],
// ]);

// for (const candidate of vote.keys()) {
//     console.log(`${candidate}: ${vote.get(candidate)}`);
// }

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
            ([key, value]) => key != "Voter ID"
        ))
    );
    console.log("Votes", votes);
    getSTARWinner(votes);
});

