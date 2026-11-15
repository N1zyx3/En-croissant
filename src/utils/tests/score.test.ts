import { expect, test } from "vitest";
import type { BestMoves } from "@/bindings";
import {
    formatScore,
    getAccuracy,
    getAnnotation,
    getCPLoss,
    getEstimatedRating,
    getWinChance,
} from "../score";

function engineLines(lines: Array<[cp: number, san: string]>): BestMoves[] {
    return lines.map(([cp, san], index) => ({
        nodes: 0,
        depth: 20,
        score: { value: { type: "cp", value: cp }, wdl: null },
        uciMoves: [],
        sanMoves: [san],
        multipv: index + 1,
        nps: 0,
    }));
}

test("should format a positive cp score correctly", () => {
    expect(formatScore({ type: "cp", value: 50 })).toBe("+0.50");
});

test("should format a negative cp score correctly", () => {
    expect(formatScore({ type: "cp", value: -50 })).toBe("-0.50");
});

test("should format a mate score correctly", () => {
    expect(formatScore({ type: "mate", value: 5 })).toBe("+M5");
    expect(formatScore({ type: "mate", value: -5 })).toBe("-M5");
});

test("should calculate the win chance correctly", () => {
    expect(getWinChance(0)).toBe(50);
    expect(getWinChance(100)).toBeCloseTo(59.1);
    expect(getWinChance(-500)).toBeCloseTo(13.69);
});

test("should calculate the accuracy correctly", () => {
    expect(getAccuracy({ type: "cp", value: 0 }, { type: "cp", value: 0 }, "white")).toBe(100);
    expect(getAccuracy({ type: "cp", value: 0 }, { type: "cp", value: -500 }, "white")).toBeCloseTo(
        19.07,
    );
});

test("should calculate the cp loss correctly", () => {
    expect(getCPLoss({ type: "cp", value: 0 }, { type: "cp", value: 50 }, "black")).toBe(50);
    expect(getCPLoss({ type: "mate", value: -1 }, { type: "cp", value: 0 }, "black")).toBe(1000);
});

test("should estimate a rating from game accuracy", () => {
    expect(getEstimatedRating(null)).toBeNull();
    expect(getEstimatedRating(Number.NaN)).toBeNull();
    expect(getEstimatedRating(0)).toBe(300);
    expect(getEstimatedRating(40)).toBe(300);
    expect(getEstimatedRating(87.5)).toBe(1775);
    expect(getEstimatedRating(90)).toBe(1950);
    expect(getEstimatedRating(100)).toBe(2800);
});

test("should annotate as ??", () => {
    expect(getAnnotation(null, { type: "cp", value: -500 }, "white", [])).toBe("??");
    expect(getAnnotation(null, { type: "cp", value: 500 }, "black", [])).toBe("??");
});

test("should annotate as ?", () => {
    expect(getAnnotation(null, { type: "cp", value: -200 }, "white", [])).toBe("?");
    expect(getAnnotation(null, { type: "cp", value: 200 }, "black", [])).toBe("?");
});

test("should annotate as ?!", () => {
    expect(getAnnotation(null, { type: "cp", value: -100 }, "white", [])).toBe("?!");
    expect(getAnnotation(null, { type: "cp", value: 100 }, "black", [])).toBe("?!");
});

test("should not annotate", () => {
    expect(getAnnotation(null, { type: "cp", value: -50 }, "white", [])).toBe("");
    expect(getAnnotation(null, { type: "cp", value: 50 }, "black", [])).toBe("");
});

test("should annotate the only good move as great", () => {
    const prevMoves = engineLines([
        [200, "e4"],
        [-200, "d4"],
    ]);
    expect(
        getAnnotation(
            { type: "cp", value: 0 },
            { type: "cp", value: 50 },
            "white",
            prevMoves,
            false,
            "e4",
        ),
    ).toBe("‼");
});

test("should annotate a sacrificing only good move as brilliant", () => {
    const prevMoves = engineLines([
        [200, "e4"],
        [-200, "d4"],
    ]);
    expect(
        getAnnotation(
            { type: "cp", value: 0 },
            { type: "cp", value: 50 },
            "white",
            prevMoves,
            true,
            "e4",
        ),
    ).toBe("!!");
});

test("should not annotate as great when another move is almost as good", () => {
    const prevMoves = engineLines([
        [200, "e4"],
        [100, "d4"],
    ]);
    expect(
        getAnnotation(
            { type: "cp", value: 0 },
            { type: "cp", value: 50 },
            "white",
            prevMoves,
            false,
            "e4",
        ),
    ).toBe("");
});

test("should not annotate as great when the played move is not the best", () => {
    const prevMoves = engineLines([
        [200, "e4"],
        [-200, "d4"],
    ]);
    expect(
        getAnnotation(
            { type: "cp", value: 0 },
            { type: "cp", value: 50 },
            "white",
            prevMoves,
            false,
            "Nf3",
        ),
    ).toBe("");
});
