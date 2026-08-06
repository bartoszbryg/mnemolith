# Mnemolith

Mnemolith is the public product showcase for **Recallith**, a local-first memory application that makes previously viewed browser activity and supported AI conversations searchable.

## What Recallith does

- Captures browser activity and supported AI conversations with explicit user controls.
- Stores memories locally on the user's device.
- Builds a searchable timeline from captured activity.
- Supports natural-language recall through a local AI provider.
- Provides controls for pausing capture, excluding sites, exporting data, and deleting stored memories.

## Public repository scope

This repository intentionally contains only the public-facing website, brand assets, installation guidance, and approved release artifacts. It does **not** contain Recallith's backend, desktop application source, browser-extension source, encryption implementation, licensing system, private feature logic, signing material, or secrets.

The omission of those components is deliberate. This repository is a product showcase and distribution surface, not the complete Recallith source tree.

## Repository layout

```text
.
|-- README.md
|-- release-assets/
|   `-- Recallith-Setup.exe
`-- website/
    |-- index.html
    |-- install.html
    |-- assets/
    |   `-- mnemolith.svg
    |-- css/
    |   `-- tokens.css
    `-- js/
        `-- deeplink.js
```

## Preview the website locally

From the repository root, run:

```powershell
python -m http.server 8080 --directory website
```

Then open [http://localhost:8080/](http://localhost:8080/).

The website's **Try it** action uses the registered `recallith://` desktop protocol. If Recallith is not installed or the protocol prompt is declined, the public website falls back to its installation guide.

## Installation

See the public [installation guide](website/install.html) for supported-platform instructions. The Windows release artifact is available under `release-assets/` when included with the current public release.

## Privacy and security

Recallith is designed around local storage and explicit capture controls. Never submit API keys, session tokens, license-signing material, private keys, personal memory exports, local databases, or diagnostic evidence containing private activity to this repository.

## Project status

Recallith is under active development. Product behavior, platform support, packaging, and public documentation may change as testing continues.

## License

No license is granted for the proprietary Recallith application or for components not explicitly published with a license. Public website materials remain subject to the repository owner's stated terms.
