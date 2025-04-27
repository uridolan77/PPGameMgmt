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
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  Info as InfoIcon,
  Smartphone as MobileIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon
} from "@mui/icons-material";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const GameSessionsTable = ({ sessions }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get icon based on device type
  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <MobileIcon fontSize="small" />;
      case "tablet":
        return <TabletIcon fontSize="small" />;
      case "desktop":
        return <DesktopIcon fontSize="small" />;
      default:
        return <DesktopIcon fontSize="small" />;
    }
  };

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No game sessions found for this player.
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
              <TableCell>Game</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Device</TableCell>
              <TableCell align="right">Total Bets</TableCell>
              <TableCell align="right">Total Wins</TableCell>
              <TableCell align="right">Net Result</TableCell>
              <TableCell align="center">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell>{session.gameName}</TableCell>
                  <TableCell>{formatDateTime(session.startTime)}</TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getDeviceIcon(session.deviceType)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {session.deviceType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(session.totalBets)}</TableCell>
                  <TableCell align="right">{formatCurrency(session.totalWins)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={formatCurrency(session.netResult)}
                      color={session.netResult >= 0 ? "success" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View session details">
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
        count={sessions.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default GameSessionsTable;