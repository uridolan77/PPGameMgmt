import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Box
} from "@mui/material";
import { Casino as GameIcon } from "@mui/icons-material";

const TopGamesCard = ({ games = [] }) => {
  const getGameTypeColor = (type) => {
    switch(type) {
      case "Slot":
        return "primary";
      case "Table":
        return "secondary";
      case "LiveDealer":
        return "error";
      default:
        return "default";
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case "Popular":
        return "success";
      case "Progressive":
        return "warning";
      case "Live":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <GameIcon sx={{ mr: 1 }} /> 
          Top Played Games
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Game Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Play Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {games.length > 0 ? (
                games.map((game) => (
                  <TableRow key={game.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {game.name}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={game.type} 
                        color={getGameTypeColor(game.type)} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={game.category} 
                        color={getCategoryColor(game.category)} 
                        size="small"
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      {game.playCount?.toLocaleString() || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No game data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TopGamesCard;