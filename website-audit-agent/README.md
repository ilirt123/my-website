# All American Tiles Website Audit Agent

This agent performs a proposal-only website audit for All American Tiles.

## What it does

- Reads the current All American Tiles homepage.
- Reads a curated set of remodeling/tile benchmark websites.
- Compares conversion, trust, local SEO, mobile-oriented content hierarchy, service positioning, and project presentation.
- Produces a Markdown improvement report.
- Creates a GitHub issue containing recommendations.

## What it does not do

- It does not modify the live website.
- It does not publish changes.
- It does not copy competitor wording, branding, claims, or images.
- It does not invent business credentials or guarantees.

## Schedule

The GitHub Action is configured for Monday at 13:00 UTC (9:00 AM Eastern during daylight saving time) and can also be run manually.

## Required secret

Add a repository Actions secret named:

`OPENAI_API_KEY`

The workflow defaults to `gpt-5.6-luna` to keep recurring audit cost low. The model can be changed with `OPENAI_MODEL`.

## Change benchmark websites

Edit `benchmarks.json`. The first entry is always All American Tiles; the remaining entries are comparison sites.

## Output

Each run creates a GitHub issue titled:

`Website Audit — YYYY-MM-DD`

The report is intentionally recommendation-only so that a human reviews every proposed website change before implementation.
