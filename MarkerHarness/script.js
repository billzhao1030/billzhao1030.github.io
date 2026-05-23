// ============================================================================
// Name matcher — pure JS port of markerHarness/name_match.py
// Algorithm: NFKD + casefold + permutation + containment + Levenshtein.
// Runs entirely in the browser; no API call. CJK preserved; ambiguity surfaced.
// ============================================================================
function nm_normalize(s) {
  if (!s) return "";
  // NFKD decompose + strip combining marks (U+0300-U+036F)
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  // Casefold (lowercase suffices for our charset)
  s = s.toLowerCase();
  // Keep [a-z0-9] + CJK Unified Ideographs (U+4E00-U+9FFF)
  return s.replace(/[^a-z0-9一-鿿]/g, "");
}

function nm_tokenize(s) {
  if (!s) return [];
  return s.trim().split(/[\s,._\-/\\|]+/).map(nm_normalize).filter(Boolean);
}

function nm_levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  if (a.length < b.length) { const t = a; a = b; b = t; }
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur.push(Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      ));
    }
    prev = cur;
  }
  return prev[b.length];
}

function nm_permutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of nm_permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

function nm_match(userInput, submissionTokens) {
  const user_norm = nm_normalize(userInput);
  if (!user_norm) return { status: "not_found", normalized_user_input: "" };

  const sub_map = {};
  for (const s of submissionTokens) sub_map[nm_normalize(s)] = s;

  // 1. exact
  if (user_norm in sub_map) {
    return { status: "match", submission_token: sub_map[user_norm], confidence: 1.0, method: "exact", normalized_user_input: user_norm };
  }

  // 2. permutation (2..4 tokens)
  const toks = nm_tokenize(userInput);
  if (toks.length >= 2 && toks.length <= 4) {
    const seen = new Set();
    for (const p of nm_permutations(toks)) {
      const cand = p.join("");
      if (seen.has(cand)) continue;
      seen.add(cand);
      if (cand in sub_map) {
        return { status: "match", submission_token: sub_map[cand], confidence: 0.95, method: "permutation", normalized_user_input: user_norm };
      }
    }
  }

  // 3. containment (suppressed when normalized input < 4 chars)
  if (user_norm.length >= 4) {
    let contained;
    if (toks.length >= 2) {
      contained = Object.keys(sub_map).filter((c) => toks.every((t) => c.includes(t)));
    } else {
      contained = Object.keys(sub_map).filter((c) => c.includes(user_norm));
    }
    if (contained.length === 1) {
      return { status: "match", submission_token: sub_map[contained[0]], confidence: 0.8, method: "containment", normalized_user_input: user_norm };
    }
    if (contained.length > 1) {
      return { status: "ambiguous", candidates: contained.map((c) => sub_map[c]), normalized_user_input: user_norm };
    }
  }

  // 4. fuzzy (Levenshtein <= 2 with length difference <= 2; suppressed for short)
  if (user_norm.length >= 4) {
    const near = Object.keys(sub_map)
      .filter((c) => Math.abs(c.length - user_norm.length) <= 2)
      .map((c) => [c, nm_levenshtein(user_norm, c)])
      .filter(([, d]) => d <= 2);
    if (near.length === 1) {
      return { status: "match", submission_token: sub_map[near[0][0]], confidence: 0.6, method: "fuzzy", normalized_user_input: user_norm };
    }
    if (near.length > 1) {
      return { status: "ambiguous", candidates: near.map(([c]) => sub_map[c]), normalized_user_input: user_norm };
    }
  }

  return { status: "not_found", normalized_user_input: user_norm };
}

// ============================================================================
// Demo widget — runs nm_match locally on each click / Enter / page load
// ============================================================================
(function () {
  const $q = document.getElementById("demo-q");
  const $against = document.getElementById("demo-against");
  const $btn = document.getElementById("demo-run");
  const $out = document.getElementById("demo-result");
  if (!$btn) return;

  function fmtLine(lbl, val, color) {
    const c = color ? ` ${color}-line` : "";
    return `<div><span class="lbl">${lbl}:</span> <span class="${c.trim()}">${val}</span></div>`;
  }

  function run() {
    const q = ($q.value || "").trim();
    const against = ($against.value || "").trim();
    if (!q) {
      $out.innerHTML = `<div class="warn-line">enter a name first</div>`;
      return;
    }
    const tokens = against.split(",").map((s) => s.trim()).filter(Boolean);
    const data = nm_match(q, tokens);
    const lines = [];
    lines.push(fmtLine("input", q));
    lines.push(fmtLine("normalized", data.normalized_user_input || ""));
    lines.push(fmtLine("against", tokens.join(", ")));
    if (data.status === "match") {
      lines.push(fmtLine("→ matched", data.submission_token, "ok"));
      lines.push(fmtLine("method", `${data.method}  (confidence ${data.confidence})`));
    } else if (data.status === "ambiguous") {
      lines.push(fmtLine("→ AMBIGUOUS", (data.candidates || []).join(", "), "warn"));
      lines.push(`<div class="lbl">we will never silently pick — the harness flags this for the teacher.</div>`);
    } else {
      lines.push(fmtLine("→ NOT FOUND", "no submission token matched", "err"));
    }
    $out.innerHTML = lines.join("");
  }

  $btn.addEventListener("click", run);
  $q.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
  $against.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
  run(); // auto-run once so the panel isn't empty on page load
})();

// ============================================================================
// Subtle entrance animation (cards / steps / accordion items fade in on scroll)
// ============================================================================
(function () {
  const targets = document.querySelectorAll(".card, .stage, .step-row, .demo, .accordion details");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => (t.style.opacity = 1));
    return;
  }
  targets.forEach((t) => {
    t.style.opacity = 0;
    t.style.transform = "translateY(8px)";
    t.style.transition = "opacity 0.55s ease, transform 0.55s ease";
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = 1;
          e.target.style.transform = "translateY(0)";
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  targets.forEach((t) => io.observe(t));
})();
