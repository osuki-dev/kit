#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-start}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE_DIR="$(cd "$ROOT_DIR/../.." && pwd)"

cd "$ROOT_DIR"

show_usage() {
  cat <<'USAGE'
usage: ./script/build_and_run.sh [mode]

Modes:
  start, run        Start the Expo dev server
  --ios, ios        Start Expo and open iOS
  --android, android
                   Start Expo and open Android
  --web, web        Start Expo for web
  --sim, sim        Start serve-sim simulator preview
  --sim-detach, sim-detach
                   Start serve-sim in the background
  --sim-kill, sim-kill
                   Stop detached serve-sim
  --dev-client, dev-client
                   Start Expo in development-client mode
  --tunnel, tunnel Start Expo using tunnel transport
  --export-web, export-web
                   Export the web build locally
  --doctor, doctor Run Expo diagnostics
  --help, help     Show this help
USAGE
}

resolve_expo_cmd() {
  if [[ -n "${EXPO_CLI:-}" ]]; then
    # Optional escape hatch for projects that need a wrapper command.
    # shellcheck disable=SC2206
    EXPO_CMD=(${EXPO_CLI})
    return
  fi

  if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
    EXPO_CMD=(pnpm exec expo)
  elif [[ -f yarn.lock ]] && command -v yarn >/dev/null 2>&1; then
    EXPO_CMD=(yarn expo)
  elif command -v bun >/dev/null 2>&1 && { [[ -f bun.lock ]] || [[ -f bun.lockb ]] || [[ -f "$WORKSPACE_DIR/bun.lock" ]] || [[ -f "$WORKSPACE_DIR/bun.lockb" ]]; }; then
    EXPO_CMD=(bunx expo)
  else
    EXPO_CMD=(npx expo)
  fi
}

run_doctor() {
  if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
    pnpm exec expo-doctor
  elif [[ -f yarn.lock ]] && command -v yarn >/dev/null 2>&1; then
    yarn expo-doctor
  elif command -v bun >/dev/null 2>&1 && { [[ -f bun.lock ]] || [[ -f bun.lockb ]] || [[ -f "$WORKSPACE_DIR/bun.lock" ]] || [[ -f "$WORKSPACE_DIR/bun.lockb" ]]; }; then
    bunx expo-doctor
  else
    npx expo-doctor
  fi
}

run_serve_sim() {
  if command -v bun >/dev/null 2>&1; then
    exec bunx serve-sim "$@"
  fi

  exec npx serve-sim "$@"
}

resolve_expo_cmd

case "$MODE" in
  start|run)
    exec "${EXPO_CMD[@]}" start
    ;;
  --ios|ios)
    exec "${EXPO_CMD[@]}" start --ios
    ;;
  --android|android)
    exec "${EXPO_CMD[@]}" start --android
    ;;
  --web|web)
    exec "${EXPO_CMD[@]}" start --web
    ;;
  --sim|sim)
    run_serve_sim
    ;;
  --sim-detach|sim-detach)
    run_serve_sim --detach
    ;;
  --sim-kill|sim-kill)
    run_serve_sim --kill
    ;;
  --dev-client|dev-client)
    exec "${EXPO_CMD[@]}" start --dev-client
    ;;
  --tunnel|tunnel)
    exec "${EXPO_CMD[@]}" start --tunnel
    ;;
  --export-web|export-web)
    exec "${EXPO_CMD[@]}" export --platform web
    ;;
  --doctor|doctor)
    run_doctor
    ;;
  --help|help)
    show_usage
    ;;
  *)
    show_usage >&2
    exit 2
    ;;
esac
