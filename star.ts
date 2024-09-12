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

    for (const candidate of scores.keys()) {
        console.log(`${candidate}: ${scores.get(candidate)}`);
    }

    // TODO: get preferences for the top 2 candidates
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
    // columns: ["Voter ID", "Murphy", "Kelly", "Walsh", "O'Brien", "O'Doherty"],
    columns: true,
}, (error, result) => {
    if (error) {
        console.error(error);
    }

    console.log("Result", result);
});

