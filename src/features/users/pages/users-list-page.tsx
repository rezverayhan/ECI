import { Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { useUsersSearch } from '../hooks/users-queries'
import { PaginationBar } from '../components/pagination-bar'
import { UserFilterBar } from '../components/user-filter-bar'
import { UserListMobile } from '../components/user-list-mobile'
import { UserSearchInput } from '../components/user-search-input'
import { UserTable } from '../components/user-table'
import type { SortColumn, SortDirection, UserRow, UserSearchParams } from '../types'

const PAGE_SIZE = 25

function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params: UserSearchParams = useMemo(
    () => ({
      query: searchParams.get('q') ?? '',
      departmentId: searchParams.get('dept'),
      designationId: searchParams.get('desig'),
      employmentStatus: (searchParams.get('status') as UserRow['employment_status']) || null,
      managerId: searchParams.get('manager'),
      page: Number(searchParams.get('page') ?? '1') || 1,
      pageSize: PAGE_SIZE,
      sortBy: (searchParams.get('sort') as SortColumn) || 'full_name',
      sortDir: (searchParams.get('dir') as SortDirection) || 'asc',
    }),
    [searchParams],
  )

  const update = useCallback(
    (patch: Partial<Record<'q' | 'dept' | 'desig' | 'status' | 'manager' | 'page' | 'sort' | 'dir', string | null>>, resetPage = true) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
        if (resetPage) next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  return { params, update }
}

export function UsersListPage() {
  const { params, update } = useListParams()
  const { data, isPending, isError, isFetching, refetch } = useUsersSearch(params)

  const hasActiveQueryOrFilters = Boolean(
    params.query || params.departmentId || params.designationId || params.employmentStatus,
  )

  function handleSort(column: SortColumn) {
    const nextDir: SortDirection =
      params.sortBy === column && params.sortDir === 'asc' ? 'desc' : 'asc'
    update({ sort: column, dir: nextDir })
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Users"
        description="Manage employee records and access complete IT profiles."
        actions={
          <Button nativeButton={false} render={<Link to="/app/users/new" />}>
            <Plus className="size-4" aria-hidden />
            Add User
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <UserSearchInput value={params.query} onChange={(q) => update({ q })} />
        <UserFilterBar
          departmentId={params.departmentId}
          designationId={params.designationId}
          employmentStatus={params.employmentStatus}
          onDepartmentChange={(dept) => update({ dept })}
          onDesignationChange={(desig) => update({ desig })}
          onStatusChange={(status) => update({ status })}
          onClearAll={() => update({ dept: null, desig: null, status: null, q: null })}
        />
      </div>

      {isError ? (
        <ErrorState
          title="Users couldn't be loaded"
          description="Please try again."
          onRetry={() => refetch()}
        />
      ) : isPending ? (
        <div className="rounded-lg border border-border bg-surface p-10 text-center text-sm text-text-secondary">
          Loading users…
        </div>
      ) : data.rows.length === 0 ? (
        hasActiveQueryOrFilters ? (
          <EmptyState
            title="No users match your current search"
            description="Try a different search term or clear your filters."
          />
        ) : (
          <EmptyState
            title="No users have been added yet"
            description="Create the first employee record to get started."
            action={
              <Button size="sm" nativeButton={false} render={<Link to="/app/users/new" />}>
                <Plus className="size-4" aria-hidden />
                Add User
              </Button>
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-text-secondary" aria-live="polite">
            {data.totalCount} {data.totalCount === 1 ? 'user' : 'users'}
            {hasActiveQueryOrFilters ? ' matching your search' : ''}
            {isFetching ? ' · updating…' : ''}
          </p>
          <UserTable
            users={data.rows}
            sortBy={params.sortBy}
            sortDir={params.sortDir}
            onSortChange={handleSort}
          />
          <UserListMobile users={data.rows} />
          <PaginationBar
            page={params.page}
            pageSize={PAGE_SIZE}
            totalCount={data.totalCount}
            onPageChange={(page) => update({ page: String(page) }, false)}
          />
        </div>
      )}
    </div>
  )
}
