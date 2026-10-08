import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAddInternalNote } from '../hooks/support-mutations'

interface AddInternalNoteFormProps {
  issueId: string
}

export function AddInternalNoteForm({ issueId }: AddInternalNoteFormProps) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const addNote = useAddInternalNote(issueId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) {
      setError('Enter a note before saving.')
      return
    }
    setError(null)
    try {
      await addNote.mutateAsync(comment)
      setComment('')
    } catch {
      setError('Failed to save note. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        rows={2}
        placeholder="Add an internal note (not visible to the requester)…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <Button type="submit" size="sm" variant="outline" disabled={addNote.isPending}>
        {addNote.isPending ? 'Saving…' : 'Add Internal Note'}
      </Button>
    </form>
  )
}
