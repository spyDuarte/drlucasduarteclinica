import { type ElementType, type ReactNode } from 'react';

// Common interfaces for sections
import type { MedicalRecordFormData, ExpandedSections } from '../types';
import type { FormErrors } from '../useMedicalRecordForm';

export interface SectionProps {
  formData: MedicalRecordFormData;
  updateField: <K extends keyof MedicalRecordFormData>(field: K, value: MedicalRecordFormData[K]) => void;
  expandedSections?: ExpandedSections;
  toggleSection?: (section: keyof ExpandedSections) => void;
  formErrors?: FormErrors;
}

export interface SectionWithToggleProps extends SectionProps {
  expandedSections: ExpandedSections;
  toggleSection: (section: keyof ExpandedSections) => void;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: ElementType;
}

export interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}
