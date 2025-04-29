using System.Collections.Generic;

namespace PPGameMgmt.Core.Models
{
    /// <summary>
    /// Represents a paged result set
    /// </summary>
    /// <typeparam name="T">Type of items in the result set</typeparam>
    public class PagedResult<T>
    {
        /// <summary>
        /// The items in the current page
        /// </summary>
        public IEnumerable<T> Items { get; set; }
        
        /// <summary>
        /// The current page number (1-based)
        /// </summary>
        public int PageNumber { get; set; }
        
        /// <summary>
        /// The number of items per page
        /// </summary>
        public int PageSize { get; set; }
        
        /// <summary>
        /// The total number of items across all pages
        /// </summary>
        public int TotalCount { get; set; }
        
        /// <summary>
        /// The total number of pages
        /// </summary>
        public int TotalPages { get; set; }
        
        /// <summary>
        /// Whether there is a previous page
        /// </summary>
        public bool HasPrevious => PageNumber > 1;
        
        /// <summary>
        /// Whether there is a next page
        /// </summary>
        public bool HasNext => PageNumber < TotalPages;
        
        /// <summary>
        /// Creates a new paged result
        /// </summary>
        public PagedResult(IEnumerable<T> items, int count, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = count;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalPages = (int)System.Math.Ceiling(count / (double)pageSize);
        }
        
        /// <summary>
        /// Creates an empty paged result
        /// </summary>
        public static PagedResult<T> Empty => new PagedResult<T>(new List<T>(), 0, 0, 10);
    }
}
