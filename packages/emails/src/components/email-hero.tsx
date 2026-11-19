import { type EmailTone, emailFonts, emailToneStyles } from "../theme";

interface EmailHeroProps {
  tone: EmailTone;
  /** Single glyph: emoji and SVG icons are unreliable across clients. */
  glyph: string;
  compact?: boolean;
}

/** Tinted band with a round glyph badge, shared by the transactional emails. */
export function EmailHero({ tone, glyph, compact = false }: EmailHeroProps) {
  const colors = emailToneStyles[tone];
  const size = compact ? 64 : 72;
  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{ backgroundColor: colors.band, width: "100%" }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{ padding: compact ? "28px 0 22px" : "34px 0 28px" }}
          >
            <table cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td
                    align="center"
                    style={{
                      backgroundColor: colors.circle,
                      borderRadius: "50%",
                      color: colors.ink,
                      fontFamily: emailFonts.display,
                      fontSize: `${size / 2.4}px`,
                      fontWeight: 700,
                      height: `${size}px`,
                      width: `${size}px`,
                    }}
                  >
                    {glyph}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
