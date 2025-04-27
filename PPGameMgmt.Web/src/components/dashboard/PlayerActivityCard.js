import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip
} from "@mui/material";
import { Person as PersonIcon, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const PlayerActivityCard = ({ players = [], title = "Recent Player Activity" }) => {
  const theme = useTheme();

  const getSegmentColor = (segment) => {
    switch(segment) {
      case "VIP":
        return theme.palette.success.main;
      case "Regular":
        return theme.palette.primary.main;
      case "New":
        return theme.palette.info.main;
      case "Dormant":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          {title}
        </Typography>

        {players.length === 0 ? (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              No recent player activity to display
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {players.map((player, index) => (
              <React.Fragment key={player.id || index}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getSegmentColor(player.segment) }}>
                      {player.name ? player.name.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body1">{player.name}</Typography>
                        <Chip 
                          label={player.segment} 
                          size="small"
                          sx={{ 
                            backgroundColor: getSegmentColor(player.segment),
                            color: "#fff",
                            fontSize: "0.7rem"
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          {player.activity}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Typography variant="caption" color="textSecondary">
                            {player.timestamp}
                          </Typography>
                          <Box ml={1} display="flex" alignItems="center">
                            {player.change > 0 ? (
                              <>
                                <ArrowUpward fontSize="small" color="success" sx={{ fontSize: 14 }} />
                                <Typography variant="caption" color="success.main" fontWeight="medium">
                                  ${player.change}
                                </Typography>
                              </>
                            ) : player.change < 0 ? (
                              <>
                                <ArrowDownward fontSize="small" color="error" sx={{ fontSize: 14 }} />
                                <Typography variant="caption" color="error" fontWeight="medium">
                                  ${Math.abs(player.change)}
                                </Typography>
                              </>
                            ) : null}
                          </Box>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerActivityCard;