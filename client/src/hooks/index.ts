// Hooks de formulário e validação
export { useFormValidation, validators } from './useFormValidation';
export type { ValidationRule, ValidationErrors } from './useFormValidation';

// Hooks de debounce
export { useDebounce, useDebouncedCallback } from './useDebounce';

// Hooks de paginação
export { usePagination } from './usePagination';

// Hooks de localStorage
export { useLocalStorage, useLocalStorageExists } from './useLocalStorage';

// Hooks de clipboard
export { useClipboard, useClipboardRead } from './useClipboard';

// Hooks de teclado
export { useKeyPress, useKeyPressMultiple } from './useKeyPress';

// Hooks de operações assíncronas
export { useAsync, useLoading, useMultipleLoading } from './useAsync';

// Hooks de modal
export { useModal, useConfirm, useMultipleModals } from './useModal';
