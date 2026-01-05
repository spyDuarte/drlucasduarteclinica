import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MedicationSelector } from './MedicationSelector';

describe('MedicationSelector', () => {
  it('renders correctly', () => {
    render(
      <MedicationSelector
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('Buscar medicamento...')).toBeInTheDocument();
  });

  it('searches and selects a medication', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MedicationSelector
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar medicamento...');
    // Search for "Aas" which is in the CSV
    await user.type(input, 'Aas');

    // Wait for dropdown
    await waitFor(() => {
        // "Aas" or "Aas Protect" should be visible
        // Using getAllByText because CSV might contain duplicates
        expect(screen.getAllByText('Aas Protect').length).toBeGreaterThan(0);
    });

    // Click on the result (first one)
    const resultButtons = screen.getAllByText('Aas Protect');
    await user.click(resultButtons[0]);

    expect(handleChange).toHaveBeenCalledWith('Aas Protect');
  });

  it('allows adding a custom medication', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MedicationSelector
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar medicamento...');
    const customMed = 'MedicamentoTeste123';
    await user.type(input, customMed);

    // Wait for "Add new" option
    await waitFor(() => {
        // The text is split across nodes: Adicionar " and " como novo
        // So strict match might fail if we don't look carefully.
        // But the button text content usually aggregates.
        // Let's use a regex or partial match.
        // screen.getByText((content, element) => content.includes('Adicionar "MedicamentoTeste123"'))
        const btn = screen.getByRole('button', { name: /Adicionar "MedicamentoTeste123" como novo/i });
        expect(btn).toBeInTheDocument();
    });

    const btn = screen.getByRole('button', { name: /Adicionar "MedicamentoTeste123" como novo/i });
    await user.click(btn);

    expect(handleChange).toHaveBeenLastCalledWith(customMed);
  });
});
