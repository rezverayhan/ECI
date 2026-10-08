import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useManagerCandidates } from '../hooks/users-queries'

interface ManagerComboboxProps {
  value: string | undefined
  onChange: (userId: string | undefined) => void
  excludeUserId?: string
}

// Searchable, not a full-table dropdown (Stage 6 §25) — queries search_users
// on demand instead of loading every employee into the browser.
export function ManagerCombobox({ value, onChange, excludeUserId }: ManagerComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const candidatesQuery = useManagerCandidates(query, excludeUserId)

  const selected = candidatesQuery.data?.find((u) => u.id === value)

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
              aria-label="Select manager"
            >
              <span className={cn(!selected && !value && 'text-text-muted')}>
                {selected?.full_name ?? (value ? 'Selected manager' : 'No manager')}
              </span>
              <ChevronsUpDown className="size-4 text-text-muted" aria-hidden />
            </Button>
          }
        />
        <PopoverContent className="w-72 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search employees…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {candidatesQuery.isPending ? 'Searching…' : 'No employees found.'}
              </CommandEmpty>
              <CommandGroup>
                {candidatesQuery.data?.map((candidate) => (
                  <CommandItem
                    key={candidate.id}
                    value={candidate.id}
                    onSelect={() => {
                      onChange(candidate.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        value === candidate.id ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden
                    />
                    <div className="flex flex-col">
                      <span>{candidate.full_name}</span>
                      <span className="text-xs text-text-secondary">
                        {candidate.employee_id}
                        {candidate.employment_status !== 'active' ? ` · ${candidate.employment_status}` : ''}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear manager"
          onClick={() => onChange(undefined)}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
