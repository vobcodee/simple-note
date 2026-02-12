import { z } from 'zod';

// Base note schema
export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  content: z.string()
    .min(1, '내용을 입력해주세요')
    .max(10000, '내용은 10000자 이내로 입력해주세요'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string().uuid().optional(), // Optional for client-side usage
});

// Schema for creating a note (id and timestamps are generated)
export const CreateNoteSchema = NoteSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  user_id: true 
});

// Schema for updating a note
export const UpdateNoteSchema = CreateNoteSchema;

// Schema for note form (with string dates)
export const NoteFormSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  content: z.string()
    .min(1, '내용을 입력해주세요')
    .max(10000, '내용은 10000자 이내로 입력해주세요'),
});

// Types derived from schemas
export type Note = z.infer<typeof NoteSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type NoteFormInput = z.infer<typeof NoteFormSchema>;
