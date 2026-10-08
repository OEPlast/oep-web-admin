'use client';

import { ActionIcon, Button, Text } from 'rizzui';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';

export type SizeChartGridValue = { columns: string[]; rows: string[][] };

interface SizeChartGridProps {
  value: SizeChartGridValue;
  onChange: (value: SizeChartGridValue) => void;
  error?: string;
}

// Main-server allows 1–12 columns and up to 100 rows.
const MAX_COLUMNS = 12;
const MAX_ROWS = 100;

const cellClass =
  'w-full min-w-[96px] rounded-md border border-muted bg-transparent px-2 py-1.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-0';

/**
 * Spreadsheet-style editor for a size chart. Every row always has one cell per column (adding
 * or removing a column changes every row), which is the shape the backend insists on.
 */
export default function SizeChartGrid({ value, onChange, error }: SizeChartGridProps) {
  const { columns, rows } = value;

  const setColumn = (c: number, text: string) =>
    onChange({ columns: columns.map((col, i) => (i === c ? text : col)), rows });
  const setCell = (r: number, c: number, text: string) =>
    onChange({ columns, rows: rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? text : cell)) : row)) });
  const addColumn = () => onChange({ columns: [...columns, ''], rows: rows.map((row) => [...row, '']) });
  const removeColumn = (c: number) =>
    onChange({ columns: columns.filter((_, i) => i !== c), rows: rows.map((row) => row.filter((_, j) => j !== c)) });
  const addRow = () => onChange({ columns, rows: [...rows, columns.map(() => '')] });
  const removeRow = (r: number) => onChange({ columns, rows: rows.filter((_, i) => i !== r) });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-muted">
        <table className="text-sm">
          <thead className="bg-gray-50 dark:bg-gray-100">
            <tr>
              {columns.map((col, c) => (
                <th key={c} className="p-2 align-top font-medium">
                  <div className="flex items-center gap-1">
                    <input
                      className={cn(cellClass, 'font-semibold')}
                      value={col}
                      placeholder={c === 0 ? 'Size' : `Column ${c + 1}`}
                      onChange={(e) => setColumn(c, e.target.value)}
                      aria-label={`Column ${c + 1} heading`}
                    />
                    <ActionIcon
                      size="sm"
                      variant="text"
                      disabled={columns.length <= 1}
                      onClick={() => removeColumn(c)}
                      aria-label={`Remove column ${c + 1}`}
                    >
                      <PiTrashBold className="h-3.5 w-3.5" />
                    </ActionIcon>
                  </div>
                </th>
              ))}
              <th className="w-10 p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-t border-muted">
                {row.map((cell, c) => (
                  <td key={c} className="p-2">
                    <input
                      className={cn(cellClass, c === 0 && 'font-medium')}
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      aria-label={`Row ${r + 1}, ${columns[c] || `column ${c + 1}`}`}
                    />
                  </td>
                ))}
                <td className="p-2">
                  <ActionIcon size="sm" variant="text" onClick={() => removeRow(r)} aria-label={`Remove row ${r + 1}`}>
                    <PiTrashBold className="h-3.5 w-3.5" />
                  </ActionIcon>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="border-t border-muted">
                <td colSpan={columns.length + 1} className="p-4 text-center text-gray-500">
                  No rows yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
          <PiPlusBold className="me-1.5 h-3.5 w-3.5" />
          Add row
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={addColumn} disabled={columns.length >= MAX_COLUMNS}>
          <PiPlusBold className="me-1.5 h-3.5 w-3.5" />
          Add column
        </Button>
      </div>
      <Text className="text-xs text-gray-500">
        The first column is the size customers pick on the product page (e.g. 6, 7, 8 or 16 in).
      </Text>
      {error && <Text className="text-sm text-red-600">{error}</Text>}
    </div>
  );
}
