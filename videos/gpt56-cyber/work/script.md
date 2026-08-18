# OpenAI's Cyber Model Completes 95% of Attacks — the Same Brain Says No to the Rest

**Format:** single-story | **Niche:** ai-news | **Target:** ~6 min (1,028 words @ 171.4 wpm)
**Voice:** en-US-AndrewNeural @ 1.15x (breaking-news) | **Date:** 2026-08-11

---

## COLD-OPEN-CLAIM (~18s, ~51 words)

[beat: hook — split-brain graphic, "95.0% vs 1.5%" slams in]

On August tenth, OpenAI shipped a model that says yes. GPT-5.6-Cyber completes ninety-five percent of the advanced cyber attacks it's asked to perform — versus one point five for its own base model. Same brain, different answer. And it already found two unknown Chrome bugs that escape Google's sandbox. If you run anything online, this is a tool built to get past you. But the last number in OpenAI's report is the one nobody is reporting — and it changes what this model is. We'll get to it.

---

## CONTEXT (~36s, ~103 words)

[beat: timeline — Daybreak launched at DevDay 2025, defense-first]

Quick backstory. Daybreak is OpenAI's cybersecurity program, launched at DevDay last fall. Two tracks: Blue, frontier general models for the defenders, and Red, models purpose-trained for offensive work. Today, Red gets its sharpest tool yet.

[beat: contrast — "a cyber-specific version of Sol"]

GPT-5.6-Cyber is a cyber-specific version of GPT-5.6 Sol, OpenAI's strongest reasoning model. Trained on top of it, tuned for authorized offense. Released alongside a policy post that upgrades cyber in its own preparedness framework.

---

## VERDICT (~108s, ~308 words)

[beat: verdict title card — "the first split-brain model"]

Here's the read. This is the first time one lab ships two answers to the same security question. Sol, with standard safeguards, refuses most attack chains — one point five percent completion. Turn on Daybreak Blue, and it creeps to two. Train a cyber version, and the same family completes ninety-five percent. That gap is not engineering noise. It is a policy choice, baked into the weights.

[beat: stat card — the four-way table]

The headline number is the table in OpenAI's announcement. GPT-5.6-Cyber: ninety-five percent of advanced cyber attack tasks in ExploitGym, their benchmark. GPT-5.6 Sol with standard safeguards: one point five percent. Sol under Daybreak Blue: two percent. And the previous cyber model, GPT-5.5-Cyber: fifty-seven point three. This is the jump.

[beat: what-it-does card — real findings]

And it's not a lab toy. OpenAI's team used it to find two previously unknown vulnerabilities in Chrome's V8 engine, chainable to escape Google's heap sandbox. Google fixed one — that's CVE-2026-15903, high severity, a bounds-check skip in the JIT compiler. The second is still under coordinated disclosure. The same model surfaced five or more vulnerabilities in a popular mobile OS. Three critical ones in a popular database. And more than four hundred privilege-escalation bugs in a popular kernel.

[beat: who-gets-it card — access gates]

What does this mean for you? If you're a defender, it's a force multiplier — that's the pitch. For everyone else, it's a wall. You can't buy access to this model on a whim. It needs Daybreak approval, legal attestations, and from September first, hardware security keys for individual accounts. The most powerful offensive model OpenAI has ever shipped is also the most locked down.

[beat: the policy turn — preparedness upgrade]

And the policy signal matters. OpenAI's own framework rates the model's cyber capability High, not Critical, in its latest assessment. That verdict came with the same post that says the defense window is narrowing. Two messages, one release.

---

## EVIDENCE (~108s, ~308 words)

[beat: evidence — announcement capture, disclosure frame for blocked page]

Let's go to the evidence. OpenAI's announcement page is bot-blocked — it will not load for a screenshot, so we verified the numbers by reading it directly. The pricing page and the CVE entry captured clean. First, the benchmark math, per the announcement. ExploitGym is OpenAI's own simulated-attack environment. Cyber beats both Sol and the previous cyber model on completion rate, success rate, and average success. On their zero-day finding evaluation, it lands higher severity findings with better calibration than either baseline.

[beat: evidence — model page pricing capture]

Second, the price. On OpenAI's model page, captured today: twelve dollars fifty per million input tokens, seventy-five dollars per million output. For a security tool that triages zero-days, that's the cost of skipping a smoke test. If you're a security team, you'll budget this against what a real breach costs.

[beat: mid-roll CTA]

If you want these breakdowns the day a model drops, verdict in the first three minutes, hit subscribe.

[beat: evidence — NVD capture, CVE-2026-15903]

Third, the Chrome finding, because it's independently checkable. On NVD, the US government vulnerability database, CVE-2026-15903 is a bounds check skip in V8's JIT compiler, rated high severity, affecting Chrome versions before one-thirty-six. OpenAI reported it, Google fixed it. That's a model finding a real, patchable, sandbox-escape-class bug in the browser you're probably watching this on.

[beat: the access reality — what "approved" means]

And the access reality, from the Daybreak page: Blue is available to Daybreak members and the general model market. Red, where Cyber lives, requires a Daybreak account, identity verification, and from September first, hardware security keys. You won't get an account by paying — you'll get one by proving who you are. The model answers to "approved operators only" — and OpenAI says it verifies those operators' legal rights to attack their targets.

[beat: the HF note — what OpenAI says it was not]

One clarification the announcement bothered to make: OpenAI says GPT-5.6-Cyber was not involved in the Hugging Face incident. That's the rogue-agent breach we broke down in detail. They cleared their own model by name before anyone asked.

---

## HONEST-GAP (~43s, ~123 words)

[beat: the catch — Cyber is worse at writing reports]

Here's the catch I promised. The last number in OpenAI's own report: on vulnerability discovery and report writing, GPT-5.6-Cyber performs worse than plain Sol. Shorter, less detailed reports. The model that's best at breaking into systems is not the best at explaining what it found. In a discipline where the report is the deliverable, that gap matters.

[beat: benchmark nuance — ExploitBench, longer runs]

And the benchmark nuance OpenAI itself prints: on ExploitBench, the harder variant, Sol actually performs best and most token-efficiently at three hundred turns. Cyber only narrows the gap at six hundred turns — ten minutes of agentic work per task. The headline ninety-five percent is real, and it is not the whole table.

---

## CLOSE (~47s, ~134 words)

[beat: the pattern — safest vs strongest]

Step back. The safest model OpenAI sells refuses one point five percent of attacks. The strongest one it owns completes ninety-five. Same family, same company, two weeks apart. The lesson for everyone in this space: capability and caution are now separate products. The question isn't whether a model will say yes. It's who gets the yes.

[beat: verdict recap]

Verdict: GPT-5.6-Cyber is the most consequential security-model release so far — real zero-day work, real numbers, real restrictions. And the honest test of it isn't the ninety-five. It's the report-writing score, and the wall around the door.

[beat: close CTA]

We tracked this one the day it dropped — that's what this channel is for. Subscribe so you don't miss the next release. Drop a comment: would you want a tool this sharp, if you had to prove you deserved it? And if the Hugging Face breach is new to you, the rogue-agents deep dive is linked below. We'll see you in the next one.

---

**Word count:** ~995 | **Estimated runtime:** ~5:49 at 171.4 wpm (within +/-8% of 6:00)
**Phase-1 cap:** ~452 words (~158s) — inside the ~170s "Under 3 Min" limit
**Sources:** OpenAI announcement "Expanding Daybreak as the Cyber Defense Window Narrows" (openai.com, Aug 10), OpenAI model page pricing (developers.openai.com, captured), NVD CVE-2026-15903 (nvd.nist.gov, captured), OpenAI Daybreak page (openai.com, Aug 10). Announcement and Daybreak pages bot-blocked for capture — blank EvidenceFrame + on-screen disclosure used, numbers read directly from source.
**Cross-link:** openai-rogue-agents (Hugging Face breach — OpenAI cleared GPT-5.6-Cyber by name; mention in evidence + close)
