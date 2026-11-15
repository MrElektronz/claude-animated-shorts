// Simple line icons (cream, ~200x200 design box, centred at x,y). One per job in the ranking plus scene props.
import React from "react";
import { C, FONT } from "../../lib/docu/theme";

export type IconKind = "note" | "pen" | "mic" | "stunt" | "bell" | "cart" | "case" | "code" | "hanger" | "film" | "factory" | "desk" | "dish" | "pan" | "bubble" | "doc";

export const Icon: React.FC<{ kind: IconKind; x: number; y: number; s?: number; o?: number; color?: string }> = ({ kind, x, y, s = 1, o = 1, color = C.cream }) => {
  const st = { stroke: color, strokeWidth: 7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let g: React.ReactNode = null;
  switch (kind) {
    case "note":
      g = <><ellipse cx={-30} cy={50} rx={30} ry={22} fill={color} transform="rotate(-20 -30 50)" /><path d="M -2 45 L -2 -70 L 67 -55 L 67 25" {...st} /><ellipse cx={45} cy={30} rx={24} ry={18} fill={color} transform="rotate(-20 45 30)" /></>;
      break;
    case "pen":
      g = <><rect x={-70} y={-75} width={110} height={145} rx={6} {...st} /><path d="M -50 -40 H 20 M -50 -10 H 20 M -50 20 H 0" {...st} strokeWidth={5} /><path d="M 75 -80 L 20 40 L 12 70 L 32 48 L 88 -72 Z" fill={color} /></>;
      break;
    case "mic":
      g = <><rect x={-32} y={-85} width={64} height={110} rx={32} {...st} /><path d="M -58 -5 Q -58 60 0 60 Q 58 60 58 -5 M 0 60 V 88 M -38 88 H 38" {...st} /><path d="M -32 -45 H 32 M -32 -20 H 32" {...st} strokeWidth={4} /></>;
      break;
    case "stunt":
      g = <><path d="M -95 -40 H 10 V 90" {...st} /><g transform="translate(55 10) rotate(35)"><circle cx={0} cy={-55} r={16} fill={color} /><path d="M 0 -35 L 0 20 M 0 -20 L -30 -45 M 0 -20 L 32 -40 M 0 20 L -22 60 M 0 20 L 26 55" {...st} /></g></>;
      break;
    case "bell":
      g = <><path d="M -75 45 Q -75 -45 0 -45 Q 75 -45 75 45 Z" {...st} /><path d="M -95 62 H 95" {...st} /><path d="M 0 -45 V -62 M -14 -66 H 14" {...st} /></>;
      break;
    case "cart":
      g = <><path d="M -95 -65 H -65 L -40 35 H 65 L 85 -35 H -55" {...st} /><circle cx={-25} cy={65} r={13} {...st} /><circle cx={50} cy={65} r={13} {...st} /><path d="M -45 -5 H 75" {...st} strokeWidth={4} /></>;
      break;
    case "case":
      g = <><rect x={-90} y={-40} width={180} height={115} rx={10} {...st} /><path d="M -32 -40 V -65 H 32 V -40 M -90 10 H 90" {...st} /></>;
      break;
    case "code":
      g = <text x={0} y={35} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={110} fill={color}>{"</>"}</text>;
      break;
    case "hanger":
      g = <path d="M -12 -55 Q -12 -85 12 -85 Q 36 -85 30 -62 Q 24 -45 0 -38 L -100 30 Q -108 42 -95 42 H 95 Q 108 42 100 30 L 0 -38" {...st} />;
      break;
    case "film":
      g = <><rect x={-95} y={-60} width={130} height={110} rx={6} {...st} /><path d="M -95 -35 H 35 M -95 25 H 35" {...st} strokeWidth={4} />{[-75, -45, -15, 15].map((cx) => <rect key={cx} x={cx} y={-55} width={12} height={12} fill={color} />)}<rect x={55} y={-50} width={40} height={64} rx={20} {...st} /><path d="M 45 10 Q 45 50 75 50 Q 105 50 105 10 M 75 50 V 75" {...st} /></>;
      break;
    case "factory":
      g = <><path d="M -100 80 V -10 L -50 -45 V -10 L 0 -45 V -10 L 50 -45 V 80 Z" {...st} /><path d="M 60 80 V -85 H 90 V 80 M -100 80 H 100" {...st} /></>;
      break;
    case "desk":
      g = <><rect x={-70} y={-85} width={140} height={90} rx={6} {...st} /><path d="M 0 5 V 30 M -40 30 H 40 M -110 55 H 110 M -95 55 V 95 M 95 55 V 95" {...st} /><path d="M -45 -55 H 35 M -45 -30 H 15" stroke={C.tech} strokeWidth={5} strokeLinecap="round" /></>;
      break;
    case "dish":
      g = <><rect x={-90} y={-95} width={180} height={190} rx={10} {...st} /><path d="M -90 -55 H 90" {...st} /><circle cx={-55} cy={-75} r={6} fill={color} /><circle cx={-30} cy={-75} r={6} fill={color} /><path d="M -60 -20 V 60 M -30 -20 V 60 M 0 -20 V 60 M 30 -20 V 60 M 60 -20 V 60" {...st} strokeWidth={4} opacity={0.6} /></>;
      break;
    case "pan":
      g = <><ellipse cx={-20} cy={0} rx={70} ry={26} {...st} /><path d="M -90 0 Q -90 50 -20 50 Q 50 50 50 0 M 50 2 L 120 -10" {...st} /></>;
      break;
    case "bubble":
      g = <><path d="M -90 -60 H 90 V 40 H -20 L -55 75 V 40 H -90 Z" {...st} /><path d="M -60 -25 H 60 M -60 5 H 30" {...st} strokeWidth={5} /></>;
      break;
    case "doc":
      g = <><path d="M -65 -90 H 35 L 70 -55 V 90 H -65 Z M 35 -90 V -55 H 70" {...st} /><path d="M -40 -30 H 45 M -40 0 H 45 M -40 30 H 20" {...st} strokeWidth={5} /></>;
      break;
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>{g}</g>;
};
