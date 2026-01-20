/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./_components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      dropShadow: {
        "3xl": "0 35px 35px rgba(0, 0, 0, 0.5)", // Increased opacity for a darker, more pronounced look
        intense: ["0 5px 5px rgba(0, 0, 0, 0.8)"],
      },
      colors: {
        accent: "var(--accent)",
        fg: "var(--fg)",
        "muted-fg": "var(--muted-fg)",
        border: "var(--border)",
        card: "var(--card)",
        input: "var(--input)",

        // buttons if not already present
        "btn-primary-bg": "var(--btn-primary-bg)",
        "btn-primary-fg": "var(--btn-primary-fg)",
        "btn-secondary-bg": "var(--btn-secondary-bg)",
        "btn-secondary-fg": "var(--btn-secondary-fg)",
      },
    },
  },
  plugins: [],
};
