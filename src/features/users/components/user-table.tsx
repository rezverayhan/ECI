import { ChevronRight, ArrowDown, ArrowUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserAvatar } from '@/components/shared/user-avatar'
import { UserStatusBadge } from './status-badge'
import type { SearchedUser, SortColumn, SortDirection } from '../types'

interface UserTableProps {
  users: SearchedUser[]
  sortBy: SortColumn
  sortDir: SortDirection
  onSortChange: (column: SortColumn) => void
}

function SortableHead({
  column,
  label,
  sortBy,
  sortDir,
  onSortChange,
}: {
  column: SortColumn
  label: string
  sortBy: SortColumn
  sortDir: SortDirection
  onSortChange: (column: SortColumn) => void
}) {
  const isActive = sortBy === column
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSortChange(column)}
        className="flex items-center gap-1 text-xs font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {label}
        {isActive ? (
          sortDir === 'asc' ? (
            <ArrowUp className="size-3" aria-hidden />
          ) : (
            <ArrowDown className="size-3" aria-hidden />
          )
        ) : null}
      </button>
    </TableHead>
  )
}

export function UserTable({ users, sortBy, sortDir, onSortChange }: UserTableProps) {
  const navigate = useNavigate()

  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>User</TableHead>
            <SortableHead
              column="employee_id"
              label="Employee ID"
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={onSortChange}
            />
            <TableHead>User ID</TableHead>
            <TableHead>Designation</TableHead>
            <SortableHead
              column="department"
              label="Department"
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={onSortChange}
            />
            <TableHead>Manager</TableHead>
            <SortableHead
              column="status"
              label="Status"
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={onSortChange}
            />
            <TableHead>Contact</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              tabIndex={0}
              role="link"
              aria-label={`Open ${user.full_name}`}
              className="cursor-pointer outline-none focus-visible:bg-canvas focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => navigate(`/app/users/${user.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/app/users/${user.id}`)
              }}
            >
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <UserAvatar fullName={user.full_name} size="sm" />
                  <span className="font-medium text-text">{user.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary">{user.employee_id}</TableCell>
              <TableCell className="text-text-secondary">{user.user_id}</TableCell>
              <TableCell className="text-text-secondary">
                {user.designation_name ?? '—'}
              </TableCell>
              <TableCell className="text-text-secondary">{user.department_name ?? '—'}</TableCell>
              <TableCell className="text-text-secondary">{user.manager_name ?? '—'}</TableCell>
              <TableCell>
                <UserStatusBadge status={user.employment_status} />
              </TableCell>
              <TableCell className="text-text-secondary">{user.official_email}</TableCell>
              <TableCell>
                <ChevronRight className="size-4 text-text-muted" aria-hidden />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
