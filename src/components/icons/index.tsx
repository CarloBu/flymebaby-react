import React from "react";

export const ChevronUpDownIcon = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 3L12 7H4L8 3ZM8 13L12 9H4L8 13Z"
    />
  </svg>
);

export const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"
    />
  </svg>
);

export const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.115 2.115a.75.75 0 0 1 1.06 0L6 4.94l2.825-2.825a.75.75 0 1 1 1.06 1.06L7.06 6l2.825 2.825a.75.75 0 0 1-1.06 1.06L6 7.06 3.175 9.885a.75.75 0 0 1-1.06-1.06L4.94 6 2.115 3.175a.75.75 0 0 1 0-1.06Z"
    />
  </svg>
);

export const PassengerIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 14V13.2C0 12.6333 0.146 12.1127 0.438 11.638C0.73 11.1633 1.11733 10.8007 1.6 10.55C2.63333 10.0333 3.68333 9.646 4.75 9.388C5.81667 9.13 6.9 9.00067 8 9C9.1 8.99933 10.1833 9.12867 11.25 9.388C12.3167 9.64733 13.3667 10.0347 14.4 10.55C14.8833 10.8 15.271 11.1627 15.563 11.638C15.855 12.1133 16.0007 12.634 16 13.2V14C16 14.55 15.8043 15.021 15.413 15.413C15.0217 15.805 14.5507 16.0007 14 16H2C1.45 16 0.979333 15.8043 0.588 15.413C0.196666 15.0217 0.000666667 14.5507 0 14Z" />
  </svg>
);

export const AirplaneIcon = ({
  className = "",
  fill = "currentColor",
}: {
  className?: string;
  fill?: string;
}) => (
  <svg
    viewBox="0 0 21 20"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="presentation"
  >
    <path
      d="M13.553 11.5L8.5 19.5L6.5 19.5L9.026 11.5L3.666 11.5L2 14.5L0.499999 14.5L1.5 10L0.5 5.5L2 5.5L3.667 8.5L9.027 8.5L6.5 0.499999L8.5 0.499999L13.553 8.5L19 8.5C19.3978 8.5 19.7794 8.65804 20.0607 8.93934C20.342 9.22064 20.5 9.60218 20.5 10C20.5 10.3978 20.342 10.7794 20.0607 11.0607C19.7794 11.342 19.3978 11.5 19 11.5L13.553 11.5Z"
      fill={fill}
    />
  </svg>
);
