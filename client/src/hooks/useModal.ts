import { useState, useCallback } from 'react';

interface UseModalReturn<T = undefined> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook para gerenciar estado de modal/dialog
 *
 * @param initialOpen - Estado inicial (aberto/fechado)
 *
 * @example
 * // Modal simples
 * const modal = useModal();
 *
 * <button onClick={() => modal.open()}>Abrir</button>
 * {modal.isOpen && <Modal onClose={modal.close} />}
 *
 * @example
 * // Modal com dados
 * const editModal = useModal<Patient>();
 *
 * <button onClick={() => editModal.open(patient)}>Editar</button>
 * {editModal.isOpen && (
 *   <EditModal
 *     patient={editModal.data}
 *     onClose={editModal.close}
 *   />
 * )}
 */
export function useModal<T = undefined>(initialOpen = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    setData(modalData ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Limpa dados após fechar (com delay para animação)
    setTimeout(() => setData(null), 200);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { isOpen, data, open, close, toggle };
}

interface UseConfirmReturn {
  isOpen: boolean;
  message: string;
  title: string;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

interface ConfirmOptions {
  title?: string;
  message: string;
}

/**
 * Hook para gerenciar diálogos de confirmação
 *
 * @example
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm.confirm({
 *     title: 'Confirmar exclusão',
 *     message: 'Deseja realmente excluir este item?'
 *   });
 *
 *   if (confirmed) {
 *     deleteItem();
 *   }
 * };
 *
 * // No JSX
 * {confirm.isOpen && (
 *   <ConfirmDialog
 *     title={confirm.title}
 *     message={confirm.message}
 *     onConfirm={confirm.handleConfirm}
 *     onCancel={confirm.handleCancel}
 *   />
 * )}
 */
export function useConfirm(): UseConfirmReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setTitle(options.title || 'Confirmação');
    setMessage(options.message);
    setIsOpen(true);

    return new Promise<boolean>(resolve => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  }, [resolveRef]);

  return {
    isOpen,
    message,
    title,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

interface UseMultipleModalsReturn {
  isOpen: (key: string) => boolean;
  open: (key: string, data?: unknown) => void;
  close: (key: string) => void;
  closeAll: () => void;
  getData: <T>(key: string) => T | null;
}

/**
 * Hook para gerenciar múltiplos modais
 *
 * @example
 * const modals = useMultipleModals();
 *
 * <button onClick={() => modals.open('create')}>Criar</button>
 * <button onClick={() => modals.open('edit', patient)}>Editar</button>
 *
 * {modals.isOpen('create') && <CreateModal onClose={() => modals.close('create')} />}
 * {modals.isOpen('edit') && (
 *   <EditModal
 *     patient={modals.getData<Patient>('edit')}
 *     onClose={() => modals.close('edit')}
 *   />
 * )}
 */
export function useMultipleModals(): UseMultipleModalsReturn {
  const [openModals, setOpenModals] = useState<Map<string, unknown>>(new Map());

  const isOpen = useCallback((key: string) => openModals.has(key), [openModals]);

  const open = useCallback((key: string, data?: unknown) => {
    setOpenModals(prev => new Map(prev).set(key, data ?? null));
  }, []);

  const close = useCallback((key: string) => {
    setOpenModals(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals(new Map());
  }, []);

  const getData = useCallback(
    <T>(key: string): T | null => {
      return (openModals.get(key) as T) ?? null;
    },
    [openModals]
  );

  return { isOpen, open, close, closeAll, getData };
}
