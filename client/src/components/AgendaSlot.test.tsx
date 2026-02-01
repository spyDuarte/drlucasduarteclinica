import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AgendaSlot } from './AgendaSlot';
import type { Appointment, Patient } from '../types';

describe('AgendaSlot', () => {
  const mockOnOpenModal = vi.fn();
  const mockOnOpenMedicalRecord = vi.fn();
  const mockOnStatusChange = vi.fn();

  const mockTime = '09:00';

  const mockPatient: Patient = {
    id: 'p1',
    nome: 'John Doe',
    cpf: '123.456.789-00',
    dataNascimento: '1990-01-01',
    sexo: 'M',
    telefone: '123456789',
    endereco: {
      logradouro: 'Rua A',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '00000-000'
    },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  const mockAppointment: Appointment = {
    id: 'a1',
    patientId: 'p1',
    data: '2023-10-10',
    horaInicio: '09:00',
    horaFim: '09:30',
    tipo: 'primeira_consulta',
    status: 'agendada',
    motivo: 'Checkup',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-01'
  };

  it('renders empty slot correctly', () => {
    render(
      <AgendaSlot
        time={mockTime}
        onOpenModal={mockOnOpenModal}
        onOpenMedicalRecord={mockOnOpenMedicalRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Agendar')).toBeInTheDocument();
  });

  it('renders occupied slot correctly', () => {
    render(
      <AgendaSlot
        time={mockTime}
        appointment={mockAppointment}
        patient={mockPatient}
        onOpenModal={mockOnOpenModal}
        onOpenMedicalRecord={mockOnOpenMedicalRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Primeira consulta')).toBeInTheDocument();
    expect(screen.getByText(/Checkup/)).toBeInTheDocument();
  });

  it('calls onOpenModal with time when empty slot is clicked', () => {
    render(
      <AgendaSlot
        time={mockTime}
        onOpenModal={mockOnOpenModal}
        onOpenMedicalRecord={mockOnOpenMedicalRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Agendar/i }));
    expect(mockOnOpenModal).toHaveBeenCalledWith(undefined, '09:00');
  });

  it('calls onOpenModal with appointment when occupied slot is clicked', () => {
    render(
      <AgendaSlot
        time={mockTime}
        appointment={mockAppointment}
        patient={mockPatient}
        onOpenModal={mockOnOpenModal}
        onOpenMedicalRecord={mockOnOpenMedicalRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    // The main container is clickable, but we can target the text or a container
    fireEvent.click(screen.getByText('John Doe'));
    expect(mockOnOpenModal).toHaveBeenCalledWith(mockAppointment);
  });

  it('calls onStatusChange when status is changed', () => {
    render(
      <AgendaSlot
        time={mockTime}
        appointment={mockAppointment}
        patient={mockPatient}
        onOpenModal={mockOnOpenModal}
        onOpenMedicalRecord={mockOnOpenMedicalRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'confirmada' } });
    expect(mockOnStatusChange).toHaveBeenCalledWith('a1', 'confirmada');
  });
});
