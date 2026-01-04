import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CID10Selector } from './CID10Selector';
import React from 'react';

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
    await user.type(input, 'Asma');

    await waitFor(() => {
      expect(screen.getByText('J45')).toBeInTheDocument();
      expect(screen.getByText('Asma')).toBeInTheDocument();
    });

    await user.click(screen.getByText('J45'));

    expect(handleChange).toHaveBeenCalledWith(['J45']);
  });

  it('removes a selected code', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <CID10Selector
        selectedCodes={['J45']}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('J45')).toBeInTheDocument();

    // Find the remove button (X icon)
    // Since there might be other buttons (if results were shown), we should be specific.
    // But here only the chip button exists initially.
    const removeButton = screen.getByRole('button');
    await user.click(removeButton);

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
});
