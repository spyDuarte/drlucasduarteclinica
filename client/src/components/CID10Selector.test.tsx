import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CID10Selector } from './CID10Selector';

describe('CID10Selector', () => {
  it('renders correctly', () => {
    render(
      <CID10Selector
        selectedCodes={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('CID-10')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por código ou descrição...')).toBeInTheDocument();
  });

  it('searches and selects a code', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <CID10Selector
        selectedCodes={[]}
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por código ou descrição...');
    // Search by specific code (J45.9 = Asma não especificada)
    await user.type(input, 'J45.9');

    await waitFor(() => {
      expect(screen.getByText('J45.9')).toBeInTheDocument();
    });

    // Click on the dropdown result button
    const resultButton = screen.getByRole('button', { name: /J45\.9/i });
    await user.click(resultButton);

    expect(handleChange).toHaveBeenCalledWith(['J45.9']);
  });

  it('removes a selected code', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <CID10Selector
        selectedCodes={['J45.9']}
        onChange={handleChange}
      />
    );

    // The code is displayed in a bold span
    const codeElement = screen.getByText('J45.9');
    expect(codeElement).toBeInTheDocument();

    // Find the remove button (X icon) - it's within the parent span that has the code
    const parentBadge = codeElement.parentElement;
    const removeButton = parentBadge?.querySelector('button');
    expect(removeButton).toBeTruthy();
    await user.click(removeButton!);

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('displays error message', () => {
    render(
      <CID10Selector
        selectedCodes={[]}
        onChange={() => {}}
        error="Campo obrigatório"
      />
    );
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('adds a custom code not in the list', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <CID10Selector
        selectedCodes={[]}
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por código ou descrição...');
    await user.type(input, 'XYZ123');

    await waitFor(() => {
      expect(screen.getByText('Adicionar "XYZ123"')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Adicionar "XYZ123"'));

    expect(handleChange).toHaveBeenCalledWith(['XYZ123']);
  });

  it('adds code on Enter key', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <CID10Selector
        selectedCodes={[]}
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por código ou descrição...');
    await user.type(input, 'ABC000{Enter}');

    expect(handleChange).toHaveBeenCalledWith(['ABC000']);
  });
});
