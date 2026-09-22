// src/utils/stepHelpers.js

/* Group responses by stepNumber + instanceNumber */
export function groupResponses(responses) {
    const grouped = {};
    for (const r of responses || []) {
        const key = `${r.stepNumber}|${r.instanceNumber || 1}`;
        if (!grouped[key]) {
            grouped[key] = {
                stepNumber: r.stepNumber,
                stepName: r.stepName,
                instanceNumber: r.instanceNumber || 1,
                instanceName: r.instanceName || '',
                responses: [],
            };
        }
        grouped[key].responses.push(r);
    }
    return Object.values(grouped).sort(
        (a, b) => (a.stepNumber - b.stepNumber) || (a.instanceNumber - b.instanceNumber)
    );
}

/* Group by stepNumber, combining instances */
export function groupByStep(responses) {
    const groups = groupResponses(responses);
    const byStep = {};
    for (const g of groups) {
        const key = String(g.stepNumber);
        if (!byStep[key]) {
            byStep[key] = {
                stepNumber: g.stepNumber,
                stepName: g.stepName,
                instances: [],
            };
        }
        byStep[key].instances.push(g);
    }
    return Object.values(byStep).sort((a, b) => a.stepNumber - b.stepNumber);
}

/* Display 12.1 → "12a" */
export function formatStepNumber(n) {
    if (Number.isInteger(n)) return String(n);
    const [base, sub] = String(n).split('.');
    const letter = String.fromCharCode(96 + Number(sub));
    return `${base}${letter}`;
}

/* Compute progress for a step's instances */
export function stepProgress(instances) {
    let total = 0;
    let answered = 0;
    for (const inst of instances) {
        for (const r of inst.responses) {
            total++;
            if (r.answer) answered++;
        }
    }
    return {
        total,
        answered,
        pct: total ? Math.round((answered / total) * 100) : 0,
    };
}