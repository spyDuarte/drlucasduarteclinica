import type { MedicalRecord } from '../../types';
import { generateId } from '../../utils/helpers';

interface AuditRetentionConfig {
  accessHistoryDays: number;
  maxVersions: number;
}

export function applyAuditRetention(
  record: MedicalRecord,
  retention: AuditRetentionConfig
): MedicalRecord {
  const audit = record.audit;
  if (!audit) return record;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retention.accessHistoryDays);
  const cutoffMs = cutoff.getTime();

  const filteredAccessHistory = (audit.accessHistory || []).filter(entry => {
    const ts = new Date(entry.timestamp).getTime();
    return Number.isFinite(ts) && ts >= cutoffMs;
  });

  const versions = audit.versions || [];
  const trimmedVersions = versions.slice(-retention.maxVersions);

  return {
    ...record,
    audit: {
      ...audit,
      accessHistory: filteredAccessHistory,
      versions: trimmedVersions
    }
  };
}

export function buildNewMedicalRecord(
  recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>,
  now: string
): MedicalRecord {
  return {
    ...recordData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    audit: {
      createdAt: recordData.audit?.createdAt || now,
      createdBy: recordData.audit?.createdBy,
      lastEditedAt: recordData.audit?.lastEditedAt,
      lastEditedBy: recordData.audit?.lastEditedBy,
      accessHistory: recordData.audit?.accessHistory || [],
      versions: recordData.audit?.versions || []
    }
  };
}

export function buildUpdatedMedicalRecord(
  current: MedicalRecord,
  recordData: Partial<MedicalRecord>,
  now: string
): MedicalRecord {
  const { audit: _previousAudit, ...previousSnapshotBase } = current;
  void _previousAudit;

  const previousVersions = current.audit?.versions || [];
  const nextVersion = previousVersions.length + 1;
  const editorName = recordData.audit?.lastEditedBy || 'Usuário do Sistema';

  return {
    ...current,
    ...recordData,
    updatedAt: now,
    audit: {
      createdAt: current.audit?.createdAt || current.createdAt,
      createdBy: current.audit?.createdBy,
      lastEditedBy: recordData.audit?.lastEditedBy || current.audit?.lastEditedBy || editorName,
      lastEditedAt: recordData.audit?.lastEditedAt || now,
      accessHistory: recordData.audit?.accessHistory || current.audit?.accessHistory || [],
      versions: [
        ...previousVersions,
        {
          version: nextVersion,
          timestamp: now,
          editedBy: editorName,
          changes: 'Atualização de prontuário',
          snapshot: previousSnapshotBase
        }
      ]
    }
  };
}

export function buildMedicalRecordAccessEntry(
  current: MedicalRecord,
  action: 'view' | 'edit' | 'print' | 'export',
  userId: string,
  userName: string,
  now: string
): MedicalRecord {
  const history = current.audit?.accessHistory || [];

  return {
    ...current,
    audit: {
      createdAt: current.audit?.createdAt || current.createdAt,
      createdBy: current.audit?.createdBy,
      lastEditedBy: current.audit?.lastEditedBy,
      lastEditedAt: current.audit?.lastEditedAt,
      versions: current.audit?.versions || [],
      accessHistory: [
        ...history,
        {
          userId,
          userName,
          timestamp: now,
          action
        }
      ]
    }
  };
}
