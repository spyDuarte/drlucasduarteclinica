import { render, screen } from '@testing-library/react';
import { RecentAppointments } from './RecentAppointments';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import type { Appointment, Patient } from '../../types';

const mockPatients: Patient[] = [
  {
    id: 'p1',
    nome: 'John Doe',
    cpf: '12345678900',
    telefone: '123456789',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    email: 'john@example.com',
    dataNascimento: '1980-01-01',
    sexo: 'M',
    endereco: {
        logradouro: 'Rua A',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '00000-000'
    }
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    data: '2023-01-01',
    horaInicio: '10:00',
    horaFim: '10:30',
    motivo: 'Checkup',
    status: 'agendada',
    tipo: 'primeira_consulta',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    observacoes: ''
  }
];

describe('RecentAppointments', () => {
  it('renders appointments correctly', () => {
    render(
      <BrowserRouter>
        <RecentAppointments appointments={mockAppointments} patients={mockPatients} />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('Checkup')).toBeInTheDocument();
  });

  it('renders empty state when no appointments', () => {
    render(
      <BrowserRouter>
        <RecentAppointments appointments={[]} patients={mockPatients} />
      </BrowserRouter>
    );

    expect(screen.getByText('Nenhuma consulta agendada para hoje.')).toBeInTheDocument();
  });
});
