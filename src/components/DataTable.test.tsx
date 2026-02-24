import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable, { type DataTableColumn } from './DataTable';

interface Row {
  id: number;
  name: string;
  status: string;
}

const columns: DataTableColumn<Row>[] = [
  { label: 'ID', key: 'id', sortable: true },
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Status', key: 'status' },
];

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'stopped',
  }));

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders rows', () => {
    const data = makeRows(3);
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows default empty message', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('paginates data and shows pagination controls', () => {
    const data = makeRows(15);
    render(<DataTable columns={columns} data={data} pageSize={5} />);
    // First page: items 1-5
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('navigates to next page', async () => {
    const user = userEvent.setup();
    const data = makeRows(12);
    render(<DataTable columns={columns} data={data} pageSize={5} />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Item 6')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('navigates to previous page', async () => {
    const user = userEvent.setup();
    const data = makeRows(12);
    render(<DataTable columns={columns} data={data} pageSize={5} />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('does not show pagination for single page', () => {
    const data = makeRows(5);
    render(<DataTable columns={columns} data={data} pageSize={10} />);
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
  });

  it('calls onSort when sortable column header is clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={makeRows(3)} onSort={onSort} />);

    await user.click(screen.getByText('ID'));
    expect(onSort).toHaveBeenCalledWith({ key: 'id', direction: 'asc' });
  });

  it('toggles sort direction on second click', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={makeRows(3)} onSort={onSort} />);

    await user.click(screen.getByText('ID'));
    await user.click(screen.getByText('ID'));
    expect(onSort).toHaveBeenLastCalledWith({ key: 'id', direction: 'desc' });
  });

  it('renders custom cell via render prop', () => {
    const customColumns: DataTableColumn<Row>[] = [
      {
        label: 'Name',
        key: 'name',
        render: (value) => <strong>{String(value)}-custom</strong>,
      },
    ];
    render(<DataTable columns={customColumns} data={makeRows(1)} />);
    expect(screen.getByText('Item 1-custom')).toBeInTheDocument();
  });

  it('calls onPageChange when page changes', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={makeRows(15)}
        pageSize={5}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
