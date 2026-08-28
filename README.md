# negotiatelikeawoman.co

Static site. No build step, no framework — just HTML files served as they are.

```
index.html                    the home page at negotiatelikeawoman.co
closing-the-gap/index.html    the programme page at /closing-the-gap/
assets/                       images shared across pages
```

Edit a file, save, push. The site rebuilds itself in about thirty seconds.

---

## Setting it up — one time only

Four things are involved and it helps to know what each does.

| | |
|---|---|
| **Spaceship** | Where you bought the domain name. The registrar. |
| **GitHub** | Where the files live, with a full history of every change. |
| **Cloudflare Pages** | Takes the files from GitHub and serves them to visitors. Free, fast, HTTPS included. |
| **Cloudflare DNS** | The address book entry that points `negotiatelikeawoman.co` at the site. |

### 1 · Put the files on GitHub

You don't need to install anything. The website does all of it.

1. Go to **github.com** → the **+** in the top right → **New repository**
2. Name it `website`
3. Leave it **Public** — Cloudflare can read private repos too, but public is simpler and there's nothing secret here
4. Don't tick "Add a README" — we already have one
5. **Create repository**
6. On the next screen click **uploading an existing file**
7. Drag in the *contents* of the `site` folder — `index.html`, the `closing-the-gap` folder, the `assets` folder, and this README. Not the `site` folder itself.
8. At the bottom, in the box that says "Commit changes", write `First version` and click **Commit changes**

That's it. Your files are on GitHub.

> **What a commit is.** A saved snapshot with a note attached. Every commit is
> kept, so you can always see what changed and go back. The note is for you —
> "Fixed the price", "New testimonial" — six months from now you'll be glad.

### 2 · Connect Cloudflare Pages

1. Sign up at **dash.cloudflare.com** (free)
2. In the sidebar: **Compute (Workers & Pages)** → **Create** → **Pages** → **Connect to Git**
3. Authorise GitHub when it asks, and pick the `website` repository
4. When it asks for build settings:
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `/`
5. **Save and Deploy**

A minute later it's live at something like `negotiatelikeawoman.pages.dev`.
**Test everything on that address before pointing the domain at it.**

### 3 · Point the domain at it

Cloudflare needs to run the DNS for the domain. Because nothing is set up on
`negotiatelikeawoman.co` yet — no website, no email — there's nothing to break.

**In Cloudflare:**

1. **Add a domain** (top of the dashboard) → type `negotiatelikeawoman.co`
2. Choose the **Free** plan
3. It'll scan for existing records and find none. Continue.
4. It gives you **two nameservers**, something like `xxx.ns.cloudflare.com`. Copy both.

**In Spaceship:**

1. Open your domain → find **Nameservers**
2. Switch from the default to **Custom nameservers**
3. Paste in the two Cloudflare ones, replacing what's there
4. Save

Now wait. Nameserver changes take anywhere from ten minutes to a few hours to
spread across the internet. Cloudflare emails you when it's done.

**Back in Cloudflare, once it's active:**

1. Go to your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `negotiatelikeawoman.co`
3. Cloudflare adds the DNS record itself and issues the HTTPS certificate

Add `www.negotiatelikeawoman.co` the same way if you want it to work too.

---

## Making changes afterwards

**Small edits.** On GitHub, open the file, click the pencil icon, edit, and commit
at the bottom. Cloudflare redeploys automatically.

**Bigger changes.** Ask Claude. The files are plain HTML and the whole site is
four files.

**If something breaks.** Cloudflare Pages keeps every previous version. Go to
**Deployments**, find the last good one, and **Rollback**. Takes seconds.

---

## Things that live elsewhere

- **Application form** — Tally, `tally.so/r/zx5ovg`
- **Brochure delivery** — Brevo (form not embedded yet; placeholder comment is in
  `closing-the-gap/index.html`)
- **Analytics** — Google Analytics property `G-9HWKQJCLPP`, shared with
  `empathyatthetable.negotiationwhisperer.co`
- **Booking** — Google Calendar appointment schedule
- **Privacy notice** — still on `negotiationwhisperer.co`, needs updating for
  cookies, Brevo, Tally and Cloudflare

## Still to do

- [ ] Terms page — write it, then put the link back in the footer of
      `closing-the-gap/index.html` (removed 28 Aug because it pointed at a placeholder)
- [ ] Enrolment agreement (not a web page — signed at joining)
- [ ] Update the privacy notice — cookies/analytics, and add Brevo, Tally and
      Cloudflare to the processors and transfers table
- [ ] Point the brochure PDF at `negotiatelikeawoman.co/closing-the-gap`

### Parked for later

- Company address details for the Terms page and enrolment agreement
