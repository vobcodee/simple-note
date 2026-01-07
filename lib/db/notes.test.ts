import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNote, getNotes, deleteNote } from './notes'
import { supabase } from '../supabaseClient'

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1', title: 'Test', content: 'Content' }, error: null }))
        }))
      })),
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [{ id: '1', title: 'Test', content: 'Content' }], error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}))

describe('notes db functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createNote calls supabase insert', async () => {
    const note = await createNote('Test Title', 'Test Content')
    expect(supabase.from).toHaveBeenCalledWith('notes')
    expect(note).toEqual({ id: '1', title: 'Test', content: 'Content' })
  })

  it('getNotes calls supabase select', async () => {
    const notes = await getNotes()
    expect(supabase.from).toHaveBeenCalledWith('notes')
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('Test')
  })

  it('deleteNote calls supabase delete', async () => {
    await deleteNote('1')
    expect(supabase.from).toHaveBeenCalledWith('notes')
  })
})
