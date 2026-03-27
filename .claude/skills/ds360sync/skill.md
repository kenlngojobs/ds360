---
name: ds360sync
description: >
  Build the DS360 app locally and deploy the dist/ folder to the production server via FTP.
  Triggers on: "/ds360sync", "sync to server", "deploy ds360", "push to server", "upload build".
argument-hint: "[--build-only | --upload-only]"
---

# DS360 Sync Skill

Build locally and deploy to `ds360.imaginizedlabs.com` via FTP.

---

## FTP Configuration

- **Server:** ftp.imaginizedlabs.com
- **Port:** 21
- **Username:** claude@imaginizedlabs.com
- **Password:** PqvKi#nFATrvc4TIkc
- **FTP root maps to:** /home/imaginizedlabs/ds360
- **Document root:** /home/imaginizedlabs/ds360/dist

---

## Workflow

### Step 1: Build

Run the Vite production build locally:

```bash
cd "C:/Users/kenln/Cowork/DS360" && npm run build
```

If the build fails, stop and report the error. Do NOT proceed to upload.

### Step 2: Identify changed files

Use Node.js to compute MD5 hashes and diff against the manifest at `C:/Users/kenln/Cowork/DS360/.claude/ds360sync-manifest.json`.

**Important:** The project has `"type": "module"` in package.json, so inline `node -e` scripts fail with `require is not defined`. Always write scripts to a `.cjs` file and run them with `node --input-type=commonjs`:

```bash
node --input-type=commonjs < "C:/Users/kenln/Cowork/DS360/.claude/ds360diff.cjs"
```

The diff script (`C:/Users/kenln/Cowork/DS360/.claude/ds360diff.cjs`) should:
1. Hash every file in `dist/` with MD5
2. Compare against the manifest
3. Print a JSON array of relative paths that differ

If the array is empty, report "Nothing to upload — dist/ is up to date." and stop.

### Step 3: Upload changed files via FTP

Upload only the changed files. Use curl with `--ftp-create-dirs`:

```bash
curl --ftp-create-dirs -T "C:/Users/kenln/Cowork/DS360/dist/<relative-path>" "ftp://ftp.imaginizedlabs.com/dist/<relative-path>" --user "claude@imaginizedlabs.com:PqvKi#nFATrvc4TIkc"
```

Use parallel uploads where possible for speed.

After all uploads succeed, regenerate and save the manifest using a `.cjs` script (same pattern as the diff step):

```bash
node --input-type=commonjs < "C:/Users/kenln/Cowork/DS360/.claude/ds360manifest.cjs"
```

The manifest script should hash all files in `dist/` and write the result to `C:/Users/kenln/Cowork/DS360/.claude/ds360sync-manifest.json`.

### Step 4: Verify

Fetch the live site to confirm deployment:

```
WebFetch https://ds360.imaginizedlabs.com — check if the page loads and serves content
```

### Step 5: Report

Summarize:
- Build status (success/fail)
- Number of files changed / total files in dist/
- Which files were uploaded (list them)
- Which files were skipped (unchanged)
- Verification result (site accessible yes/no)

---

## Flags

| Flag | Behavior |
| :--- | :--- |
| `--build-only` | Run build but skip upload |
| `--upload-only` | Skip build, upload existing dist/ |

If no flag is given, run the full build + upload + verify workflow.

---

## Notes

- The server cannot build locally (esbuild crashes), so all builds must happen on the local machine.
- The FTP starting directory is `/home/imaginizedlabs/ds360`, so paths are relative to that.
- The subdomain `ds360.imaginizedlabs.com` points to `/home/imaginizedlabs/ds360/dist`.
- Python is not available on this machine — use Node.js for hashing/manifest work.
- The manifest is stored at `C:/Users/kenln/Cowork/DS360/.claude/ds360sync-manifest.json`. It tracks MD5 hashes of the last successfully uploaded dist/ files. Only files with changed or missing hashes are uploaded.
