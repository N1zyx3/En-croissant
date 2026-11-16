import type { MantineColor } from "@mantine/core";

const pieceChars = { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘" };

export function addPieceSymbol(move: string): string {
    const pieceChar = pieceChars[move[0] as keyof typeof pieceChars];

    if (typeof pieceChar === "undefined") return move;
    return pieceChar + move.slice(1);
}

export type Annotation =
    | ""
    | "!"
    | "!!"
    | "‼"
    | "?"
    | "??"
    | "!?"
    | "?!"
    | "+-"
    | "±"
    | "⩲"
    | "="
    | "∞"
    | "⩱"
    | "∓"
    | "-+"
    | "N"
    | "↑↑"
    | "↑"
    | "→"
    | "⇆"
    | "=∞"
    | "⊕"
    | "∆"
    | "□"
    | "⨀"
    | "⊗";

export const NAG_INFO = new Map<string, Annotation>([
    ["$1", "!"],
    ["$2", "?"],
    ["$3", "!!"],
    ["$4", "??"],
    ["$5", "!?"],
    ["$6", "?!"],
    ["$7", "□"],
    ["$8", "‼"],
    ["$9", "⊗"],
    ["$10", "="],
    ["$13", "∞"],
    ["$14", "⩲"],
    ["$15", "⩱"],
    ["$16", "±"],
    ["$17", "∓"],
    ["$18", "+-"],
    ["$19", "-+"],
    ["$22", "⨀"],
    ["$23", "⨀"],
    ["$32", "↑↑"],
    ["$33", "↑↑"],
    ["$36", "↑"],
    ["$37", "↑"],
    ["$40", "→"],
    ["$41", "→"],
    ["$44", "=∞"],
    ["$45", "=∞"],
    ["$132", "⇆"],
    ["$133", "⇆"],
    ["$138", "⊕"],
    ["$139", "⊕"],
    ["$140", "∆"],
    ["$146", "N"],
]);

type AnnotationInfo = {
    group?: string;
    name: string;
    translationKey?: string;
    color?: MantineColor;
    nag: number;
};

export const ANNOTATION_INFO: Record<Annotation, AnnotationInfo> = {
    "": { name: "None", color: "gray", nag: 0 },
    "!!": {
        group: "basic",
        name: "Brilliant",
        translationKey: "Brilliant",
        color: "teal",
        nag: 3,
    },
    "‼": {
        group: "basic",
        name: "Great",
        translationKey: "Great",
        color: "great",
        nag: 8,
    },
    "!?": {
        group: "basic",
        name: "Interesting",
        translationKey: "Interesting",
        color: "interesting",
        nag: 5,
    },
    "!": {
        group: "basic",
        name: "Good",
        translationKey: "Good",
        color: "lime",
        nag: 1,
    },
    "?!": {
        group: "basic",
        name: "Dubious",
        translationKey: "Dubious",
        color: "yellow",
        nag: 6,
    },
    "?": {
        group: "basic",
        name: "Mistake",
        translationKey: "Mistake",
        color: "orange",
        nag: 2,
    },
    "??": {
        group: "basic",
        name: "Blunder",
        translationKey: "Blunder",
        color: "red",
        nag: 4,
    },
    "+-": {
        group: "advantage",
        name: "White is winning",
        translationKey: "WhiteWinning",
        nag: 18,
    },
    "±": {
        group: "advantage",
        name: "White has a clear advantage",
        translationKey: "WhiteAdvantage",
        nag: 16,
    },
    "⩲": {
        group: "advantage",
        name: "White has a slight advantage",
        translationKey: "WhiteEdge",
        nag: 14,
    },
    "=": {
        group: "advantage",
        name: "Equal position",
        translationKey: "Equal",
        nag: 10,
    },
    "∞": {
        group: "advantage",
        name: "Unclear position",
        translationKey: "Unclear",
        nag: 13,
    },
    "⩱": {
        group: "advantage",
        name: "Black has a slight advantage",
        translationKey: "BlackEdge",
        nag: 15,
    },
    "∓": {
        group: "advantage",
        name: "Black has a clear advantage",
        translationKey: "BlackAdvantage",
        nag: 17,
    },
    "-+": {
        group: "advantage",
        name: "Black is winning",
        translationKey: "BlackWinning",
        nag: 19,
    },
    N: { name: "Novelty", translationKey: "Novelty", nag: 146 },
    "↑↑": { name: "Development", translationKey: "Development", nag: 32 },
    "↑": { name: "Initiative", translationKey: "Initiative", nag: 36 },
    "→": { name: "Attack", translationKey: "Attack", nag: 40 },
    "⇆": { name: "Counterplay", translationKey: "Counterplay", nag: 132 },
    "=∞": {
        name: "With compensation",
        translationKey: "WithCompensation",
        nag: 44,
    },
    "⊕": { name: "Time Trouble", translationKey: "TimeTrouble", nag: 138 },
    "∆": { name: "With the idea", translationKey: "WithIdea", nag: 140 },
    "□": { name: "Only move", translationKey: "OnlyMove", nag: 7 },
    "⨀": { name: "Zugzwang", translationKey: "Zugzwang", nag: 22 },
    "⊗": { name: "Miss", color: "red", nag: 9 },
};

export function isBasicAnnotation(
    annotation: string,
): annotation is "!" | "!!" | "‼" | "?" | "??" | "!?" | "?!" {
    return ["!", "!!", "‼", "?", "??", "!?", "?!"].includes(annotation);
}

/**
 * Move-quality annotations ordered from highest to lowest priority.
 *
 * A move has at most one of these. When several would apply (for example after
 * re-running the engine at a different depth), the highest-ranked one wins.
 */
export const BASIC_ANNOTATION_ORDER = [
    "!!",
    "‼",
    "!?",
    "!",
    "?!",
    "?",
    "??",
] as const satisfies readonly Annotation[];

export function getAnnotationRank(annotation: Annotation): number {
    const rank = (BASIC_ANNOTATION_ORDER as readonly Annotation[]).indexOf(annotation);
    return rank === -1 ? Number.POSITIVE_INFINITY : rank;
}

/** Sort annotations so the highest-ranked move quality comes first. */
export function compareAnnotations(a: Annotation, b: Annotation): number {
    const byRank = getAnnotationRank(a) - getAnnotationRank(b);
    return byRank !== 0 ? byRank : ANNOTATION_INFO[a].nag - ANNOTATION_INFO[b].nag;
}

/** Deduplicate and order annotations, highest move quality first. */
export function sortAnnotations(annotations: readonly Annotation[]): Annotation[] {
    return [...new Set(annotations)].sort(compareAnnotations);
}

/**
 * Add a move-quality annotation while keeping only the highest-ranked quality
 * for the move. Annotations from other groups (novelty, advantage, ...) are
 * preserved.
 */
export function withBasicAnnotation(
    annotations: readonly Annotation[],
    annotation: Annotation,
): Annotation[] {
    if (!isBasicAnnotation(annotation)) {
        return sortAnnotations([...annotations, annotation]);
    }

    const others = annotations.filter((a) => !isBasicAnnotation(a));
    const winner = [annotation, ...annotations.filter(isBasicAnnotation)].reduce((best, current) =>
        getAnnotationRank(current) < getAnnotationRank(best) ? current : best,
    );
    return sortAnnotations([...others, winner]);
}
