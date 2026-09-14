# Calder Bay: deterministic engine

A 1920 gangster simulation engine, with a separate, disposable browser interface. Node.js 20+ is sufficient; the engine has no runtime dependencies, browser, server, database, or background timers. Money in the engine and scenarios is always **1920 U.S. dollars**; city wages are calibrated against [economic_anchors.md](economic_anchors.md).

```sh
npm test                         # focused rules tests and all playthrough contracts
npm run check                    # syntax checks for engine and scenario files
npm run playthrough              # readable causal traces for every playthrough
npm run playthrough -- docks_sleep_choices
npm run playthrough -- --json     # structured trace and complete final state for AI/debugging
npm run dev                        # local web game at http://127.0.0.1:4173, with caching disabled
```

An individual scenario can be run by its name; invalid names print the available choices. Any mismatch in a fixed value, event chain, random draw count, or narrative presence exits nonzero. This makes a balance change visible immediately: update expectations intentionally when changing the design, rather than allowing numbers to drift unnoticed.

## Music

Background music begins after the player starts or loads a game. Music can be disabled or adjusted independently from the Settings screen; preferences are stored in the browser. Asset licensing details are recorded beside the audio in [`ui/assets/audio/LICENSE.md`](ui/assets/audio/LICENSE.md).
