import React from 'react';

interface LoadMoreButtonProps {
  loading: boolean;
  onClick: () => void;
}

export default function LoadMoreButton({ loading, onClick }: LoadMoreButtonProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button
        id="load-more-button"
        onClick={onClick}
        disabled={loading}
        className="load-more-btn"
      >
        {loading ? (
          <>
            <svg
              style={{
                animation: 'spin 1s linear infinite',
                width: '1.25rem',
                height: '1.25rem',
                marginRight: '0.25rem',
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"
              />
            </svg>
            Loading...
          </>
        ) : (
          'Load More Products'
        )}
      </button>
    </div>
  );
}
