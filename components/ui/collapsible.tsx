'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleProps {
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
}

const CollapsibleContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <CollapsibleContext.Provider value={{ open, setOpen }}>
        <div
          ref={ref}
          className={cn('', className)}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = 'Collapsible';

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { open, setOpen } = React.useContext(CollapsibleContext);

    const handleClick = () => {
      setOpen(!open);
      onClick?.();
    };

    return (
      <button
        ref={ref}
        className={cn('', className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext);

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn('', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };