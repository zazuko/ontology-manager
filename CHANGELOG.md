# `v0.9.50`

Designs can be configured at runtime using the `EDITOR_STYLE` env var.
[How to create a design](https://github.com/zazuko/ontology-editor/commit/1119631d2a0457fbf3f71b5e03a2d187e4fcffb8?short_path=04c6e90).

# `v0.9.49`

Healthcheck endpoint: `/api/health` returns http200 with `ok` as plain/text.

# `v0.9.44`

PM2 rotates and compresses its logs to spare container disk usage.

# `v0.9.36`

Admin pagination is much nicer.

# `v0.9.33`

Proposal count displayed on the structure is counting recursively to prevent a parent with 0 proposal
to show 0 when its children have proposals.
