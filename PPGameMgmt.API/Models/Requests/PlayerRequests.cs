using System;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Models.Requests
{
    /// <summary>
    /// Request model for updating a player's segment
    /// </summary>
    public class PlayerSegmentUpdateRequest
    {
        /// <summary>
        /// The new segment for the player
        /// </summary>
        public PlayerSegment Segment { get; set; }
    }
    
    /// <summary>
    /// Request model for creating a new player
    /// </summary>
    public class CreatePlayerRequest
    {
        /// <summary>
        /// Username for the player
        /// </summary>
        public string Username { get; set; }
        
        /// <summary>
        /// Email address for the player
        /// </summary>
        public string Email { get; set; }
        
        /// <summary>
        /// Country code for the player
        /// </summary>
        public string Country { get; set; }
        
        /// <summary>
        /// Initial segment for the player
        /// </summary>
        public PlayerSegment? Segment { get; set; }
    }
    
    /// <summary>
    /// Request model for updating a player
    /// </summary>
    public class UpdatePlayerRequest
    {
        /// <summary>
        /// Email address for the player
        /// </summary>
        public string Email { get; set; }
        
        /// <summary>
        /// Country code for the player
        /// </summary>
        public string Country { get; set; }
    }
}
