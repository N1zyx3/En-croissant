import { minMax } from "@tiptap/react";
import type { Color } from "chessops";
import { match } from "ts-pattern";
import type { BestMoves, Score, ScoreValue } from "@/bindings";
import type { Annotation } from "./annotation";

export const INITIAL_SCORE: Score = {
    value: {
        type: "cp",
        value: 15,
    },
    wdl: null,
};

const CP_CEILING = 1000;

export function formatScore(score: ScoreValue, precision = 2): string {
    let scoreText = match(score.type)
        .with("cp", () => Math.abs(score.value / 100).toFixed(precision))
        .with("mate", () => `M${Math.abs(score.value)}`)
        .with("dtz", () => `DTZ${Math.abs(score.value)}`)
        .exhaustive();
    if (score.type !== "dtz") {
        if (score.value > 0) {
            scoreText = `+${scoreText}`;
        }
        if (score.value < 0) {
            scoreText = `-${scoreText}`;
        }
    }
    return scoreText;
}

export function getWinChance(centipawns: number) {
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
}

export function normalizeScore(score: ScoreValue, color: Color): number {
    let cp = score.value;
    if (color === "black") {
        cp *= -1;
    }
    if (score.type === "mate") {
        cp = CP_CEILING * Math.sign(cp);
    }
    return minMax(cp, -CP_CEILING, CP_CEILING);
}

function normalizeScores(
    prev: ScoreValue,
    next: ScoreValue,
    color: Color,
): { prevCP: number; nextCP: number } {
    return {
        prevCP: normalizeScore(prev, color),
        nextCP: normalizeScore(next, color),
    };
}

export function getAccuracy(prev: ScoreValue, next: ScoreValue, color: Color): number {
    const { prevCP, nextCP } = normalizeScores(prev, next, color);
    return minMax(
        103.1668 * Math.exp(-0.04354 * (getWinChance(prevCP) - getWinChance(nextCP))) - 3.1669 + 1,
        0,
        100,
    );
}

export function getCPLoss(prev: ScoreValue, next: ScoreValue, color: Color): number {
    const { prevCP, nextCP } = normalizeScores(prev, next, color);

    return Math.max(0, prevCP - nextCP);
}

// Accuracy alone cannot identify a rating exactly: quiet games over-rate and
// sharp games under-rate the same number. This curve is a deliberately
// conservative single-game estimate calibrated against reported game-review
// ratings, interpolating between accuracy percentages.
const RATING_BY_ACCURACY: ReadonlyArray<readonly [accuracy: number, rating: number]> = [
    [40, 300],
    [50, 450],
    [60, 650],
    [65, 800],
    [70, 950],
    [75, 1100],
    [80, 1300],
    [85, 1600],
    [90, 1950],
    [93, 2200],
    [96, 2500],
    [99, 2800],
];

export function getEstimatedRating(accuracy: number | null | undefined): number | null {
    if (accuracy == null || !Number.isFinite(accuracy)) {
        return null;
    }

    const clamped = minMax(accuracy, 0, 100);
    const first = RATING_BY_ACCURACY[0];
    const last = RATING_BY_ACCURACY[RATING_BY_ACCURACY.length - 1];
    if (clamped <= first[0]) {
        return first[1];
    }
    if (clamped >= last[0]) {
        return last[1];
    }

    for (let i = 1; i < RATING_BY_ACCURACY.length; i++) {
        const [nextAccuracy, nextRating] = RATING_BY_ACCURACY[i];
        if (clamped <= nextAccuracy) {
            const [prevAccuracy, prevRating] = RATING_BY_ACCURACY[i - 1];
            const progress = (clamped - prevAccuracy) / (nextAccuracy - prevAccuracy);
            return Math.round(prevRating + progress * (nextRating - prevRating));
        }
    }

    return last[1];
}

export function getAnnotation(
    prev: ScoreValue | null,
    next: ScoreValue,
    color: Color,
    prevMoves: BestMoves[],
    is_sacrifice?: boolean,
    move?: string,
): Annotation {
    const { prevCP, nextCP } = normalizeScores(prev || { type: "cp", value: 0 }, next, color);
    const winChanceDiff = getWinChance(prevCP) - getWinChance(nextCP);

    if (winChanceDiff > 20) {
        return "??";
    }
    if (winChanceDiff > 10) {
        return "?";
    }
    if (winChanceDiff > 5) {
        return "?!";
    }

    if (prevMoves.length > 1) {
        // Great moves are the best move in a position where every other move
        // is clearly worse, i.e. the only move that keeps the game on track.
        const scores = normalizeScores(prevMoves[0].score.value, prevMoves[1].score.value, color);
        const isOnlyGoodMove =
            getWinChance(scores.prevCP) - getWinChance(scores.nextCP) > 10 &&
            move === prevMoves[0].sanMoves[0];
        if (isOnlyGoodMove) {
            return is_sacrifice ? "!!" : "‼";
        }
        if (is_sacrifice && nextCP > -200) {
            return "!?";
        }
    }
    return "";
}
