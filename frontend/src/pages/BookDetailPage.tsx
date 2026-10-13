import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookApi, listingApi } from '@/lib/api';
import { ListingCard, LoadingSpinner, EmptyState } from '@/components/shared';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);

  const { data: book, isLoading: loadingBook, error: bookError } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookApi.getById(bookId),
    enabled: !!bookId,
  });

  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ['listings', 'book', bookId],
    queryFn: () => listingApi.getAll({ limit: 20 }),
  });

  if (loadingBook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <EmptyState
            title="Không tìm thấy sách"
            description="Sách này có thể đã bị xóa hoặc không tồn tại."
            icon="📚"
            action={
              <Link to="/books" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Quay lại danh sách
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const bookListings = listings?.data.filter(l => l.bookId === bookId) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="list-none p-0 flex items-center text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link to="/books" className="hover:text-primary-600">Sách</Link>
            </li>
            {book.category && (
              <>
                <li className="mx-2">/</li>
                <li>
                  <Link to={`/search?categoryId=${book.categoryId}`} className="hover:text-primary-600">
                    {book.category.name}
                  </Link>
                </li>
              </>
            )}
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{book.title}</li>
          </ol>
        </nav>

        {/* Book Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cover Image */}
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={book.coverImage || `https://picsum.photos/seed/${book.id}/400/600`}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
              
              {book.author && (
                <p className="text-lg text-gray-600 mb-2">
                  <span className="font-medium">Tác giả:</span> {book.author}
                </p>
              )}
              
              {book.publisher && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Nhà xuất bản:</span> {book.publisher}
                </p>
              )}
              
              {book.edition && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Phiên bản:</span> {book.edition}
                </p>
              )}
              
              {book.publicationYear && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Năm xuất bản:</span> {book.publicationYear}
                </p>
              )}
              
              {book.isbn && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">ISBN:</span> {book.isbn}
                </p>
              )}
              
              {book.major?.university && (
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Trường:</span>{' '}
                  <Link to={`/universities/${book.major.university.id}`} className="text-primary-600 hover:underline">
                    {book.major.university.name}
                  </Link>
                </p>
              )}
              
              {book.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-600 whitespace-pre-line">{book.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Các tin đăng bán ({bookListings.length})
          </h2>
          
          {loadingListings ? (
            <div className="text-center py-8">
              <LoadingSpinner />
            </div>
          ) : bookListings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-500 mb-4">Hiện chưa có tin đăng nào cho sách này</p>
              <Link
                to="/listings/create"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Đăng bán ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {bookListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
