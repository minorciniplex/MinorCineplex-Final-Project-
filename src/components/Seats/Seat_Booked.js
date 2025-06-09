export default function BookedIcon({className}) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="5.25"
        fill="#565F7E"
        stroke="#8B93B0"
        strokeWidth="1.5"
      />
      <path
        d="M25 12.5L15 22.5M15 12.5L25 22.5"
        stroke="#8B93B0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0 20H7C8.65685 20 10 21.3431 10 23V29.5C10 31.1569 11.3431 32.5 13 32.5H27C28.6569 32.5 30 31.1569 30 29.5V23C30 21.3431 31.3431 20 33 20H40"
        stroke="#8B93B0"
        strokeWidth="1.5"
      />
    </svg>
  );
}
