using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace PPGameMgmt.Core.Specifications
{
    /// <summary>
    /// Interface for specifications that support including related entities
    /// </summary>
    public interface IIncludeSpecification<T>
    {
        /// <summary>
        /// Collection of expressions to include related entities
        /// </summary>
        IReadOnlyCollection<Expression<Func<T, object>>> Includes { get; }
        
        /// <summary>
        /// Collection of string paths to include related entities
        /// </summary>
        IReadOnlyCollection<string> IncludeStrings { get; }
    }
    
    /// <summary>
    /// Interface for specifications that support ordering
    /// </summary>
    public interface IOrderSpecification<T>
    {
        /// <summary>
        /// Expression for primary ordering ascending
        /// </summary>
        Expression<Func<T, object>>? OrderBy { get; }
        
        /// <summary>
        /// Expression for primary ordering descending
        /// </summary>
        Expression<Func<T, object>>? OrderByDescending { get; }
        
        /// <summary>
        /// Expression for secondary ordering ascending
        /// </summary>
        Expression<Func<T, object>>? ThenBy { get; }
        
        /// <summary>
        /// Expression for secondary ordering descending
        /// </summary>
        Expression<Func<T, object>>? ThenByDescending { get; }
    }
}