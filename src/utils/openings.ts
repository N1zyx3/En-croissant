import openingBook from "./openings.json";

/**
 * Opening book used by the game report.
 *
 * The source is `plans/openings.json`: a map from the position after a move to
 * the name of the opening or variation it belongs to. Only the first four FEN
 * fields are significant for a lookup, because the move counters depend on how
 * the game was imported and must not hide a known position.
 */
export function normalizeOpeningFen(fen: string): string {
    return fen.trim().split(/\s+/).slice(0, 4).join(" ");
}

export function createOpeningIndex(entries: Record<string, string>): Map<string, string> {
    const index = new Map<string, string>();
    for (const [fen, name] of Object.entries(entries)) {
        const position = normalizeOpeningFen(fen);
        if (!index.has(position)) {
            index.set(position, name);
        }
    }
    return index;
}

const OPENING_INDEX = createOpeningIndex(openingBook as Record<string, string>);

/** Name of the opening or variation reached by the move that produced `fen`. */
export function getOpeningName(fen: string): string | undefined {
    return OPENING_INDEX.get(normalizeOpeningFen(fen));
}
