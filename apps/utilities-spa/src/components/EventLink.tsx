import type { PropsWithChildren } from 'react';

interface EventLinkProps extends PropsWithChildren {
  eventId?: number;
}

export const EventLink = ({
  eventId,
  children
}: EventLinkProps) => {
  const url = `https://www.waukeshamakers.com/event-${eventId}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children || 'View Event'}
    </a>
  );
};
