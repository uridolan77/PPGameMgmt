import React, { useState } from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const segments = [
  { value: "VIP", color: "#2e7d32", description: "High value, frequent players with significant spending" },
  { value: "Regular", color: "#1976d2", description: "Active players with consistent play patterns" },
  { value: "New", color: "#0288d1", description: "Recently registered players still exploring the platform" },
  { value: "Dormant", color: "#ff9800", description: "Inactive players who haven't played recently" },
];

const PlayerSegmentSelector = ({ currentSegment, onSegmentChange }) => {
  const [selectedSegment, setSelectedSegment] = useState(currentSegment);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetSegment, setTargetSegment] = useState(null);

  const handleSegmentChange = (event, newSegment) => {
    if (newSegment && newSegment !== currentSegment) {
      setTargetSegment(newSegment);
      setDialogOpen(true);
    }
  };

  const handleConfirmChange = () => {
    setSelectedSegment(targetSegment);
    setDialogOpen(false);
    onSegmentChange(targetSegment);
  };

  const handleCancelChange = () => {
    setDialogOpen(false);
    setTargetSegment(null);
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Change the player segment to adjust marketing strategies and bonus eligibility
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={selectedSegment}
        exclusive
        onChange={handleSegmentChange}
        aria-label="player segment"
        sx={{ 
          display: "flex", 
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            flex: "1 0 auto",
            minWidth: "120px",
            p: 2,
            m: 0.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          },
          "& .Mui-selected": {
            fontWeight: "bold",
          }
        }}
      >
        {segments.map((segment) => (
          <ToggleButton
            key={segment.value}
            value={segment.value}
            sx={{
              "&.Mui-selected": {
                backgroundColor: `${segment.color}20`,
                color: segment.color,
                borderColor: segment.color,
              },
              "&:hover": {
                backgroundColor: `${segment.color}10`,
              },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" component="div">
                {segment.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {segment.description}
              </Typography>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancelChange}
        aria-labelledby="segment-change-dialog-title"
      >
        <DialogTitle id="segment-change-dialog-title">
          Change Player Segment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change this player's segment from{" "}
            <strong>{currentSegment}</strong> to{" "}
            <strong>{targetSegment}</strong>? This will affect the bonuses and
            recommendations they are eligible for.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelChange} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmChange} color="primary" autoFocus>
            Change Segment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlayerSegmentSelector;