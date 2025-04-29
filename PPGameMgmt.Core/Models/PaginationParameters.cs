namespace PPGameMgmt.Core.Models
{
    /// <summary>
    /// Parameters for pagination
    /// </summary>
    public class PaginationParameters
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 10;
        private int _pageNumber = 1;
        
        /// <summary>
        /// Page number (1-based)
        /// </summary>
        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = value < 1 ? 1 : value;
        }
        
        /// <summary>
        /// Number of items per page
        /// </summary>
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? 1 : value;
        }
    }
}
