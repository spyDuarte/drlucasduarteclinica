## 2026-01-10 - React Memo and Context Optimization
**Learning:** In a React application heavily reliant on a global Context (`DataContext`) that bundles all application state (patients, appointments, records), any state update triggers a re-render of all context consumers. List components (like `MedicalRecords`) are particularly vulnerable.
**Action:** Always wrap heavy list items (like `MedicalRecordCard`) in `React.memo`. Avoid performing expensive operations (like sorting or filtering) in the consumer if the data from the context is already processed (e.g., pre-sorted in the selector).

## 2026-05-24 - Optimizing Heavy Components with Memoization
**Learning:** In `MedicalRecordModal`, frequent re-renders (due to typing in forms) caused performance issues because child components like `PatientHeader` and `PatientTimeline` were re-sorting/processing large arrays on every render.
**Action:** Use `React.memo` for heavy components and `useMemo` for their props (like filtered/sorted lists) to ensure reference stability. Avoid redundant operations like sorting inside render if data is already sorted.
