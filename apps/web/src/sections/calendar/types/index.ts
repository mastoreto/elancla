import type { PublicCalendar } from '@ancla/content';

// Shapes of the public calendar contract (`publicCalendarDto`), named for the section.
export type CalendarEvent = PublicCalendar['events'][number];
export type CalendarWeeklySlot = PublicCalendar['weekly'][number];
export type CalendarMinistry = PublicCalendar['ministries'][number];
export type CalendarException = PublicCalendar['exceptions'][number];
export type CalendarMinistryColor = CalendarEvent['color'];
