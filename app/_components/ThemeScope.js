"use client";

/**
 *
- Wrap content with the vault theme class.
- @param {object} props
- @returns {JSX.Element}
 */
export function ThemeScope({ themeKey, children }) {
  return <div className={`${themeKey}`}>{children}</div>;
}
