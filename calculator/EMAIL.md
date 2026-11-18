# Calculator — delivery email

How the "personalised breakdown, straight to your inbox" promise gets kept.

## How it works

The page works out every figure in the visitor's browser and posts them to the
email platform as **contact fields** (names in `LEAD.fields` at the top of the
page script). The email is then built from those fields. So:

- the breakdown is **in the email itself** — no link back to an empty calculator
- no figures and no email address go in any URL
- no server, database or PDF is needed

Each signup also records `SIGNUP_DATE` and `CONSENT_TEXT` (the exact wording
shown beside the button), as the consent record.

## What the platform needs (Brevo now, or whatever replaces it)

1. **Contact fields**, all text, named as in `LEAD.fields`:
   `SIGNUP_DATE, CONSENT_TEXT, CALC_STATUS, CALC_TOTAL, CALC_LOST_INCOME,
   CALC_GROWTH, CALC_GAP_YEAR, CALC_GAP_MONTH, CALC_RETIRE_AT, CALC_WAIT_NOW,
   CALC_WAIT_1Y, CALC_WAIT_3Y, CALC_ONE_YEAR_DELAY, CALC_SUMMARY`
   (plus `UTM_SOURCE` … `UTM_TERM` if you want attribution).
2. **A form** that accepts all of those as hidden fields and adds the contact to
   the events list. Put its endpoint in `LEAD.action`. Brevo and MailerLite
   forms both throw away any field the form doesn't define, so every one must be
   added to the form, not just created as a contact field. Check that the
   platform accepts a long value in `CALC_SUMMARY` and `CONSENT_TEXT`.
3. **An automation**: when someone signs up through that form, send the email
   below straight away. If the form uses double opt-in, it goes once they confirm.
   Then test it with one submission of each kind (gap still open, gap closed).

`CALC_STATUS` is `current` or `closed`. For a closed gap, the `CALC_WAIT_*` and
`CALC_ONE_YEAR_DELAY` fields are empty, and the email skips the
cost-of-waiting section and the three steps.

## The email — draft, for Drafter and Reviewer

Merge tags are written in Brevo's style (`{{ contact.X }}`). Rename them for
another platform.

**Subject:** Your pay gap breakdown
**Preview:** What it adds up to, and what waiting costs.

Hi {{ contact.FIRSTNAME }},

Here's the breakdown from the calculator.

{% if contact.CALC_STATUS == "current" %}
**A gap of {{ contact.CALC_GAP_YEAR }} a year adds up to {{ contact.CALC_TOTAL }}
by the time you're {{ contact.CALC_RETIRE_AT }}** — {{ contact.CALC_LOST_INCOME }} in
lost income, and {{ contact.CALC_GROWTH }} in the growth that money would have
earned.

**The cost of waiting.** What the gap costs you by retirement, depending on when it
closes:

- Closed now: {{ contact.CALC_WAIT_NOW }}
- In a year: {{ contact.CALC_WAIT_1Y }}
- In three years: {{ contact.CALC_WAIT_3Y }}
- Never: {{ contact.CALC_TOTAL }}

Leaving it one more year costs about {{ contact.CALC_ONE_YEAR_DELAY }}.

**In a month,** that gap is about {{ contact.CALC_GAP_MONTH }} before tax.

**Three steps to start closing it**

**1. Is there a path to closing the gap where you are?**
In a challenging job market that favours employers, it can be very difficult to
close a significant, longstanding pay gap without a change in the scope of your
role. The existing arrangement has become a precedent, even if the gap is
acknowledged.

A substantial shift may require a step up, an expansion of responsibilities or a
shift towards higher-value activities. That gives you a credible argument that your
value proposition to the firm has changed—and that your compensation should change
with it.

Is that viable where you are? Consider the firm's size, its situation and
priorities, the opportunities available, and your relationship with the people
whose support you would need. Is there room to reshape your role or move into
another one internally? Or are the constraints such that you need to look
elsewhere?

**2. Where could you make a uniquely valuable contribution?**
What problem or opportunity matters to the key decision maker(s)? What evidence can
you present that you are uniquely well positioned to deliver it—or a key component
of it? What change in your role would allow you to deliver that?

A proposition or an ask that makes the boss's life easier or allows them to sleep
at night is far easier to say yes to.

**3. Whose backing would make it happen?**
Your direct line manager may not be the only person who influences your role and
compensation. Who do they go to for advice, and who would you want advocating for
you?

Once you know who those people are, repeat the same process: what matters to them?
How could you help them achieve it? How can you align your interests so you can
help each other?

Start ahead of time. The longer you put off those conversations, the more likely it
is that someone else's name is already in the picture—or that they have been lined
up for the opportunity.
{% else %}
**That gap costs you {{ contact.CALC_TOTAL }} by the time you're
{{ contact.CALC_RETIRE_AT }}** — {{ contact.CALC_LOST_INCOME }} in income while it
lasted, and {{ contact.CALC_GROWTH }} in the growth that money would have earned.

The gap has closed, so nothing more is building up. What it took can't be reversed
by a correction now. Most of the total is the growth, which is why a gap early in a
career costs more than the same gap later.
{% endif %}

All figures are in today's money: the gap grows 1.5% a year above inflation and is
invested at 3% above inflation, before tax. Illustrative only, not financial advice.

What's the biggest obstacle to changing your pay? Reply and tell me.

[standard signature, with the Substack line]

---

`CALC_SUMMARY` holds the whole breakdown as plain text. Use it if a platform can't
do the `if` / `else` above, or for a plain-text version of the email.
