import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';

const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages } = pagination;

  const handlePrev = () => onPageChange(Math.max(page - 1, 1));
  const handleNext = () => onPageChange(Math.min(page + 1, totalPages));

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center space-x-2 mt-4">
      <Button onClick={handlePrev} disabled={page === 1} ariaLabel="Previous Page">
        &lt;
      </Button>
      <span aria-live="polite" className="text-black font-medium select-none">
        Page {page} of {totalPages}
      </span>
      <Button onClick={handleNext} disabled={page === totalPages} ariaLabel="Next Page">
        &gt;
      </Button>
    </nav>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default React.memo(Pagination);
