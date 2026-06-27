# Data Protection Contract Checklist

Reference for hot seat interrogation. Maps mandatory and best-practice provisions against Article 28 UK GDPR and ICO guidance.

---

## Mandatory Article 28(3) Processor Terms

These must appear in every controller-processor DPA. If absent, flag as a red flag.

| Term | Article | Notes |
|------|---------|-------|
| Process only on documented instructions | Art 28(3)(a) | Must include instruction to transfer data internationally if applicable |
| Confidentiality obligation on personnel | Art 28(3)(b) | Statutory or contractual confidentiality |
| Appropriate technical and organisational measures | Art 28(3)(c) + Art 32 | Must reference Art 32 standard |
| Sub-processor restrictions and flow-down | Art 28(3)(d) | Prior specific or general written authorisation; controller must be able to object |
| Assistance with data subject rights | Art 28(3)(e) | Positive obligation to assist |
| Assistance with security, breach, DPIA, prior consultation | Art 28(3)(f) | Must specify timescales for breach notification to controller |
| Deletion or return on termination | Art 28(3)(g) | Controller choice; deletion certificate best practice |
| Audit and inspection rights | Art 28(3)(h) | Processor can substitute third-party audit; must be adequate |

---

## Transfer Mechanism Checklist (UK Post-Brexit)

| Destination | Mechanism Options |
|-------------|------------------|
| EEA (most countries) | UK adequacy regulations (EU adequacy ≠ UK adequacy post-Brexit) |
| EEA to UK | EU adequacy decision for UK (check current status) |
| US | Data Bridge (UK-US) — check scope limitations; not universal |
| Other third countries | IDTA (International Data Transfer Agreement) or UK Addendum to EU SCCs |
| Intra-group | Binding Corporate Rules (BCR) — less common in contracts |

**TRA Requirement**: A Transfer Risk Assessment is required under UK GDPR where using the IDTA or Addendum. Check whether one has been conducted and whether it is reflected in the contract.

---

## Special Category Data — DPA 2018 Schedule 1 Conditions (Key)

When special category data is processed, one of the following Schedule 1 conditions must apply (in addition to Art 9(2) GDPR):

- Para 1 — Employment, social security, social protection
- Para 6 — Statutory and government purposes
- Para 8 — Equality of opportunity and treatment monitoring
- Para 18 — Safeguarding
- Paras 22–26 — Insurance, occupational pensions, political parties, elected representatives

For criminal conviction data (s.10 DPA 2018): requires Schedule 1 Part 3 condition or authorisation by law.

---

## ICO Mandatory DPIA List (Art 35 + ICO Guidance)

DPIA required where processing is "likely to result in high risk." ICO has published a list of operations requiring a DPIA including:

- Systematic and extensive profiling with significant effects
- Large-scale processing of special category data
- Systematic monitoring of publicly accessible areas
- New technologies assessed as high risk
- Automated decision-making with legal or similarly significant effects
- Combining datasets in ways individuals would not expect

**Contractual hook**: The DPA should require the processor to co-operate with and contribute to DPIAs (Art 28(3)(f)).

---

## Breach Notification Timescales

| Obligation | Timescale | Source |
|-----------|-----------|--------|
| Controller → ICO | 72 hours of becoming aware | Art 33 UK GDPR |
| Controller → Data Subjects (high risk) | Without undue delay | Art 34 UK GDPR |
| Processor → Controller | **Must be agreed in contract — no statutory minimum** | Art 33(2) UK GDPR |

**Hot seat tip**: The processor's notification obligation to the controller must be fast enough to allow the controller to meet its 72-hour deadline. 48 hours is common best practice. Watch for processor contracts that give themselves 72 hours (mirroring the controller's ICO deadline) — that leaves the controller no time.

---

## Controller/Processor vs Joint Controller Analysis

| Indicator | Points to Controller | Points to Processor |
|-----------|---------------------|---------------------|
| Determines purpose of processing | ✓ | |
| Determines means of processing | ✓ (essential means) | ✓ (non-essential means only) |
| Processes only on instruction | | ✓ |
| Has direct relationship with data subjects | Often ✓ | Rare |
| Acts on own behalf | ✓ | |

**Joint controller triggers (Art 26)**: Two or more parties jointly determine purpose and means. Must have an arrangement in place. Data subjects can exercise rights against either. Often missed in: platforms sharing data with advertisers; group company arrangements; co-branding; API integrations.

---

## Negotiation Leverage Points (Partner Perspective)

**Non-negotiables (controller-side)**:
1. Sub-processor restriction with right to object
2. Breach notification to controller within 24–48 hours
3. Audit rights (not just third-party substitute)
4. Deletion/return obligation with certificate
5. Assistance with DSRs and DPIAs

**Common processor pushback and responses**:
- "Our sub-processor list is confidential" → General authorisation model is acceptable but controller must receive notice of changes with right to object (Art 28(2))
- "Audit is too burdensome" → Accept third-party audit substitute but insist on right to step in if processor refuses or audit reveals concerns
- "72-hour breach notification is our standard" → Unacceptable where it mirrors ICO deadline; push for 24–48 hours
