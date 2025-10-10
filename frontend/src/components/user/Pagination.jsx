import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button
        className="px-4 py-2 rounded bg-gray-700 text-white font-semibold disabled:opacity-50"
        onClick={() => !prevDisabled && onPageChange(page - 1)}
        disabled={prevDisabled}
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="px-4 py-2 rounded bg-gray-700 text-white font-semibold disabled:opacity-50"
        onClick={() => !nextDisabled && onPageChange(page + 1)}
        disabled={nextDisabled}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
