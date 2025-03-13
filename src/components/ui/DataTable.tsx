
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  PlusCircle
} from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    accessorKey: keyof T;
    header: string;
    cell?: (value: any) => React.ReactNode;
  }[];
  searchable?: boolean;
  createNew?: {
    label: string;
    onClick: () => void;
  };
  isLoading?: boolean;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  createNew,
  isLoading = false,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const itemsPerPage = 10;

  // Apply search filter when data or search query changes
  useEffect(() => {
    setMounted(true);
    
    if (!searchQuery) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      return Object.values(item).some((value) => {
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [data, searchQuery]);

  // Calculate pagination info
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {searchable && (
          <div className="relative w-full sm:w-auto max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 bg-background"
            />
          </div>
        )}
        
        {createNew && (
          <Button 
            onClick={createNew.onClick}
            className="ml-auto w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {createNew.label}
          </Button>
        )}
      </div>
      
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className="hover:bg-muted/40 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell 
                        ? column.cell(row[column.accessorKey]) 
                        : String(row[column.accessorKey] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
