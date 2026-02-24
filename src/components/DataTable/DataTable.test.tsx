import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from './DataTable';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
}

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
];

const data: Row[] = [
  { id: '1', name: 'Alpha', status: 'running' },
  { id: '2', name: 'Beta', status: 'idle' },
  { id: '3', name: 'Gamma', status: 'failed' },
];

describe('DataTable', () => {
  it('renders rows and headers', () => {
    render(
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} pageSize={0} />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('shows "No data available" when empty', () => {
    render(
      <DataTable columns={columns} data={[]} rowKey={(r: Row) => r.id} />,
    );
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('has accessible table role and caption', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        caption="Workflow list"
      />,
    );
    expect(screen.getByRole('table', { name: 'Workflow list' })).toBeInTheDocument();
  });

  it('sorts by column when clicking sortable header', async () => {
    const user = userEvent.setup();
    render(
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} pageSize={0} />,
    );

    const sortBtn = screen.getByRole('button', { name: 'Sort by Name' });
    await user.click(sortBtn);

    const rows = screen.getAllByRole('row');
    // Header row + 3 data rows
    expect(rows).toHaveLength(4);
    // First data row after ascending sort should be Alpha
    expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument();

    // Click again to reverse
    await user.click(sortBtn);
    const rows2 = screen.getAllByRole('row');
    expect(within(rows2[1]).getByText('Gamma')).toBeInTheDocument();
  });

  it('sets aria-sort on sorted column', async () => {
    const user = userEvent.setup();
    render(
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} pageSize={0} />,
    );

    const sortBtn = screen.getByRole('button', { name: 'Sort by Name' });
    await user.click(sortBtn);

    const th = sortBtn.closest('th');
    expect(th).toHaveAttribute('aria-sort', 'ascending');
  });

  it('paginates data', async () => {
    const user = userEvent.setup();
    render(
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} pageSize={2} />,
    );

    // Page 1: 2 rows
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('has accessible pagination controls', () => {
    render(
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} pageSize={2} />,
    );
    expect(screen.getByRole('navigation', { name: 'Table pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('supports custom cell renderer', () => {
    const cols = [
      {
        key: 'name',
        header: 'Name',
        render: (val: unknown) => <strong>{String(val)}</strong>,
      },
    ];
    render(
      <DataTable columns={cols} data={data} rowKey={(r) => r.id} pageSize={0} />,
    );
    expect(screen.getByText('Alpha').tagName).toBe('STRONG');
  });
});
