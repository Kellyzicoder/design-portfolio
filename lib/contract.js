// Starting contract wording. Edit it in /studio → Site text & links → Forms & contract.
// Leave an empty line between each part. A line on its own that starts with a number is a heading.
export const DEFAULT_CONTRACT = `1. The work
Kelv Studio (Kelvin Mensah) will design the work described in this agreement. Anything not listed here is not included unless we agree on it in writing (a message or email is fine).

2. Payment
Prices are in New Zealand dollars. A 50% deposit is paid before work starts. The rest is paid before the final files are sent.

3. Changes (revisions)
The price includes up to 2 rounds of changes. More changes, or new ideas after you have approved the design, may cost extra. I will always tell you the cost before doing them.

4. What you need to provide
You will send the wording, dates, photos, logos and any other details on time. You confirm you have the right to use anything you send me.

5. Deadlines
We will agree on a delivery date. If details or feedback arrive late, the date may move. Urgent jobs (less than 48 hours) may cost extra.

6. Checking the design
Please check spelling, names, dates, times and prices before you approve the design. I am not responsible for mistakes in a design you have approved.

7. Final files
After full payment you will get high-quality PNG or JPG files, and a print-ready PDF if needed. Editable files (such as PSD files) are not included unless we agree on it.

8. Using the design
After full payment you may use the final design for your event, church or business. I may show the work in my portfolio and on social media, unless you ask me not to in writing.

9. Cancelling
If you cancel after work has started, the deposit is not refunded. If I am unable to finish the work, I will refund the money for the work not done.

10. Printing
If the design is printed by someone else, I am not responsible for the print quality, colours or delivery.

By signing below, you agree to these terms.`;

// "text with blank lines" -> [{ heading, body }]
export function contractParts(text) {
  return String(text || DEFAULT_CONTRACT)
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.trim().split('\n');
      const first = lines[0].trim();
      const isHeading = /^\d+[.)]\s+\S/.test(first) && first.length < 80 && lines.length > 1;
      return isHeading ? { heading: first, body: lines.slice(1).join('\n').trim() } : { heading: '', body: block.trim() };
    })
    .filter((p) => p.heading || p.body);
}
