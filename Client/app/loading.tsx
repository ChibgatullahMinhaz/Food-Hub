export default function Loading() {
  return (
    <main className="food-loading" aria-busy="true" aria-live="polite">
      <div className="food-loading__content">
        <div className="food-loading__brand" aria-label="Food Hub">
          <span className="food-loading__brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 13.5h16l-1.15 4.02a2 2 0 0 1-1.92 1.45H7.07a2 2 0 0 1-1.92-1.45L4 13.5Z"
                fill="currentColor"
              />
              <path
                d="M3 13.5h18M7.5 10c0-1 .75-1.5.75-2.5M12 10c0-1 .75-1.5.75-2.5M16.5 10c0-1 .75-1.5.75-2.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <span>Food<span className="food-loading__brand-accent">Hub</span></span>
        </div>

        <div className="food-loading__illustration" aria-hidden="true">
          <span className="food-loading__orbit food-loading__orbit--outer" />
          <span className="food-loading__orbit food-loading__orbit--inner" />
          <span className="food-loading__spark food-loading__spark--one" />
          <span className="food-loading__spark food-loading__spark--two" />
          <svg className="food-loading__bowl" viewBox="0 0 160 120" fill="none">
            <path
              className="food-loading__steam"
              d="M57 35c-7-9 7-11 0-20M79 31c-7-9 7-11 0-20M101 35c-7-9 7-11 0-20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d="M30 56h100l-9 36a12 12 0 0 1-11.6 9H50.6A12 12 0 0 1 39 92l-9-36Z"
              fill="currentColor"
            />
            <path
              d="M22 56h116"
              stroke="#fff8ed"
              strokeLinecap="round"
              strokeWidth="8"
            />
            <circle cx="58" cy="68" r="5" fill="#fff8ed" />
            <circle cx="79" cy="75" r="5" fill="#fff8ed" />
            <circle cx="101" cy="66" r="5" fill="#fff8ed" />
            <path
              d="M55 102h50"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="6"
            />
          </svg>
        </div>

        <h1 className="food-loading__title">Something delicious is on its way</h1>
        <p className="food-loading__message">Fresh flavors, just a moment...</p>

        <div
          className="food-loading__progress"
          role="progressbar"
          aria-label="Loading"
        >
          <span />
        </div>
      </div>
    </main>
  );
}
