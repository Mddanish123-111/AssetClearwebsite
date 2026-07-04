# AssetClear — Design Notes

## Brief, restated

This isn't a marketing site — it's a tool ops managers and field crews stare
at all day while dispatching jobs and logging inventory. It should feel like
a **dispatch console**, not a SaaS landing page. Explicitly avoiding: warm
cream + serif (too editorial), near-black + neon accent (too "AI tool"),
newspaper hairline grid (wrong register for a working app).

## Tokens

**Color**
| Token   | Hex       | Use |
|---------|-----------|-----|
| ink     | `#14181C` | Sidebar, primary text |
| graphite| `#1D2229` | Raised surfaces on dark |
| steel   | `#4C7A94` | Secondary accent — links, info states |
| amber   | `#E8A23D` | Primary accent — hazard-tape yellow, CTAs, active nav, in-progress |
| rust    | `#B5482F` | Destructive, overdue, landfill disposition |
| paper   | `#F5F3EE` | Main content background — manifest paper, not white |

**Type**
- Display: Barlow Condensed, uppercase, used only for page titles and section
  headers — a condensed industrial face that reads like dispatch-board
  signage, used with restraint (never body copy).
- Body: Inter — plain, high-legibility grotesk for forms and tables.
- Mono: IBM Plex Mono — reserved for job numbers, asset tags, and timestamps,
  so scannable identifiers visually separate from prose.

**Layout**
Dark fixed sidebar (the "console frame") + light paper content area (the
"work surface"), since most time is spent reading dense tables and filling
forms — a dark canvas there would fatigue the eye over a full shift.

## Signature element

The **asset tag**: every asset and job number renders as a small dashed-border
mono chip, deliberately styled like a physical tear-off inventory tag you'd
staple to a piece of furniture on a clearance job. It's the one recurring
motif tying the identity to the actual work (tagging and tracking physical
items), rather than a decorative flourish.

## What I'd reconsider first

If real users find the condensed uppercase headers too shouty at this
density, drop to sentence case at the same tracking — the token system holds
either way.
