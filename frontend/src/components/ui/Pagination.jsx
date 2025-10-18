import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';

const Pagination = ({ 
  pagination, 
  onPageChange,
  variant = 'default',
  showPageNumbers = true,
}) => {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const handlePrev = () => onPageChange(Math.max(page - 1, 1));
  const handleNext = () => onPageChange(Math.min(page + 1, totalPages));
  const handleFirst = () => onPageChange(1);
  const handleLast = () => onPageChange(totalPages);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center space-x-2 mt-6">
      {variant === 'full' && (
        <Button onClick={handleFirst} disabled={page === 1} size="sm" variant="outline" ariaLabel="First Page">
          ⟨⟨
        </Button>
      )}
      
      <Button onClick={handlePrev} disabled={page === 1} size="sm" variant="outline" ariaLabel="Previous Page">
        ⟨
      </Button>

      {showPageNumbers && getPageNumbers().map((pageNum, idx) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-black">...</span>
        ) : (
          <Button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            size="sm"
            variant={page === pageNum ? 'primary' : 'outline'}
            ariaLabel={`Page ${pageNum}`}
            className="min-w-[40px]"
          >
            {pageNum}
          </Button>
        )
      ))}

      <Button onClick={handleNext} disabled={page === totalPages} size="sm" variant="outline" ariaLabel="Next Page">
        ⟩
      </Button>

      {variant === 'full' && (
        <Button onClick={handleLast} disabled={page === totalPages} size="sm" variant="outline" ariaLabel="Last Page">
          ⟩⟩
        </Button>
      )}

      <span aria-live="polite" className="text-black font-medium text-sm ml-4">
        {page} / {totalPages}
      </span>
    </nav>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'full']),
  showPageNumbers: PropTypes.bool,
};

export default React.memo(Pagination);