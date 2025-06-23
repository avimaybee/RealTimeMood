"use client";
import * as React from 'react';
import { usePlatform } from "@/contexts/PlatformContext";
import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    const { isAndroid } = usePlatform();
    return (
      <textarea
        className={cn(
          // Base styles, without focus rings
          'flex min-h-[80px] w-full px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // Platform-specific styles
          isAndroid
            ? "rounded-b-none rounded-t-md border-0 border-b border-input bg-muted/30 transition-colors focus-visible:border-b-2 focus-visible:border-primary" // Android: Material 3 "Filled" style
            : 'rounded-md border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', // iOS/Default: Standard bordered input
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
