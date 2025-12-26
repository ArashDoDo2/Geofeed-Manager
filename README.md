# Geofeed-Manager

Geofeed-Manager is meant to make it easy to create and maintain [geofeed](https://datatracker.ietf.org/doc/html/rfc8805) CSV files for IP ranges. The goal is to streamline validation, publishing, and auditing so geolocation updates are consistent and reviewable.

## Project goals
- Provide a simple workflow for editing geofeed entries (prefix, country code, region, city, and optional coords).
- Validate input against RFC 8805 formatting rules before publishing.
- Offer tooling to publish signed feeds to hosting targets (for example, object storage or web servers).
- Track revisions so changes can be reviewed and rolled back when necessary.

## Getting started
This repository currently contains the scaffolding for the project. Suggested defaults are based on a Node.js toolchain, but you can adapt them as needed.

1. Install Node.js (LTS) and npm.
2. Initialize the project dependencies:
   ```bash
   npm install
   ```
3. Add your application code under `src/` and tests under `tests/`.
4. Run the test suite as you add features:
   ```bash
   npm test
   ```

## Repository structure
- `src/` — source code for parsers, validators, and publishing logic.
- `tests/` — automated tests for geofeed parsing and validation.
- `docs/` — design documents, usage guides, and release notes.
- `scripts/` — helper scripts for development and CI.

Create these directories as you flesh out the implementation. Keeping the layout consistent makes it easier to onboard contributors.

## Development tips
- Follow semantic versioning for releases.
- Use conventional commits (e.g., `feat: add geofeed parser`) to keep history easy to scan.
- Lint code and run tests locally before opening a pull request.
- Document user-facing changes in the `docs/` folder to keep context close to the code.

## References
- [RFC 8805: A Format for Self-Published IP Geolocation Feeds](https://datatracker.ietf.org/doc/html/rfc8805)
- [BCP 47 language tags](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) for location naming guidance
