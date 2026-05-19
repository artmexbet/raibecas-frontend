import type { Document } from '@/types/document';

/**
 * Returns a human-readable string listing participants with their roles.
 * Falls back to `doc.author.name` when participants list is empty.
 *
 * Example: "Иванов И. (автор) · Петров П. (редактор)"
 */
export function getParticipantsLabel(doc: Document): string {
  if (doc.participants && doc.participants.length > 0) {
    return doc.participants
      .map((p) => `${p.author.name} (${p.authorshipType.title})`)
      .join(' · ');
  }
  return doc.author?.name ?? '';
}
