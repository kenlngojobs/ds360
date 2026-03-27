---
name: ds360sync
description: >
  Build the DS360 app locally and deploy the dist/ folder to the production server via FTP.
  Triggers on: "/ds360sync", "sync to server", "deploy ds360", "push to server", "upload build".
argument-hint: "[--build-only | --upload-only]"
---

# DS360 Sync Skill

Two steps: **build locally**, then **FTP upload changed files** to `ds360/dist` on the server.

---

## FTP Configuration

- **Server:** ftp.imaginizedlabs.com
- **Username:** claude@imaginizedlabs.com
- **Password:** PqvKi#nFATrvc4TIkc
- **Remote path:** `dist/` (maps to `/home/imaginizedlabs/ds360/dist`)

---

## Step 1: Build

```bash
cd "C:/Users/kenln/Cowork/DS360" && npm run build
```

Stop and report if build fails. Do NOT upload.

---

## Step 2: Find changed files

The project uses `"type": "module"`, so use `node --input-type=commonjs` to run the `.cjs` diff script:

```bash
node --input-type=commonjs < "C:/Users/kenln/Cowork/DS360/.claude/ds360diff.cjs"
```

Outputs a JSON array of `dist/`-relative paths that differ from the last upload.
If `[]`, report "Nothing to upload — already up to date." and stop.

---

## Step 3: Upload changed files

For each changed file, upload in parallel:

```bash
curl --ftp-create-dirs -T "C:/Users/kenln/Cowork/DS360/dist/<rel>" \
  "ftp://ftp.imaginizedlabs.com/dist/<rel>" \
  --user "claude@imaginizedlabs.com:PqvKi#nFATrvc4TIkc"
```

After all uploads succeed, update the manifest:

```bash
node --input-type=commonjs < "C:/Users/kenln/Cowork/DS360/.claude/ds360manifest.cjs"
```

---

## Step 4: Report

- Build: success/fail
- Files uploaded (list) vs skipped (unchanged)

---

## Flags

| Flag | Behavior |
|------|----------|
| `--build-only` | Build only, no upload |
| `--upload-only` | Skip build, upload from existing dist/ |

---

## Notes

- Python unavailable — use Node.js (`node --input-type=commonjs`) for all scripting.
- Helper scripts live at `C:/Users/kenln/Cowork/DS360/.claude/ds360diff.cjs` and `ds360manifest.cjs`.
- Manifest at `C:/Users/kenln/Cowork/DS360/.claude/ds360sync-manifest.json` tracks MD5 hashes of the last successful upload.
