import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  CalendarToday,
  AttachMoney,
  Smartphone,
  Public,
  AccessTime,
} from "@mui/icons-material";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const PlayerInfoCard = ({ player, playerValue }) => {
  const getSegmentColor = (segment) => {
    switch (segment) {
      case "VIP":
        return "success";
      case "Regular":
        return "primary";
      case "New":
        return "info";
      case "Dormant":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "2rem",
              mb: 2,
            }}
          >
            {player.username ? player.username[0].toUpperCase() : "U"}
          </Avatar>
          <Typography variant="h5" component="h1" gutterBottom>
            {player.firstName} {player.lastName}
          </Typography>
          <Chip
            label={player.segment}
            color={getSegmentColor(player.segment)}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccountCircle sx={{ color: "text.secondary", mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1">{player.username}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Email sx={{ color: "text.secondary", mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{player.email}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarToday sx={{ color: "text.secondary", mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Registered
              </Typography>
              <Typography variant="body1">{formatDate(player.registrationDate)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTime sx={{ color: "text.secondary", mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Login
              </Typography>
              <Typography variant="body1">{formatDate(player.lastLoginDate)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Smartphone sx={{ color: "text.secondary", mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Preferred Device
              </Typography>
              <Typography variant="body1">{player.preferredDevice || "Not specified"}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Public sx={{ color: "text.secondary", mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Country
              </Typography>
              <Typography variant="body1">{player.country}</Typography>
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AttachMoney color="success" sx={{ mr: 1 }} />
          <Typography variant="h6" color="success.main" gutterBottom>
            Player Value: ${playerValue?.toFixed(2) || "0.00"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlayerInfoCard;