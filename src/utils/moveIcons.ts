import type { Annotation } from "./annotation";

/**
 * Move-quality icons used by the analysis board.
 *
 * The image assets live in `public/moves` and are shared by the board
 * annotation hint, the annotation panel and the game report.
 */
export type MoveQuality =
    | "best"
    | "excellent"
    | "great"
    | "correct"
    | "book"
    | "brilliant"
    | "interesting"
    | "inaccuracy"
    | "mistake"
    | "blunder"
    | "miss"
    | "missed-win"
    | "equal";

export const MOVE_QUALITY_ICON: Record<MoveQuality, string> = {
    best: "/moves/move-best.png",
    excellent: "/moves/move-excellent.png",
    great: "/moves/move-great.png",
    correct: "/moves/move-correct.png",
    book: "/moves/move-book.png",
    brilliant: "/moves/move-brilliant.png",
    interesting: "/moves/move-interesting.png",
    inaccuracy: "/moves/move-inaccuracy.png",
    mistake: "/moves/move-mistake.png",
    blunder: "/moves/move-blunder.png",
    miss: "/moves/move-miss.png",
    "missed-win": "/moves/move-missed-win.png",
    equal: "/moves/move-equal.png",
};

/** Map the PGN/analysis annotations that have a matching quality icon. */
export const ANNOTATION_MOVE_QUALITY: Partial<Record<Annotation, MoveQuality>> = {
    "!!": "brilliant",
    "‼": "great",
    "!": "correct",
    "!?": "interesting",
    "?!": "inaccuracy",
    "?": "mistake",
    "??": "blunder",
    "=": "equal",
    "□": "best",
    "⊗": "miss",
};

export function getMoveQualityForAnnotation(annotation: Annotation): MoveQuality | undefined {
    return ANNOTATION_MOVE_QUALITY[annotation];
}
