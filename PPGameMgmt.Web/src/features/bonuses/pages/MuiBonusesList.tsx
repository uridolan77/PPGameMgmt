import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBonuses } from '../hooks';
import { Bonus, BonusFilter } from '../types';
import { formatBonusValue } from '../utils/bonusUtils';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';

// MUI Icons
import {
  Add as AddIcon,
  TrendingUp,
  CardGiftcard as BonusIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Star as VipIcon,
  Event as CalendarIcon
} from '@mui/icons-material';

// Shared MUI Components
import {
  PageHeader,
  StatCard,
  TabPanel,
  SearchFilterBar,
  DataTable,
  Column
} from '../../../shared/components/mui';

const MuiBonusesList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
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

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting bonuses as ${format}`);
    // Implementation would go here
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if a bonus is expired
  const isBonusExpired = (bonus: Bonus): boolean => {
    const now = new Date();
    const endDate = new Date(bonus.endDate);
    return endDate < now;
  };

  // Get status text
  const getStatusText = (bonus: Bonus): string => {
    if (isBonusExpired(bonus)) return "Expired";
    return bonus.isActive ? "Active" : "Inactive";
  };

  // Calculate bonus statistics
  const bonusStats = useMemo(() => {
    // Default stats if no bonuses data
    const defaultStats = {
      totalBonuses: 0,
      activeBonuses: 0,
      expiredBonuses: 0,
      vipBonuses: 0
    };

    // Check if bonuses exists and is an array
    if (!bonuses || !Array.isArray(bonuses)) {
      console.log('Bonuses data is not an array:', bonuses);
      return defaultStats;
    }

    const now = new Date();
    const totalBonuses = bonuses.length;
    const activeBonuses = bonuses.filter(bonus => bonus.isActive && new Date(bonus.endDate) > now).length;
    const expiredBonuses = bonuses.filter(bonus => new Date(bonus.endDate) < now).length;
    const vipBonuses = bonuses.filter(bonus => bonus.targetSegment === 'VIP').length;

    return {
      totalBonuses,
      activeBonuses,
      expiredBonuses,
      vipBonuses
    };
  }, [bonuses]);

  // Memoize filtered bonuses to avoid unnecessary re-filtering
  const filteredBonuses = useMemo(() => {
    // Check if bonuses exists and is an array
    if (!bonuses || !Array.isArray(bonuses)) {
      console.log('Bonuses data is not an array for filtering:', bonuses);
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return bonuses;

    return bonuses.filter((bonus) => {
      if (!bonus) return false;

      return (
        (bonus.name && bonus.name.toLowerCase().includes(query)) ||
        (bonus.description && bonus.description.toLowerCase().includes(query)) ||
        (bonus.targetSegment && bonus.targetSegment.toLowerCase().includes(query))
      );
    });
  }, [bonuses, searchQuery]);

  // Define columns for the data table
  const columns: Column<Bonus>[] = [
    {
      id: 'name',
      label: 'Name',
      format: (value, bonus) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">{value}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {bonus.description.length > 60
              ? `${bonus.description.substring(0, 60)}...`
              : bonus.description}
          </Typography>
        </Box>
      )
    },
    {
      id: 'value',
      label: 'Value',
      format: (value, bonus) => (
        <Chip
          label={formatBonusValue(bonus)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      id: 'period',
      label: 'Period',
      format: (_, bonus) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatDate(bonus.startDate)} - {formatDate(bonus.endDate)}
          </Typography>
        </Box>
      )
    },
    {
      id: 'targetSegment',
      label: 'Target Segment',
      format: (value) => value ? (
        <Chip
          label={value}
          size="small"
          color={value === 'VIP' ? 'warning' : 'default'}
          variant="outlined"
        />
      ) : (
        <Typography variant="body2" color="text.secondary">All Players</Typography>
      )
    },
    {
      id: 'claims',
      label: 'Claims',
      format: (_, bonus) => (
        <Typography variant="body2">
          {bonus.currentClaims}
          {bonus.maxClaims ? ` / ${bonus.maxClaims}` : ''}
        </Typography>
      )
    },
    {
      id: 'isActive',
      label: 'Status',
      align: 'center',
      format: (value, bonus) => {
        const isExpired = isBonusExpired(bonus);
        return (
          <Chip
            label={getStatusText(bonus)}
            size="small"
            color={isExpired ? 'error' : value ? 'success' : 'default'}
            variant="outlined"
          />
        );
      }
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <PageHeader
        title="Bonuses"
        description="Manage promotional bonuses and campaigns"
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddBonus}
          >
            Add New Bonus
          </Button>
        }
      />

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bonuses"
            value={formatNumber(bonusStats.totalBonuses)}
            icon={<BonusIcon />}
            iconColor="primary.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: "8% from last month",
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Bonuses"
            value={formatNumber(bonusStats.activeBonuses)}
            icon={<ActiveIcon />}
            iconColor="success.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: `${Math.round((bonusStats.activeBonuses / bonusStats.totalBonuses) * 100) || 0}% of total bonuses`,
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expired Bonuses"
            value={formatNumber(bonusStats.expiredBonuses)}
            icon={<InactiveIcon />}
            iconColor="error.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />,
              text: `${Math.round((bonusStats.expiredBonuses / bonusStats.totalBonuses) * 100) || 0}% of total bonuses`,
              color: "error.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="VIP Bonuses"
            value={formatNumber(bonusStats.vipBonuses)}
            icon={<VipIcon />}
            iconColor="warning.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: `${Math.round((bonusStats.vipBonuses / bonusStats.totalBonuses) * 100) || 0}% of total bonuses`,
              color: "success.main"
            }}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 'medium'
              }
            }}
          >
            <Tab label="All Bonuses" id="bonuses-tab-0" aria-controls="bonuses-tabpanel-0" />
            <Tab label="Active Bonuses" id="bonuses-tab-1" aria-controls="bonuses-tabpanel-1" />
            <Tab label="Expired Bonuses" id="bonuses-tab-2" aria-controls="bonuses-tabpanel-2" />
            <Tab label="VIP Bonuses" id="bonuses-tab-3" aria-controls="bonuses-tabpanel-3" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Search and Filters */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search bonuses by name, description or segment..."
            onExport={handleExport}
            exportOptions={['csv', 'excel', 'pdf']}
          />

          {/* Bonuses List Table */}
          <TabPanel value={tabValue} index={0}>
            <DataTable
              columns={columns}
              data={filteredBonuses}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading bonus data"
              emptyMessage="No bonuses found"
              onRowClick={handleBonusClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DataTable
              columns={columns}
              data={filteredBonuses.filter(bonus => bonus.isActive && !isBonusExpired(bonus))}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading bonus data"
              emptyMessage="No active bonuses found"
              onRowClick={handleBonusClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <DataTable
              columns={columns}
              data={filteredBonuses.filter(bonus => isBonusExpired(bonus))}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading bonus data"
              emptyMessage="No expired bonuses found"
              onRowClick={handleBonusClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <DataTable
              columns={columns}
              data={filteredBonuses.filter(bonus => bonus.targetSegment === 'VIP')}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading bonus data"
              emptyMessage="No VIP bonuses found"
              onRowClick={handleBonusClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default MuiBonusesList;
