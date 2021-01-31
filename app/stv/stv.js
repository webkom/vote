"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloneDeep = require("lodash/cloneDeep");
var Action;
(function (Action) {
    Action["iteration"] = "ITERATION";
    Action["win"] = "WIN";
    Action["eliminate"] = "ELIMINATE";
    Action["multi_tie_eliminations"] = "MULTI_TIE_ELIMINATIONS";
    Action["tie"] = "TIE";
})(Action || (Action = {}));
var Status;
(function (Status) {
    Status["resolved"] = "RESOLVED";
    Status["unresolved"] = "UNRESOLVED";
})(Status || (Status = {}));
const winningThreshold = (votes, seats, useStrict) => {
    if (useStrict) {
        return Math.floor((2 * votes.length) / 3) + 1;
    }
    return Math.floor(votes.length / (seats + 1) + 1);
};
const EPSILON = 0.000001;
exports.calculateWinnerUsingSTV = (inputVotes, inputAlternatives, seats = 1, useStrict = false) => {
    const log = [];
    let votes = inputVotes.map((vote) => ({
        _id: String(vote._id),
        priorities: vote.priorities.map((vote) => ({
            _id: String(vote._id),
            description: vote.description,
            election: String(vote._id),
        })),
        hash: vote.hash,
        weight: 1,
    }));
    let alternatives = inputAlternatives.map((alternative) => ({
        _id: String(alternative._id),
        description: alternative.description,
        election: String(alternative._id),
    }));
    const thr = winningThreshold(votes, seats, useStrict);
    const winners = [];
    let iteration = 0;
    while (votes.length > 0 && iteration < 100) {
        iteration += 1;
        votes = votes.filter((vote) => vote.priorities.length > 0);
        const counts = alternatives.reduce((counts, alternative) => (Object.assign(Object.assign({}, counts), { [alternative.description]: 0 })), {});
        for (const i in votes) {
            const vote = cloneDeep(votes[i]);
            const currentAlternative = cloneDeep(vote.priorities[0]);
            counts[currentAlternative.description] =
                vote.weight + (counts[currentAlternative.description] || 0);
        }
        const iterationLog = {
            action: Action.iteration,
            iteration,
            winners: winners.slice(),
            counts: handleFloatsInOutput(counts),
        };
        log.push(iterationLog);
        const roundWinners = {};
        const excessFractions = {};
        const doneVotes = {};
        for (const i in alternatives) {
            const alternative = cloneDeep(alternatives[i]);
            const voteCount = counts[alternative.description] || 0;
            if (voteCount >= thr - EPSILON) {
                excessFractions[alternative._id] = (voteCount - thr) / voteCount;
                roundWinners[alternative._id] = {};
                winners.push(alternative);
                const winLog = {
                    action: Action.win,
                    alternative,
                    voteCount: Number(voteCount.toFixed(4)),
                };
                log.push(winLog);
                for (const i in votes) {
                    const vote = cloneDeep(votes[i]);
                    if (vote.priorities[0]._id === alternative._id)
                        doneVotes[i] = {};
                }
            }
        }
        let doneAlternatives = {};
        let nextRoundVotes = [];
        if (Object.keys(roundWinners).length > 0) {
            if (winners.length === seats) {
                return {
                    result: { status: Status.resolved, winners },
                    log,
                    thr,
                    seats,
                    voteCount: inputVotes.length,
                    useStrict,
                };
            }
            doneAlternatives = roundWinners;
            nextRoundVotes = votes.filter((_, i) => !doneVotes[i]);
            for (const i in doneVotes) {
                const vote = cloneDeep(votes[i]);
                const alternative = cloneDeep(vote.priorities[0]);
                const fraction = excessFractions[alternative._id] || 0;
                if (fraction === 0 || vote.priorities.length === 1)
                    continue;
                vote['weight'] = vote.weight * fraction;
                nextRoundVotes.push(vote);
            }
        }
        else {
            const minScore = Math.min(...alternatives.map((alternative) => counts[alternative.description] || 0));
            const minAlternatives = alternatives.filter((alternative) => (counts[alternative.description] || 0) <= minScore + EPSILON);
            if (minAlternatives.length > 1) {
                let reverseIteration = iteration;
                const tieObject = {
                    action: Action.tie,
                    description: `There are ${minAlternatives.length} candidates with a score of ${Number(minScore.toFixed(4))} at iteration ${reverseIteration}`,
                };
                log.push(tieObject);
                while (reverseIteration >= 1) {
                    const logObject = log.find((entry) => entry.iteration === reverseIteration);
                    const iterationMinScore = Math.min(...minAlternatives.map((a) => logObject.counts[a.description] || 0));
                    const iterationMinAlternatives = minAlternatives.filter((alternative) => (logObject.counts[alternative.description] || 0) <=
                        iterationMinScore + EPSILON);
                    if (reverseIteration === 1 && iterationMinAlternatives.length > 1) {
                        const backTrackFailed = {
                            action: Action.tie,
                            description: 'The backward checking went to iteration 1 without breaking the tie',
                        };
                        log.push(backTrackFailed);
                        const multiTieElem = {
                            action: Action.multi_tie_eliminations,
                            alternatives: iterationMinAlternatives,
                            minScore: Number(minScore.toFixed(4)),
                        };
                        log.push(multiTieElem);
                        iterationMinAlternatives.forEach((alternative) => (doneAlternatives[alternative._id] = {}));
                        break;
                    }
                    reverseIteration--;
                    if (iterationMinAlternatives.length > 1)
                        continue;
                    const minAlternative = iterationMinAlternatives[0];
                    if (minAlternative) {
                        const elem = {
                            action: Action.eliminate,
                            alternative: minAlternative,
                            minScore: Number(iterationMinScore.toFixed(4)),
                        };
                        log.push(elem);
                        doneAlternatives[minAlternative._id] = {};
                    }
                    break;
                }
            }
            else {
                const minAlternative = minAlternatives[0];
                if (minAlternative) {
                    const elemLowest = {
                        action: Action.eliminate,
                        alternative: minAlternative,
                        minScore: Number(minScore.toFixed(4)),
                    };
                    log.push(elemLowest);
                    doneAlternatives[minAlternative._id] = {};
                }
            }
            nextRoundVotes = votes;
        }
        votes = nextRoundVotes.map((vote) => {
            vote['priorities'] = vote.priorities.filter((alternative) => !doneAlternatives[alternative._id]);
            return vote;
        });
        alternatives = alternatives.filter((alternative) => !doneAlternatives[alternative._id]);
    }
    return {
        result: { status: Status.unresolved, winners },
        log,
        thr,
        seats,
        voteCount: inputVotes.length,
        useStrict,
    };
};
const handleFloatsInOutput = (obj) => {
    const newObj = {};
    Object.entries(obj).forEach(([k, v]) => (newObj[k] = Number(v.toFixed(4))));
    return newObj;
};
//# sourceMappingURL=stv.js.map