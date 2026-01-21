import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AgendaSlot from './AgendaSlot';
import type { Appointment, Patient } from '../types';

const mockPatient: Patient = {
  id: 'p1',
  nome: 'John Doe',
  cpf: '123.456.789-00',
  dataNascimento: '1990-01-01',
  sexo: 'M',
  telefone: '(11) 99999-9999',
  endereco: {
    logradouro: 'Rua A',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '00000-000'
  },
  createdAt: '',
  updatedAt: ''
};

const mockAppointment: Appointment = {
  id: 'a1',
  patientId: 'p1',
  data: '2025-01-01',
  horaInicio: '09:00',
  horaFim: '09:30',
  tipo: 'primeira_consulta',
  status: 'agendada',
  createdAt: '',
  updatedAt: ''
};

describe('AgendaSlot', () => {
  it('renders empty slot correctly', async () => {
    const user = userEvent.setup();
    const onOpenModal = vi.fn();
    render(
      <AgendaSlot
        time="09:00"
        onOpenModal={onOpenModal}
        onStatusChange={() => {}}
        onOpenMedicalRecord={() => {}}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Agendar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /agendar/i }));
    expect(onOpenModal).toHaveBeenCalledWith(undefined, '09:00');
  });

  it('renders filled slot correctly', () => {
    render(
      <AgendaSlot
        time="09:00"
        appointment={mockAppointment}
        patient={mockPatient}
        onOpenModal={() => {}}
        onStatusChange={() => {}}
        onOpenMedicalRecord={() => {}}
      />
    );

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Primeira consulta')).toBeInTheDocument();
  });

  it('calls onOpenModal when clicking on appointment', async () => {
    const user = userEvent.setup();
    const onOpenModal = vi.fn();
    render(
      <AgendaSlot
        time="09:00"
        appointment={mockAppointment}
        patient={mockPatient}
        onOpenModal={onOpenModal}
        onStatusChange={() => {}}
        onOpenMedicalRecord={() => {}}
      />
    );

    // The appointment content is clickable
    await user.click(screen.getByText('John Doe'));
    expect(onOpenModal).toHaveBeenCalledWith(mockAppointment);
  });

  it('calls onStatusChange when changing status', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(
      <AgendaSlot
        time="09:00"
        appointment={mockAppointment}
        patient={mockPatient}
        onOpenModal={() => {}}
        onStatusChange={onStatusChange}
        onOpenMedicalRecord={() => {}}
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'confirmada');

    expect(onStatusChange).toHaveBeenCalledWith('a1', 'confirmada');
  });
});
