# Spec Sheet — Loot Deck Helper (Table Mode)

## Summary
A simple web page used on one device at the table to build a loot pool and randomly draw loot without replacement when loot tokens are spent.

## Goal

* Configure a scenario-specific loot pool (loot composition).
* Spend loot tokens to draw random loot.
* Draws are without replacement: drawn loot is removed from the available pool.
* Show remaining loot counts and a draw history log.

## Non-Goals

* No player list, no per-player tracking.
* No seeded randomness.
* No undo.
* No backend, accounts, or cloud sync.
* No XP, conversion rates, campaign progression, or scenario completion logic.

## Target Platform

* Single-page web app.
* Runs in any modern browser.
* Touch-friendly on mobile.
* Works offline once loaded (no external dependencies).

## Core Concepts
### Loot Card Template
A defined loot “card type” such as “2 Gold” or “1 Lumber”. A template describes what is gained when drawn.

### Loot Composition
A set of counts for each loot card template. This represents the available loot for the scenario.

### Loot Pool
A finite pool created from the loot composition. Drawing removes cards from this pool.

### Loot Token
A unit spent by the table. Each loot token equals one draw.

## Data Model
**LootCardTemplate**

* `id`: unique string
* `label`: display name
* `payload`: structured contents
  * gold (number)
  * lumber (number)
  * metal (number)
  * hide (number)
  * arrowvine (number)
  * axenut (number)
  * corpsecap (number)
  * flamefruit (number)
  * rockroot (number)
  * snowthistle (number)
  * empty payload represents “Nothing”

**LootComposition**

* `counts`: mapping of template id to integer count (0 or higher)

**LootPool (runtime)**

* `pool`: list of template ids (expanded representation), e.g. `["gold_2", "lumber_1", "gold_2", ...]`

**DrawLogEntry**

* `timestamp`: number (milliseconds since epoch) or formatted time string
* `draws`: list of template ids drawn in that action

**SessionState**

* `composition`: LootComposition
* `pool`: LootPool
* `log`: list of DrawLogEntry

## Functional Requirements
### Pool Building

* The app must let the user set a count for each loot card template.
* The app must provide at least two presets:
  * **Blank** (all counts 0)
  * **Sample Demo Pool** (reasonable mix for testing)
* When the user presses “Build / Rebuild Pool”:
  * Create the pool from the composition counts.
  * Clear the draw log.
  * Update pool size and remaining counts.
* “Clear Counts” sets all counts to 0 and does not implicitly rebuild the pool until the user builds.

### Drawing

* The app must allow the user to set “loot tokens to spend” as an integer N (minimum 1).
* When the user presses “Draw”:
  * If N is greater than the number of cards remaining in the pool, block the action and show a clear message.
  * Otherwise, draw exactly N cards randomly from the pool.
  * Remove the drawn cards from the pool (no replacement).
  * Append a draw log entry with the drawn card ids and timestamp.
  * Update remaining counts and remaining pool size immediately.
* Drawing must be atomic: either draw all N or none.

### Random Selection

* Use standard unseeded randomness (e.g., `Math.random()`).
* Random draw method (expanded pool):
  * Choose a random index in the pool array, remove that element, repeat N times.

### Reset

* “Reset Session” clears:
  * pool
  * draw log
  * tokens-to-spend input resets to 1
* Composition counts may be preserved (recommended default) so the user can rebuild quickly.

## UI Requirements
Single Page Layout with two main sections:

### 1. Loot Pool Builder

* Preset selector (Blank, Sample Demo Pool)
* Grid/list of loot card templates with numeric inputs for counts
* Buttons:
  * Build / Rebuild Pool
  * Clear Counts
* Displays:
  * Current configured pool size (sum of counts)
  * Current built pool remaining count (actual pool length)

### 2. Drawing Area

* Loot tokens to spend input:
  * Numeric input
  * Optional +/- buttons for quick adjustment
* Draw button
* Reset Session button
* Remaining pool size display
* Remaining loot counts table (per template)
* Draw log list (most recent first or chronological; choose one and be consistent)

## UI Behaviour & States

* Draw button is disabled when:
  * pool is empty
  * tokens-to-spend > remaining pool
* The UI must clearly distinguish:
  * configured composition size (what the pool would be if rebuilt)
  * remaining pool size (what’s left during play)
* After each draw:
  * show the results prominently (e.g., at top of log or a “Last Draw” panel)
  * update remaining counts

## Accessibility & Usability

* All inputs have visible labels.
* Touch targets suitable for mobile.
* No reliance on colour alone to convey disabled/error states.

## Technical Constraints

* Plain HTML/CSS/JS.
* No external libraries.
* Prefer single-file deliverable.
* Optional localStorage persistence is allowed but not required.

## Acceptance Checklist

* Pool size after build equals sum of composition counts.
* Draw removes cards from pool and updates counts correctly.
* Cannot draw more than remaining pool.
* Reset clears pool and log.
* Works well on a phone at a table (no horizontal scrolling, buttons easy to tap).
