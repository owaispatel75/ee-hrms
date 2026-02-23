import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Filter, Search, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FilterOption {
  name: string;
  label: string;
  type: 'select' | 'date';
  options?: { value: string; label: string; disabled?: boolean }[];
  value: string | Date | undefined;
  onChange: (value: any) => void;
  searchable?: boolean;
}

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  filters?: FilterOption[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: () => boolean;
  activeFilterCount: () => number;
  onResetFilters: () => void;
  onApplyFilters?: () => void;
  perPageOptions?: number[];
  currentPerPage: string;
  onPerPageChange: (value: string) => void;
  // View toggle props
  showViewToggle?: boolean;
  activeView?: 'list' | 'grid';
  onViewChange?: (view: 'list' | 'grid') => void;
}

export function SearchAndFilterBar({
  searchTerm,
  onSearchChange,
  onSearch,
  filters = [],
  showFilters,
  setShowFilters,
  hasActiveFilters,
  activeFilterCount,
  onResetFilters,
  onApplyFilters,
  perPageOptions = [10, 25, 50, 100],
  currentPerPage,
  onPerPageChange,
  // View toggle props
  showViewToggle = false,
  activeView = 'list',
  onViewChange,
}: SearchAndFilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={onSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search by name, email...")}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>
            <Button type="submit" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4 mr-1.5" />
              {t("Search")}
            </Button>
          </form>
          
          {filters.length > 0 && (
            <div className="ml-0 md:ml-2">
              <Button
                variant={hasActiveFilters() ? "secondary" : "outline"}
                size="sm"
                className={cn("h-9 border-dashed", hasActiveFilters() && "border-solid")}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                {showFilters ? t('Hide') : t('Filters')}
                {hasActiveFilters() && (
                  <span className="ml-1.5 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                    {activeFilterCount()}
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {showViewToggle && onViewChange && (
            <div className="bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
              <Button 
                size="sm" 
                variant="ghost"
                className={cn(
                    "h-7 w-8 px-0 rounded-md transition-all", 
                    activeView === 'list' ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => onViewChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                 className={cn(
                    "h-7 w-8 px-0 rounded-md transition-all", 
                    activeView === 'grid' ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => onViewChange('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:inline-block">{t("Rows:")}</span>
            <Select
                value={currentPerPage}
                onValueChange={onPerPageChange}
            >
                <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                {perPageOptions.map(option => (
                    <SelectItem key={option} value={option.toString()} className="text-xs">{option}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {showFilters && filters.length > 0 && (
        <div className="w-full mt-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-4 items-end">
            {filters.map((filter) => (
              <div key={filter.name} className="space-y-2">
                <Label>{filter.label}</Label>
                {filter.type === 'select' && filter.options && (
                  <Select
                    value={filter.value as string}
                    onValueChange={filter.onChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t(`All ${filter.label}`)} />
                    </SelectTrigger>
                    <SelectContent searchable={filter.searchable}>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value || 'empty'} value={option.value || '_empty_'} disabled={option.disabled}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filter.type === 'date' && (
                  <DatePicker
                    selected={filter.value as Date | undefined}
                    onSelect={filter.onChange}
                    onChange={filter.onChange}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2">
              {onApplyFilters && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-9"
                  onClick={onApplyFilters}
                >
                  {t("Apply Filters")}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={onResetFilters}
                disabled={!hasActiveFilters()}
              >
                {t("Reset Filters")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}