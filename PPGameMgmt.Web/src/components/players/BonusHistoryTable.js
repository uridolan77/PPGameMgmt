import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Info as InfoIcon,
  CheckCircle as CompletedIcon,
  Pending as ActiveIcon,
  AccessTime as PendingIcon,
  Cancel as ExpiredIcon,
} from "@mui/icons-material";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const BonusHistoryTable = ({ bonuses }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Completed":
        return (
          <Chip
            icon={<CompletedIcon fontSize="small" />}
            label="Completed"
            size="small"
            color="success"
          />
        );
      case "Active":
        return (
          <Chip
            icon={<ActiveIcon fontSize="small" />}
            label="Active"
            size="small"
            color="primary"
          />
        );
      case "Pending":
        return (
          <Chip
            icon={<PendingIcon fontSize="small" />}
            label="Pending"
            size="small"
            color="warning"
          />
        );
      case "Expired":
        return (
          <Chip
            icon={<ExpiredIcon fontSize="small" />}
            label="Expired"
            size="small"
            color="error"
          />
        );
      default:
        return (
          <Chip label={status} size="small" color="default" />
        );
    }
  };

  // Empty state
  if (!bonuses || bonuses.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No bonus history found for this player.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell>Bonus Name</TableCell>
              <TableCell>Claimed Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Wagering Progress</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell align="center">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bonuses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((bonus) => (
                <TableRow key={bonus.id} hover>
                  <TableCell>{bonus.bonusName}</TableCell>
                  <TableCell>{formatDate(bonus.claimDate)}</TableCell>
                  <TableCell>{getStatusChip(bonus.status)}</TableCell>
                  <TableCell align="right">{formatCurrency(bonus.amount)}</TableCell>
                  <TableCell>
                    <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={bonus.wageringProgress} 
                          color={bonus.wageringProgress === 100 ? "success" : "primary"}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(bonus.wageringProgress)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(bonus.expiryDate)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View bonus details">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={bonuses.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default BonusHistoryTable;