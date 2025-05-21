import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  image?: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function Card({ className, href, image, stats, ...props }: CardProps) {
  const content = (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {image && (
        <div className="relative h-48 w-full">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      )}
      {stats ? (
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <dt className="text-sm font-medium text-gray-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </div>
          <div className="mt-6">{props.children}</div>
        </div>
      ) : (
        props.children
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function CardGrid({
  children,
  columns = 3,
  className,
  ...props
}: CardGridProps) {
  return (
    <div
      className={cn(
        'grid gap-6',
        {
          'grid-cols-1': columns === 1,
          'grid-cols-1 sm:grid-cols-2': columns === 2,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': columns === 4,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
