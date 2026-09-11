/**
 * The site's vocabulary: five things William does.
 *
 * This is the taxonomy, and it deliberately is not five homepage sections.
 * It is a set of labels — used on section eyebrows, blog tags, project cards
 * and the /now page — so that cloud work reads as one part of the picture
 * rather than as the whole identity. The old structure (Over / Tools /
 * Fotografie / Blog) sorted content by what kind of object it was; this sorts
 * it by what he was doing, which is the thing the content actually has in
 * common.
 *
 * `id` is the mono form that appears in tags and metadata. `mark` is the
 * colour of the topic's node dot and rule — note that these are *marks*, and
 * three of them (acid, amber, tomato) are too light to set type in, which is
 * exactly why nothing here ever renders the label in its own colour. The label
 * is always ink; only the dot beside it is coloured. That keeps the palette
 * incidental rather than turning into a per-section colour scheme.
 *
 * Class names are complete literals because Tailwind's scanner cannot see a
 * name that was assembled at runtime — which is also why `mark` and `rule`
 * are separate strings rather than one colour name with prefixes bolted on.
 */
export interface Topic {
  /** Mono form, used in tags and metadata. */
  id: string;
  /** Display label. Uppercased by the components that show it. */
  label: string;
  /** `bg-*` for the node dot. */
  mark: string;
  /** `bg-*` for the hairline rule beside the label. */
  rule: string;
  /** `border-*` for a card's marked edge. */
  edge: string;
  /** One line, for the /now page and the topic strip. */
  blurb: string;
}

export const topics = {
  build: {
    id: "bouwen",
    label: "Bouwen",
    mark: "bg-cobalt",
    rule: "bg-cobalt/40",
    edge: "border-t-cobalt",
    blurb: "Software, cloud-experimenten en kleine tools die ik zelf gebruik.",
  },
  tinker: {
    id: "knutselen",
    label: "Knutselen",
    mark: "bg-amber",
    rule: "bg-amber/50",
    edge: "border-t-amber",
    blurb:
      "Raspberry Pi's, Home Assistant, 3D-printen, elektronica en meten aan energie.",
  },
  write: {
    id: "schrijven",
    label: "Schrijven",
    mark: "bg-violet",
    rule: "bg-violet/40",
    edge: "border-t-violet",
    blurb: "Langere technische stukken over wat ik onderweg tegenkwam.",
  },
  shoot: {
    id: "fotograferen",
    label: "Fotograferen",
    mark: "bg-tomato",
    rule: "bg-tomato/40",
    edge: "border-t-tomato",
    blurb: "Stadsreizen, festivals en af en toe een berg.",
  },
  talk: {
    id: "vertellen",
    label: "Vertellen",
    mark: "bg-acid",
    rule: "bg-acid/60",
    edge: "border-t-acid",
    blurb: "Praatjes en sessies over praktische techniek.",
  },
} as const satisfies Record<string, Topic>;

export type TopicKey = keyof typeof topics;

/** The order they are introduced in, and the order the homepage follows. */
export const topicOrder = [
  "build",
  "tinker",
  "write",
  "shoot",
  "talk",
] as const satisfies readonly TopicKey[];

/**
 * Look up a topic by key, falling back rather than throwing.
 *
 * Content files name topics as strings, and a typo in frontmatter should
 * degrade to a neutral label rather than take the build down — the schema
 * already constrains the legal values, so anything reaching here is a bug in
 * a component, not in someone's markdown.
 */
export function topicFor(key: string | undefined): Topic | undefined {
  if (!key) return undefined;
  return (topics as Record<string, Topic>)[key];
}

export default topics;
