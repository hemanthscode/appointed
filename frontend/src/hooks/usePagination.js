import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const changePage = (newPage) => {
    setPage(newPage);
  };

  const changeLimit = (newLimit) => {
    setLimit(newLimit);
  };

  return {
    page,
    limit,
    setPage: changePage,
    setLimit: changeLimit,
  };
};
