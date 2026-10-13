import { Link } from 'react-router-dom';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const coverImage = book.coverImage || 'https://picsum.photos/seed/' + book.id + '/400/600';

  return (
    <Link
      to={`/books/${book.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {book.title}
        </h3>

        {book.author && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {book.author}
          </p>
        )}

        {book.publisher && (
          <p className="text-xs text-gray-400 mt-1">
            {book.publisher}
          </p>
        )}

        {book.major?.university && (
          <p className="text-xs text-primary-600 mt-2 font-medium">
            {book.major.university.shortName || book.major.university.name}
          </p>
        )}
      </div>
    </Link>
  );
}
