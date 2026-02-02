## 2026-01-10 - React Memo and Context Optimization
**Learning:** In a React application heavily reliant on a global Context (`DataContext`) that bundles all application state (patients, appointments, records), any state update triggers a re-render of all context consumers. List components (like `MedicalRecords`) are particularly vulnerable.
**Action:** Always wrap heavy list items (like `MedicalRecordCard`) in `React.memo`. Avoid performing expensive operations (like sorting or filtering) in the consumer if the data from the context is already processed (e.g., pre-sorted in the selector).

## 2026-01-10 - Context Derivation Bottlenecks
**Learning:** In `DataContext`, derived state like `dashboardStats` runs on every context update. Using `new Date()` inside `filter` loops for large datasets creates significant blocking time (e.g., ~275ms for 50k items).
**Action:** For derived stats in Context, prioritize single-pass loops and primitive comparisons (strings/numbers) over object instantiation. Pre-calculate reference dates as strings outside the loop.
