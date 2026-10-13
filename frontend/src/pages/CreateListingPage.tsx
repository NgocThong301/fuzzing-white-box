import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookApi, listingApi, categoryApi } from '@/lib/api';
import type { BookCondition, ShippingOption } from '@/types';

const CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: 'NEW', label: 'Mới' },
  { value: 'LIKE_NEW', label: 'Như mới' },
  { value: 'GOOD', label: 'Tốt' },
  { value: 'FAIR', label: 'Khá' },
  { value: 'POOR', label: 'Cũ' },
];

const SHIPPING_OPTIONS: { value: ShippingOption; label: string }[] = [
  { value: 'PICKUP', label: 'Nhận tại chỗ' },
  { value: 'DELIVERY', label: 'Giao hàng' },
  { value: 'BOTH', label: 'Cả hai' },
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [bookSearch, setBookSearch] = useState('');

  // Form state for listing
  const [formData, setFormData] = useState({
    price: '',
    quantity: '1',
    condition: 'GOOD' as BookCondition,
    description: '',
    location: '',
    shippingOption: 'BOTH' as ShippingOption,
    imageUrls: [] as string[],
  });

  // Form state for new book
  const [newBookData, setNewBookData] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    edition: '',
    publicationYear: '',
    description: '',
    coverImage: '',
    condition: 'GOOD' as BookCondition,
    majorId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    courseId: undefined as number | undefined,
  });

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ limit: 100 }),
  });

  const { data: booksData, isLoading: loadingBooks } = useQuery({
    queryKey: ['books', 'search', bookSearch],
    queryFn: () => bookApi.getAll({ q: bookSearch, limit: 20 }),
    enabled: bookSearch.length > 0,
  });

  // Mutations
  const createBookMutation = useMutation({
    mutationFn: bookApi.create,
  });

  const createListingMutation = useMutation({
    mutationFn: (payload: { bookId: number; data: any }) =>
      listingApi.create({ ...payload.data, bookId: payload.bookId }),
    onSuccess: async (result) => {
      // Auto-submit for review after creation
      try {
        await listingApi.submit(result.id);
        alert('Đăng bán thành công! Tin đăng của bạn đang chờ duyệt.');
      } catch {
        alert('Đăng bán thành công nhưng không thể gửi duyệt tự động. Vui lòng gửi duyệt sau.');
      }
      navigate(`/listings/${result.id}`);
    },
    onError: (error: Error) => {
      alert(error.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmitExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      alert('Vui lòng chọn sách');
      return;
    }

    createListingMutation.mutate({
      bookId: selectedBookId,
      data: {
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        condition: formData.condition,
        description: formData.description || undefined,
        location: formData.location || undefined,
        shippingOption: formData.shippingOption,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
      },
    });
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBookData.title) {
      alert('Vui lòng nhập tên sách');
      return;
    }

    try {
      // Create book first
      const newBook = await createBookMutation.mutateAsync({
        title: newBookData.title,
        isbn: newBookData.isbn || undefined,
        author: newBookData.author || undefined,
        publisher: newBookData.publisher || undefined,
        edition: newBookData.edition || undefined,
        publicationYear: newBookData.publicationYear ? Number(newBookData.publicationYear) : undefined,
        description: newBookData.description || undefined,
        coverImage: newBookData.coverImage || undefined,
        condition: newBookData.condition,
        majorId: newBookData.majorId,
        categoryId: newBookData.categoryId,
        courseId: newBookData.courseId,
      });

      // Then create listing
      createListingMutation.mutate({
        bookId: newBook.id,
        data: {
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          condition: formData.condition,
          description: formData.description || undefined,
          location: formData.location || undefined,
          shippingOption: formData.shippingOption,
          imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
        },
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUrlRemove = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const isLoading = createBookMutation.isPending || createListingMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Đăng bán sách</h1>

          {/* Mode Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'existing'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chọn sách có sẵn
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'new'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Thêm sách mới
            </button>
          </div>

          <form onSubmit={mode === 'existing' ? handleSubmitExisting : handleSubmitNew}>
            {/* Book Selection (Existing) */}
            {mode === 'existing' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm sách
                </label>
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => {
                    setBookSearch(e.target.value);
                    setSelectedBookId(null);
                  }}
                  placeholder="Nhập tên sách, tác giả, ISBN..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                
                {bookSearch && (
                  <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                    {loadingBooks ? (
                      <div className="p-4 text-center text-gray-500">Đang tải...</div>
                    ) : booksData?.data.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Không tìm thấy sách nào. Hãy thêm sách mới.
                      </div>
                    ) : (
                      booksData?.data.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => setSelectedBookId(book.id)}
                          className={`w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                            selectedBookId === book.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">
                            {book.author && `Tác giả: ${book.author}`}
                            {book.isbn && ` | ISBN: ${book.isbn}`}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {selectedBookId && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-700 font-medium">✓ Đã chọn sách</span>
                  </div>
                )}
              </div>
            )}

            {/* New Book Form */}
            {mode === 'new' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Thông tin sách mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sách <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newBookData.title}
                      onChange={(e) => setNewBookData({ ...newBookData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Ví dụ: Giáo trình Toán cao cấp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                    <input
                      type="text"
                      value={newBookData.isbn}
                      onChange={(e) => setNewBookData({ ...newBookData, isbn: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="978-..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                    <input
                      type="text"
                      value={newBookData.author}
                      onChange={(e) => setNewBookData({ ...newBookData, author: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Ví dụ: Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản</label>
                    <input
                      type="text"
                      value={newBookData.publisher}
                      onChange={(e) => setNewBookData({ ...newBookData, publisher: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản</label>
                    <input
                      type="number"
                      value={newBookData.publicationYear}
                      onChange={(e) => setNewBookData({ ...newBookData, publicationYear: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={newBookData.categoryId || ''}
                      onChange={(e) => setNewBookData({ 
                        ...newBookData, 
                        categoryId: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories?.data.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sách</label>
                  <textarea
                    value={newBookData.description}
                    onChange={(e) => setNewBookData({ ...newBookData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Mô tả thêm về sách..."
                  />
                </div>
              </div>
            )}

            {/* Listing Info */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Thông tin bán hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="150000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tình trạng sách <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      condition: e.target.value as BookCondition 
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình thức giao hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.shippingOption}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      shippingOption: e.target.value as ShippingOption 
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {SHIPPING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ví dụ: TP.HCM, Quận 10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Mô tả tình trạng sách, ghi chú..."
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sách (URL)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="imageUrl"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('imageUrl') as HTMLInputElement;
                    if (input?.value) {
                      setFormData({ 
                        ...formData, 
                        imageUrls: [...formData.imageUrls, input.value] 
                      });
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Thêm ảnh
                </button>
              </div>
              
              {formData.imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageUrlRemove(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng bán'}
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Tin đăng sẽ được kiểm duyệt trước khi hiển thị công khai
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
