import React from 'react';

const Footer = () => (
  <footer
    className="bg-white border-t border-black p-4 text-center text-black text-sm select-none"
    aria-label="Footer"
  >
    &copy; {new Date().getFullYear()} Appointed. All rights reserved.
  </footer>
);

export default React.memo(Footer);
