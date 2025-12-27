import { useState, useCallback } from 'react';

export type ValidationRule<T> = {
  field: keyof T;
  validate: (value: unknown, formData?: T) => string | null;
  message?: string;
};

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormValidationOptions<T> {
  rules: ValidationRule<T>[];
  onValidate?: (errors: ValidationErrors<T>) => void;
}

/**
 * Hook customizado para validação de formulários
 *
 * @example
 * const { errors, validateField, validateForm, clearErrors } = useFormValidation({
 *   rules: [
 *     {
 *       field: 'email',
 *       validate: (value) => {
 *         if (!value) return 'Email é obrigatório';
 *         if (!/\S+@\S+\.\S+/.test(value as string)) return 'Email inválido';
 *         return null;
 *       }
 *     }
 *   ]
 * });
 */
export function useFormValidation<T extends Record<string, unknown>>({
  rules,
  onValidate,
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  /**
   * Valida um campo específico
   */
  const validateField = useCallback(
    (field: keyof T, value: unknown, formData?: T): string | null => {
      const fieldRules = rules.filter((rule) => rule.field === field);

      for (const rule of fieldRules) {
        const error = rule.validate(value, formData);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
          return error;
        }
      }

      // Remove erro se passou na validação
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      return null;
    },
    [rules]
  );

  /**
   * Valida todos os campos do formulário
   */
  const validateForm = useCallback(
    (formData: T): boolean => {
      const newErrors: ValidationErrors<T> = {};

      rules.forEach((rule) => {
        const value = formData[rule.field];
        const error = rule.validate(value, formData);
        if (error) {
          newErrors[rule.field] = error;
        }
      });

      setErrors(newErrors);
      onValidate?.(newErrors);

      return Object.keys(newErrors).length === 0;
    },
    [rules, onValidate]
  );

  /**
   * Limpa todos os erros de validação
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Limpa erro de um campo específico
   */
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Define erro manualmente para um campo
   */
  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  /**
   * Verifica se o formulário tem erros
   */
  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
    hasErrors,
  };
}

// Funções auxiliares de validação comuns
export const validators = {
  required: (fieldName: string) => (value: unknown) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },

  email: (value: unknown) => {
    if (value && typeof value === 'string' && !/\S+@\S+\.\S+/.test(value)) {
      return 'Email inválido';
    }
    return null;
  },

  minLength: (min: number, fieldName: string) => (value: unknown) => {
    if (value && typeof value === 'string' && value.length < min) {
      return `${fieldName} deve ter no mínimo ${min} caracteres`;
    }
    return null;
  },

  maxLength: (max: number, fieldName: string) => (value: unknown) => {
    if (value && typeof value === 'string' && value.length > max) {
      return `${fieldName} deve ter no máximo ${max} caracteres`;
    }
    return null;
  },

  pattern: (regex: RegExp, message: string) => (value: unknown) => {
    if (value && typeof value === 'string' && !regex.test(value)) {
      return message;
    }
    return null;
  },

  number: (fieldName: string) => (value: unknown) => {
    if (value && isNaN(Number(value))) {
      return `${fieldName} deve ser um número válido`;
    }
    return null;
  },

  min: (min: number, fieldName: string) => (value: unknown) => {
    if (value && Number(value) < min) {
      return `${fieldName} deve ser no mínimo ${min}`;
    }
    return null;
  },

  max: (max: number, fieldName: string) => (value: unknown) => {
    if (value && Number(value) > max) {
      return `${fieldName} deve ser no máximo ${max}`;
    }
    return null;
  },
};
