/**
 * Brand colors for CLI output
 * PlayNew orange: #ff4d00 = RGB(255, 77, 0)
 */
// ANSI true color escape codes for PlayNew brand orange
export const orange = (text) => `\x1b[38;2;255;77;0m${text}\x1b[39m`;
// Lighter orange for secondary elements
export const orangeLight = (text) => `\x1b[38;2;255;102;32m${text}\x1b[39m`;
// Background orange with black text
export const bgOrange = (text) => `\x1b[48;2;255;77;0m${text}\x1b[49m`;
//# sourceMappingURL=colors.js.map