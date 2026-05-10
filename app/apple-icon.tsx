import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none">
      <defs>
        <linearGradient
          id="bgGrad"
          x1="20"
          y1="18"
          x2="160"
          y2="164"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#12313f" />
          <stop offset="1" stopColor="#0a1621" />
        </linearGradient>
        <linearGradient
          id="ringGrad"
          x1="40"
          y1="40"
          x2="140"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3ed6ff" />
          <stop offset="1" stopColor="#46ffb2" />
        </linearGradient>
      </defs>

      <rect
        x="10"
        y="10"
        width="160"
        height="160"
        rx="42"
        fill="url(#bgGrad)"
      />
      <rect
        x="34"
        y="40"
        width="112"
        height="84"
        rx="18"
        fill="#0f2233"
        stroke="url(#ringGrad)"
        strokeWidth="6"
      />

      <circle cx="52" cy="56" r="5" fill="#46ffb2" />
      <circle cx="66" cy="56" r="5" fill="#3ed6ff" />

      <path
        d="M56 84 L72 72 L56 60"
        stroke="#9fe8ff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 90 H112"
        stroke="#7fffd4"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <circle
        cx="126"
        cy="110"
        r="20"
        fill="#0f2233"
        stroke="#3ed6ff"
        strokeWidth="6"
      />
      <path
        d="M126 98V122"
        stroke="#46ffb2"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M114 110H138"
        stroke="#46ffb2"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d="M42 142 H96"
        stroke="#46ffb2"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>,
    {
      ...size,
    },
  );
}
