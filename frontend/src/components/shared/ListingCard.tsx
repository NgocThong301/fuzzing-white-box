import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Listing } from '@/types';
import { CONDITION_LABELS, CONDITION_COLORS } from '@/types';
import { favoriteApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ListingCardProps {
  listing: Listing;
  showFavoriteButton?: boolean;
}

export function ListingCard({ listing, showFavoriteButton = true }: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(!!listing._count?.favorites);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return favoriteApi.remove(listing.id);
      } else {
        return favoriteApi.add(listing.id);
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorited ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
    },
    onError: () => {
      toast.error('Không thể cập nhật yêu thích');
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng yêu thích');
      return;
    }
    toggleFavoriteMutation.mutate();
  };
  const primaryImage = listing.images?.find((img) => img.isPrimary) || listing.images?.[0];
  const coverImage = primaryImage?.url || listing.book?.coverImage || 'https://picsum.photos/seed/' + listing.id + '/400/600';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={coverImage}
          alt={listing.book?.title || 'Book cover'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Condition Badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
            CONDITION_COLORS[listing.condition]
          }`}
        >
          {CONDITION_LABELS[listing.condition]}
        </span>

        {/* Shipping Badge */}
        {listing.shippingOption === 'BOTH' && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">
            🚚 + 📍
          </span>
        )}

        {/* Favorite Button */}
        {showFavoriteButton && (
          <button
            onClick={handleToggleFavorite}
            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
            } ${toggleFavoriteMutation.isPending ? 'opacity-50' : ''}`}
            title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.book?.title || 'Unknown Book'}
        </h3>

        {/* Author */}
        {listing.book?.author && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {listing.book.author}
          </p>
        )}

        {/* Location */}
        {listing.location && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(Number(listing.price))}
          </span>
          {listing.quantity > 1 && (
            <span className="text-xs text-gray-500">
              (Còn {listing.quantity})
            </span>
          )}
        </div>

        {/* Seller */}
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {listing.seller?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="text-sm text-gray-600">
            {listing.seller?.fullName || 'Người bán'}
          </span>
        </div>
      </div>
    </Link>
  );
}
