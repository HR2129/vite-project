import React, { useState } from 'react';

const Dropdown = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (position) => {
    onSelect(position);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          ...
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
              onClick={() => handleSelect('before')}
            >
              Insert Polygon Before
            </button>
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
              onClick={() => handleSelect('after')}
            >
              Insert Polygon After
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;