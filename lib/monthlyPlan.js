// Monthly design plan: the price per design, the choices a client can make,
// and the agreement wording for kelvstudio.com/monthly.

export const RATE = 50; // NZ$ per design
export const WEEKS = 4; // a month's plan = designs per week x 4
export const MAX_PER_WEEK = 7;
export const DESIGN_TYPES = [
  'Social media posts',
  'Instagram / Facebook stories',
  'Event flyers',
  'Church service graphics',
  'Carousels (multi-slide posts)',
  'Announcements',
  'Thumbnails / covers',
];
export const BRIEF_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const perMonth = (perWeek) => Math.max(1, Math.min(MAX_PER_WEEK, Number(perWeek) || 1)) * WEEKS;
export const monthlyPrice = (perWeek) => perMonth(perWeek) * RATE;

// the day designs are ready: 2 days after the brief day
export const readyDay = (briefDay) => {
  const i = BRIEF_DAYS.indexOf(briefDay);
  return i < 0 ? '' : BRIEF_DAYS[(i + 2) % 7];
};

export function monthlyTerms({ perWeek, briefDay }) {
  const n = perMonth(perWeek);
  const price = monthlyPrice(perWeek);
  const ready = readyDay(briefDay) || 'two days later';
  return `1. The plan
Kelv Studio (Kelvin Mensah) will design up to ${n} designs each month for the Client (about ${Math.round(n / WEEKS)} a week). One design is one graphic, such as a social media post, a story, a flyer or one slide set. Bigger work, such as logos, brand kits, banners, booklets, websites or video, is not included and will be quoted separately.

2. Price and payment
The plan costs NZ$${RATE} per design, so NZ$${price} per month. Each month is paid upfront, before that month's work starts. Payment is by the online Stripe invoice (card) or by bank transfer. Work for a month starts once that month is paid.

3. The weekly routine
The Client sends the wording, dates, photos and logos for the week by ${briefDay || 'the agreed brief day'}. Kelv Studio sends the first versions by ${ready}. If details arrive late, the designs may be ready later.

4. Changes (revisions)
Each design includes up to 2 rounds of changes. More changes, or new ideas after a design is approved, count as a new design.

5. Extra designs and rush jobs
Designs beyond the monthly plan cost NZ$${RATE} each and are added to the next invoice. Urgent designs needed in less than 48 hours may cost extra. Kelv Studio will always say the cost first.

6. Unused designs
Designs that are not used in a month do not carry over to the next month. If Kelv Studio cannot deliver designs that were paid for, they carry over to the next month or are refunded, whichever the Client prefers.

7. What you need to provide
The Client sends details on time and confirms they have the right to use anything they send, such as photos, logos and music.

8. Checking the design
Please check spelling, names, dates, times and prices before approving a design. Kelv Studio is not responsible for mistakes in a design the Client has approved.

9. Final files
For paid months, the Client gets high-quality PNG or JPG files, and a print-ready PDF if needed. Editable files (such as PSD files) are not included unless agreed.

10. Using the designs
Once paid, the Client may use the designs for their business, church, brand or events. Kelv Studio may show the work in its portfolio and on social media, unless the Client asks it not to in writing.

11. Changing or ending the plan
Either side can change the number of designs or end the plan with 2 weeks' notice in writing (a message or email is fine). Changes start from the next month. Months already paid are not refunded, except for designs Kelv Studio could not deliver.

12. Price changes
Kelv Studio will give at least 1 month's notice before changing the price.

13. Printing
If the designs are printed by someone else, Kelv Studio is not responsible for the print quality, colours or delivery.

By signing below, you agree to these terms.`;
}
