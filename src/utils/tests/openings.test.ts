import { expect, test } from "vitest";
import { createOpeningIndex, getOpeningName, normalizeOpeningFen } from "@/utils/openings";

test("opening FEN lookups ignore move counters", () => {
    expect(normalizeOpeningFen("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1")).toBe(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
    );
    expect(getOpeningName("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1")).toBe(
        "King's Pawn Game",
    );
    expect(getOpeningName("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 12 42")).toBe(
        "King's Pawn Game",
    );
});

test("opening index keeps the first entry for transposed positions", () => {
    const index = createOpeningIndex({
        "8/8/8/8/8/8/8/K7 w - - 0 1": "First",
        "8/8/8/8/8/8/8/K7 w - - 5 9": "Second",
    });
    expect(index.get("8/8/8/8/8/8/8/K7 w - -")).toBe("First");
});
