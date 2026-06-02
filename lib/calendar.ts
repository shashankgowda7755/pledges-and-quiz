import prisma from '@/lib/prisma';

// A single normalized entry for the calendar / events timeline, regardless of
// whether it originates from an Event record or a dated Pledge. This is what
// makes everything "auto-linked": admins only need to set a date on a pledge
// (or create an Event) and it surfaces everywhere automatically.
export type CalendarItem = {
  id: string;
  kind: 'Event' | 'Pledge';
  title: string;
  description: string;
  date: Date; // start / event date
  endDate: Date | null;
  location: string | null;
  href: string;
  bannerUrl: string | null;
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const istDayStart = (d: Date) => {
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
};

/**
 * Unified, date-sorted activity feed: Event records + standalone dated pledges.
 * Pledges attached to an Event (eventId set) are omitted here because the Event
 * already represents them.
 *
 * @param opts.upcomingOnly  drop anything whose day is before today (IST).
 */
export async function getCalendarItems(opts: { upcomingOnly?: boolean } = {}): Promise<CalendarItem[]> {
  const [events, pledges] = await Promise.all([
    prisma.event.findMany({ where: { isActive: true } }),
    prisma.pledge.findMany({ where: { isActive: true, eventDate: { not: null }, eventId: null } }),
  ]);

  const items: CalendarItem[] = [
    ...events.map((e): CalendarItem => ({
      id: e.id,
      kind: 'Event',
      title: e.title,
      description: e.description,
      date: e.startDate,
      endDate: e.endDate,
      location: e.location,
      href: `/events/${e.slug}`,
      bannerUrl: e.bannerUrl,
    })),
    ...pledges.map((p): CalendarItem => ({
      id: p.id,
      kind: 'Pledge',
      title: p.name,
      description: p.description,
      date: p.eventDate as Date,
      endDate: null,
      location: null,
      href: `/pledges/${p.slug}`,
      bannerUrl: p.bgImageUrl,
    })),
  ];

  const filtered = opts.upcomingOnly
    ? items.filter(i => {
        const effectiveEnd = i.endDate ?? i.date;
        return effectiveEnd.getTime() >= istDayStart(new Date()).getTime();
      })
    : items;

  return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
}
