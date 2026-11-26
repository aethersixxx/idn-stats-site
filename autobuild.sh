#!/bin/bash
# Auto-build the stats site with codex after the OpenRouter free-tier daily reset (00:00Z).
LOG=/root/stats-entry/autobuild.log
cd /root/stats-entry
echo "armed at $(date -u)" >> $LOG

# 1. wait until 00:05Z
while [ "$(date -u +%H%M)" -lt "0005" ]; do sleep 120; done
echo "reset window reached $(date -u)" >> $LOG

KEY=$(grep OPENROUTER ~/.bashrc | cut -d= -f2)

MODEL=$(cat BUILD_MODEL.txt 2>/dev/null || echo "nvidia/nemotron-3-ultra-550b-a55b:free")

check_done() {
  N=$(find app -type f | wc -l)
  if [ "$N" -ge 6 ]; then
    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts > out-check.log 2>&1
    [ $? -eq 0 ] && [ -f out/dossier.json ]
  else
    return 1
  fi
}

for i in $(seq 1 45); do
  if check_done; then echo "BUILD_DONE pass=$i $(date -u)" >> $LOG; break; fi
  sed -i "s/^model = .*/model = \"$MODEL\"/" /root/.codex/config.toml 2>/dev/null
  python3 - "$MODEL" <<'EOF'
import sys
p="/root/.codex/config.toml"
c=open(p).read()
import re
c=re.sub(r'^model = .*$', f'model = "{sys.argv[1]}"', c, flags=re.M)
open(p,"w").write(c)
EOF
  OPENROUTER_API_KEY=$KEY codex exec --skip-git-repo-check --sandbox workspace-write \
    "Continue the build task in BUILD_BRIEF.md. IMPORTANT: minimize the number of tool calls - write each file in one go with its full final content (use a single shell command with a heredoc or apply_patch per file). Do not re-read files you just wrote. Do not run exploratory commands. Build all remaining pages/data/scripts, then finish with the main.ts check (mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts). If everything already exists and the check passes, verify links/files then stop." \
    >> $LOG 2>&1
  # detect daily-quota exhaustion and switch/fail
  if tail -c 3000 $LOG | grep -q "free-models-per-day"; then
    case "$MODEL" in
      nemotron*) MODEL="inclusionai/ling-3.2-flash:free"; echo "$MODEL" > BUILD_MODEL.txt; echo "switching model to $MODEL" >> $LOG;;
      ling*) MODEL="particle-ai/particle-1:free"; echo "$MODEL" > BUILD_MODEL.txt; echo "switching model to $MODEL" >> $LOG;;
      particle*) echo "QUOTA_EXHAUSTED $(date -u)" >> $LOG; exit 2;;
    esac
    sleep 60
  fi
  sleep 10
done
check_done && echo "BUILD_DONE final $(date -u)" >> $LOG || echo "BUILD_INCOMPLETE $(date -u)" >> $LOG
echo "MODEL_USED=$MODEL" > BUILD_MODEL.txt
