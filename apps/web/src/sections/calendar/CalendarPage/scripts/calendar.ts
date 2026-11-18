// Month + ministry filters of /calendario-anual. Pure show/hide over server-rendered rows.
export function initCalendar() {
  const root = document.querySelector<HTMLElement>('[data-cal]');
  if (!root || root.dataset.calBound) return;
  root.dataset.calBound = 'true';

  let month = 'all';
  let ministry = 'all';

  const apply = () => {
    root.querySelectorAll<HTMLElement>('[data-month]').forEach((section) => {
      const inMonth = month === 'all' || section.dataset.month === month;
      let visible = 0;
      section.querySelectorAll<HTMLElement>('[data-ministry]').forEach((row) => {
        const show = inMonth && (ministry === 'all' || row.dataset.ministry === ministry);
        row.hidden = !show;
        if (show) visible += 1;
      });
      section.hidden = visible === 0;
    });
  };

  const bind = (attr: 'calMonth' | 'calMinistry', set: (value: string) => void) => {
    const buttons = root.querySelectorAll<HTMLButtonElement>(`[data-${attr === 'calMonth' ? 'cal-month' : 'cal-ministry'}]`);
    buttons.forEach((button) =>
      button.addEventListener('click', () => {
        set(button.dataset[attr] ?? 'all');
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        apply();
      })
    );
  };

  bind('calMonth', (value) => (month = value));
  bind('calMinistry', (value) => (ministry = value));
}
