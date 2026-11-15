// docu-2d-long look tokens. Measured from the reference channel (see docu-2d-long/references/STYLE_BIBLE.md).
// All sizes are in px at 1920x1080 (the composition size); Remotion --scale handles 1440p/4K.
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";

const inter = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
loadSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

export const FONT = {
  sans: inter.fontFamily, // labels, captions, UI
  serif: serif.fontFamily, // big numbers, years, titles, quotes
  poster: anton.fontFamily, // thumbnails only
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  // night-navy room: 70-85 % of every frame is one of these four
  bgDeep: "#050e2c",
  bg: "#0a1942",
  bgMid: "#13265a",
  bgLift: "#263050",
  wall: "#0e1d4a",
  floor: "#16285c",
  floorEdge: "#3a4a78",
  // the one warm accent (cream -> gold), 3-10 % of the frame, always the thing we want looked at
  cream: "#ece0b7",
  paper: "#f3e9c6",
  gold: "#d9b878",
  goldDeep: "#b19d79",
  brass: "#7a6e60",
  // lines and text
  ink: "#1a1c2c", // text on paper cards
  line: "rgba(236,224,183,0.85)", // cream hairlines (floor lines, frames)
  white: "#f4f1e8",
  muted: "#9aa3bd", // source lines, small caps sub-labels
  // second accent: technology / AI / "new" force. Cool cyan glow, used sparingly
  tech: "#7fd0ff",
  techDeep: "#2f8fd8",
  // our protagonist ("Du-Figur"): warm orange coat. NOT the reference's yellow raincoat.
  hero: "#f08a3c",
  heroLight: "#ffb36e",
  heroShade: "#b8561f",
  // background people
  crowd: "#1f3470",
  crowdLight: "#3a56a0",
  skin: "#0b1430",
  hairWhite: "#e9e6dc",
};

// Typographic scale at 1080p
export const T = {
  caption: { size: 42, weight: 500 },
  label: { size: 22, weight: 700, tracking: "0.06em" },
  subLabel: { size: 15, weight: 600, tracking: "0.08em" },
  chapter: { size: 15, weight: 700, tracking: "0.05em" },
  bigNumber: { size: 110 },
  number: { size: 64 },
};
