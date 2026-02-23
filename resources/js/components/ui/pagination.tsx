/**
 * Pagination component with dark mode support
 */
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  from?: number;
  to?: number;
  total?: number;
  links?: any[];
  currentPage?: number;
  lastPage?: number;
  entityName?: string;
  onPageChange?: (url: string) => void;
  className?: string;
}

export function Pagination({
  from = 0,
  to = 0,
  total = 0,
  links = [],
  currentPage,
  lastPage,
  entityName = 'items',
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();

  const handlePageChange = (url: string) => {
    if (onPageChange) {
      onPageChange(url);
    } else if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between px-2 py-4", 
      className
    )}>
      <div className="flex-1 text-sm text-muted-foreground">
        {t("Showing")} <span className="font-medium text-foreground">{from}</span> {t("to")}{" "}
        <span className="font-medium text-foreground">{to}</span> {t("of")}{" "}
        <span className="font-medium text-foreground">{total}</span> {t("results")}
      </div>
      <div className="flex items-center space-x-2">
        {links?.map((link, i) => {
            // Handle "Previous" and "Next" labels which might contain HTML entities
            let label = link.label;
            if (label.includes('&laquo;')) label = 'Previous';
            if (label.includes('&raquo;')) label = 'Next';
            
            const isPrevious = label === 'Previous';
            const isNext = label === 'Next';
            const isEllipsis = label === '...';
            
            if (isEllipsis) {
                return (
                    <span key={i} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </span>
                );
            }

            return (
            <Button
                key={i}
                variant={link.active ? "default" : "outline"}
                size="icon"
                className={cn(
                    "h-8 w-8",
                    link.active && "pointer-events-none",
                    !link.url && !link.active && "opacity-50 cursor-not-allowed"
                )}
                disabled={!link.url}
                onClick={() => link.url && onPageChange?.(link.url)}
            >
                {isPrevious ? (
                    <ChevronLeft className="h-4 w-4" />
                ) : isNext ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <span className="text-xs">{label}</span>
                )}
                <span className="sr-only">{label}</span>
            </Button>
            );
        })}
      </div>
    </div>
  );
}