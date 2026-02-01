## 2026-01-10 - React Memo and Context Optimization
**Learning:** In a React application heavily reliant on a global Context (`DataContext`) that bundles all application state (patients, appointments, records), any state update triggers a re-render of all context consumers. List components (like `MedicalRecords`) are particularly vulnerable.
**Action:** Always wrap heavy list items (like `MedicalRecordCard`) in `React.memo`. Avoid performing expensive operations (like sorting or filtering) in the consumer if the data from the context is already processed (e.g., pre-sorted in the selector).

## 2026-02-14 - Inline Rendering Bottlenecks
**Learning:** Inline rendering of complex list items (like agenda slots) prevents individual item memoization, causing the entire list to re-render on any parent state change (e.g., opening a modal).
**Action:** Extract repeated list items into standalone, memoized components (e.g., `AgendaSlot`) and ensure callback props are stabilized with `useCallback`.
