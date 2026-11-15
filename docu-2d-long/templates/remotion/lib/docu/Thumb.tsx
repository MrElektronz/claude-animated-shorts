import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./theme";
import { Vignette } from "./Stage";

/**
 * Thumbnail frame (render as a Still at 1280x720 or 1920x1080).
 * Measured formula: night-navy scene, 2-4 words in heavy condensed caps (cream, soft glow) top-left over ~55 % width,
 * ONE glowing gold object on the right third, the small hero figure looking at it, stars/city lights for depth.
 * `children` = the scene (absolute SVG/HTML at 1920x1080 coordinates).
 */
export const Thumb: React.FC<{ lines: string[]; children?: React.ReactNode; size?: number }> = ({ lines, children, size = 190 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 60% 85%, #22408f 0%, ${C.bg} 45%, ${C.bgDeep} 100%)`, overflow: "hidden" }}>
    {children}
    <Vignette strength={0.5} />
    <div style={{ position: "absolute", left: 80, top: 70, width: 1150 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: FONT.poster, fontSize: size, lineHeight: 0.98, color: C.paper, textTransform: "uppercase", letterSpacing: "-0.005em", textShadow: "0 0 40px rgba(243,233,198,0.45), 0 6px 18px rgba(0,0,0,0.5)" }}>
          {l}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
