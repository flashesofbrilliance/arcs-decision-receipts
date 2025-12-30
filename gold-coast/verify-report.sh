#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f report-no-hash.md ]]; then
  echo "Missing report-no-hash.md" >&2
  exit 1
fi

# Select hash tools
if command -v shasum >/dev/null 2>&1; then
  HASH_CMD=(shasum -a 256)
  CHECK_CMD=(shasum -a 256 -c)
elif command -v sha256sum >/dev/null 2>&1; then
  HASH_CMD=(sha256sum)
  CHECK_CMD=(sha256sum -c)
elif command -v python3 >/dev/null 2>&1; then
  HASH=$(python3 - <<'PY'
import hashlib
with open('report-no-hash.md','rb') as f:
    print(hashlib.sha256(f.read()).hexdigest())
PY
)
  echo "Computed SHA-256: $HASH"
  CHECK_CMD=()
else
  echo "No hashing tool found (shasum/sha256sum/python3)." >&2
  exit 1
fi

if [[ -z "${HASH:-}" ]]; then
  HASH=$("${HASH_CMD[@]}" report-no-hash.md | awk '{print $1}')
  echo "Computed SHA-256: $HASH"
fi

if [[ -f report.sha256 ]]; then
  echo "\nChecking against report.sha256..."
  if [[ ${#CHECK_CMD[@]} -gt 0 ]]; then
    if "${CHECK_CMD[@]}" report.sha256; then
      echo "Checksum file verification: OK"
    else
      echo "Checksum file verification: FAILED" >&2
      exit 2
    fi
  else
    # Fallback: manual compare
    EXPECTED=$(awk '{print $1}' report.sha256 | head -n1)
    if [[ "$EXPECTED" == "$HASH" ]]; then
      echo "Checksum file verification (manual): OK"
    else
      echo "Checksum file verification (manual): FAILED" >&2
      exit 2
    fi
  fi
else
  echo "\nreport.sha256 not found; skipping checksum file verification."
fi

if [[ -f report.md ]]; then
  echo "\nVerifying embedded hash in report.md..."
  EMBED=$(grep -Eo '[0-9a-f]{64}' report.md | head -n1 || true)
  if [[ -n "$EMBED" ]]; then
    echo "Embedded: $EMBED"
    if [[ "$EMBED" == "$HASH" ]]; then
      echo "Embedded hash matches computed hash: OK"
    else
      echo "Embedded hash does not match computed hash: FAILED" >&2
      exit 3
    fi
  else
    echo "No 64-hex hash found in report.md; skipping."
  fi
else
  echo "\nreport.md not found; skipping embedded hash verification."
fi

echo "\nAll checks completed."
