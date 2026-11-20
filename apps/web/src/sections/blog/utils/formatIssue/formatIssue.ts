const ISSUE_DIGITS = 3;

/** The edition number of the design: issue 43 is `N. 043`. */
export function formatIssue(issue: number): string {
  return `N. ${String(issue).padStart(ISSUE_DIGITS, '0')}`;
}
