import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBonuses } from '../hooks';
import { Bonus, BonusFilter } from '../types';
import { formatBonusValue } from '../utils/bonusUtils';
import { VirtualizedList } from '../../../shared/components/VirtualizedList/VirtualizedList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatDate } from '../../../shared/utils/formatting';
import { ErrorBoundary } from '../../../core/error';

const BonusesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BonusFilter>({
    isActive: undefined,
    searchTerm: '',
    sortBy: 'startDate',
    sortDirection: 'desc'
  });

  // Use our custom useBonuses hook to fetch data
  const { data: bonuses, isLoading, isError } = useBonuses(filters);

  // Handle bonus click navigation
  const handleBonusClick = (bonus: Bonus) => {
    navigate(`/bonuses/${bonus.id}`);
  };

  // Handle adding a new bonus
  const handleAddBonus = () => {
    navigate('/bonuses/new');
  };

  // Get badge variant based on bonus status
  const getBadgeVariant = (isActive: boolean, isExpired: boolean) => {
    if (isExpired) return "destructive";
    return isActive ? "default" : "secondary";
  };

  // Check if a bonus is expired
  const isBonusExpired = (bonus: Bonus) => {
    const now = new Date();
    const endDate = new Date(bonus.endDate);
    return endDate < now;
  };

  // Get status text
  const getStatusText = (bonus: Bonus) => {
    if (isBonusExpired(bonus)) return "Expired";
    return bonus.isActive ? "Active" : "Inactive";
  };

  // Memoize filtered bonuses to avoid unnecessary re-filtering
  const filteredBonuses = useMemo(() => 
    bonuses?.filter(bonus => 
      bonus.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      bonus.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bonus.targetSegment && bonus.targetSegment.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [], 
    [bonuses, searchQuery]
  );

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bonuses</h1>
              <p className="text-muted-foreground">
                Manage promotional bonuses and campaigns
              </p>
            </div>
            <Button onClick={handleAddBonus}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Bonus
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bonus Campaigns</CardTitle>
              <CardDescription>
                View and manage all bonus campaigns across your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pb-4">
                <div className="relative w-full max-w-sm">
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bonuses..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                      <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                      <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Target Segment</TableHead>
                        <TableHead>Claims</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  
                  <VirtualizedList
                    items={filteredBonuses}
                    height={500}
                    estimateSize={60}
                    isLoading={isLoading}
                    isEmpty={filteredBonuses.length === 0}
                    loadingComponent={
                      <div className="h-24 flex items-center justify-center">
                        Loading bonus data...
                      </div>
                    }
                    emptyComponent={
                      <div className="h-24 flex items-center justify-center">
                        {isError ? (
                          <span className="text-red-500">Error loading bonus data</span>
                        ) : (
                          <span>No bonuses found</span>
                        )}
                      </div>
                    }
                    renderItem={(bonus) => (
                      <div 
                        onClick={() => handleBonusClick(bonus)}
                        className="cursor-pointer hover:bg-muted/50 border-b"
                      >
                        <div className="grid grid-cols-6 py-3">
                          <div className="px-4">
                            <div className="font-medium">{bonus.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {bonus.description}
                            </div>
                          </div>
                          <div className="px-4 flex items-center">
                            <Badge variant="outline">
                              {formatBonusValue(bonus)}
                            </Badge>
                          </div>
                          <div className="px-4 flex flex-col justify-center">
                            <div className="text-sm">
                              {formatDate(bonus.startDate)} - {formatDate(bonus.endDate)}
                            </div>
                          </div>
                          <div className="px-4 flex items-center">
                            {bonus.targetSegment ? (
                              <Badge variant="secondary">
                                {bonus.targetSegment}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">All Players</span>
                            )}
                          </div>
                          <div className="px-4 flex items-center">
                            <span>
                              {bonus.currentClaims} 
                              {bonus.maxClaims ? ` / ${bonus.maxClaims}` : ''}
                            </span>
                          </div>
                          <div className="px-4 flex items-center justify-center">
                            <Badge variant={getBadgeVariant(bonus.isActive, isBonusExpired(bonus))}>
                              {getStatusText(bonus)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {filteredBonuses.length} {filteredBonuses.length === 1 ? 'bonus' : 'bonuses'} found
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BonusesList;
