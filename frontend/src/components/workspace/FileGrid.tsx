import type { Document } from '@/types';
import FileCard from './FileCard';

interface FileGridProps {
  documents: Document[];
  onSelect?: (doc: Document) => void;
  onContextMenu?: (doc: Document, e: React.MouseEvent) => void;
}

export default function FileGrid({ documents, onSelect, onContextMenu }: FileGridProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {documents.map((doc) => (
        <FileCard
          key={doc.id}
          document={doc}
          onSelect={() => onSelect?.(doc)}
          onOpenContextMenu={(e) => onContextMenu?.(doc, e)}
        />
      ))}
    </div>
  );
}
