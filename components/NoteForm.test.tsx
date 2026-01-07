import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NoteForm from './NoteForm'

describe('NoteForm', () => {
  it('renders correctly with default props', () => {
    render(<NoteForm onSubmit={async () => {}} />)
    
    expect(screen.getByPlaceholderText('제목 입력')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('내용 입력')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('calls onSubmit with title and content when submitted', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(<NoteForm onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('제목 입력'), { target: { value: 'New Note' } })
    fireEvent.change(screen.getByPlaceholderText('내용 입력'), { target: { value: 'New Content' } })
    
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(handleSubmit).toHaveBeenCalledWith('New Note', 'New Content')
  })

  it('shows processing state when submitting', async () => {
    const handleSubmit = new Promise<void>(() => {}) // Never resolves
    render(<NoteForm onSubmit={() => handleSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('제목 입력'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText('내용 입력'), { target: { value: 'Test' } })
    
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(screen.getByText('처리 중...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
