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
