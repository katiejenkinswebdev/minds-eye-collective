#!/usr/bin/env bash
#
# BRAND.md forbids Iris, Bloom and Ether as text colors. This checks the CSS
# that actually shipped rather than the source, so a token indirection cannot
# hide a violation.
#
# It fails when there is no built CSS or no color declarations at all: pointing
# the check at the wrong path must never read as a pass.
#
# Usage: npm run build && bash scripts/check-brand.sh

set -uo pipefail

CSS_FILES=$(find .next/static/chunks -name "*.css" 2>/dev/null)

if [ -z "$CSS_FILES" ]; then
  echo "FAIL: no built CSS under .next/static/chunks. Run 'npm run build' first."
  exit 1
fi

DECLARATIONS=$(cat $CSS_FILES | grep -oiE '[;{]color:[^;}]*' | sed 's/^[;{]//' | sort -u)

if [ -z "$DECLARATIONS" ]; then
  echo "FAIL: found built CSS but zero color declarations. The check is broken."
  exit 1
fi

VIOLATIONS=$(printf '%s\n' "$DECLARATIONS" \
  | grep -iE '#8b7cf0|#c05cd6|#3ec8d8|var\(--mec-(iris|bloom|ether)\)')

if [ -n "$VIOLATIONS" ]; then
  echo "FAIL: decorative accent used as a text color:"
  printf '%s\n' "$VIOLATIONS" | sed 's/^/  /'
  exit 1
fi

COUNT=$(printf '%s\n' "$DECLARATIONS" | wc -l | tr -d ' ')
echo "PASS: $COUNT distinct color declarations, none using Iris, Bloom or Ether."
printf '%s\n' "$DECLARATIONS" | sed 's/^/  /'
