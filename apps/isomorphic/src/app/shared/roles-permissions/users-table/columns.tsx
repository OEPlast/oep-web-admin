'use client';

import AvatarCard from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Checkbox, Flex } from 'rizzui';
import { UsersTableDataType } from '.';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import IdLink from '@/app/shared/id-link';

const columnHelper = createColumnHelper<UsersTableDataType>();

export const usersColumns = [
  columnHelper.display({
    id: 'select',
    size: 50,
    header: ({ table }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select all Rows"
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select Row"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.display({
    id: 'id',
    size: 100,
    header: 'User ID',
    cell: ({ row }) => (
      <IdLink href={`/roles-permissions/${row.original._id}`}>
        #{row.original.id}
      </IdLink>
    ),
  }),
  columnHelper.accessor('fullName', {
    id: 'fullName',
    size: 300,
    header: 'Name',
    enableSorting: false,
    cell: ({ row }) => (
      <AvatarCard
        src={row.original.avatar}
        name={row.original.fullName}
        description={row.original.email}
      />
    ),
  }),
  columnHelper.accessor('role', {
    id: 'role',
    size: 150,
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant="flat"
          color={
            role === 'owner'
              ? 'primary'
              : role === 'employee'
                ? 'secondary'
                : 'warning'
          }
          className="capitalize"
        >
          {role}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('permissionCount', {
    id: 'permissionCount',
    size: 150,
    header: 'Permissions',
    cell: ({ row }) => {
      const count = row.original.permissionCount || 0;
      return (
        <Badge variant="outline" color="info">
          {count} {count === 1 ? 'permission' : 'permissions'}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 200,
    header: 'Created',
    cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
  }),
  columnHelper.display({
    id: 'action',
    size: 140,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <TableRowActionGroup
        viewUrl={`/roles-permissions/${row.original._id}`}
        editUrl={`/roles-permissions/${row.original._id}`}
        deletePopoverTitle={`Delete this user`}
        deletePopoverDescription={`Are you sure you want to delete ${row.original.fullName}?`}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];
