---
type: project
created: 2026-07-18
updated: 2026-07-18
---

# Technical Decisions

- Component metadata uses SemVer while the toolkit release keeps CalVer.
- `manifest.json` and `manifest.lock.json` must remain synchronized with component frontmatter.
- Quantum Solver: Always use `qiskit.primitives.StatevectorSampler` (V2 Primitives) with `QAOA` for Qiskit 1.4+ and `qiskit-algorithms 0.4+` (`QuantumInstance` is removed).
- Optimization Schema: Support dual contracts (`weights: Dict[str, float]` for quick chart lookups and `allocations: List[AssetAllocation]` for detailed tabular breakdowns).
