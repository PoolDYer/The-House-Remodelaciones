"use client";

import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const CardComponent: React.FC<CardProps> = ({ className = "", children }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`mb-4 pb-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <h2 className={`text-2xl font-bold text-gray-900 ${className}`} {...props}>
    {children}
  </h2>
);

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div
    className={`mt-6 pt-4 border-t border-gray-200 flex gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Attach sub-components to Card
export const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});

export { CardHeader, CardTitle, CardContent, CardFooter };
