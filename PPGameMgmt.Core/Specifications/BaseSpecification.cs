using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace PPGameMgmt.Core.Specifications
{
    /// <summary>
    /// Base specification class with includes and ordering support
    /// </summary>
    public abstract class BaseSpecification<T> : Specification<T>, 
        IIncludeSpecification<T>, IOrderSpecification<T>
    {
        private readonly List<Expression<Func<T, object>>> _includes = new();
        private readonly List<string> _includeStrings = new();
        
        public BaseSpecification() 
        {
            // Initialize properties to avoid null reference warnings
            Criteria = _ => true;
            // Initialize ordering properties
            OrderBy = x => 0;
            OrderByDescending = x => 0;
            ThenBy = x => 0;
            ThenByDescending = x => 0;
        }
        
        public BaseSpecification(Expression<Func<T, bool>> criteria) 
        { 
            Criteria = criteria;
            // Initialize ordering properties
            OrderBy = x => 0;
            OrderByDescending = x => 0;
            ThenBy = x => 0;
            ThenByDescending = x => 0;
        }
            
        /// <summary>
        /// Returns the criteria expression
        /// </summary>
        public override Expression<Func<T, bool>> ToExpression() => Criteria;
        
        // Implement IIncludeSpecification
        public IReadOnlyCollection<Expression<Func<T, object>>> Includes => _includes.AsReadOnly();
        public IReadOnlyCollection<string> IncludeStrings => _includeStrings.AsReadOnly();
        
        // Implement IOrderSpecification with explicit implementation
        Expression<Func<T, object>> IOrderSpecification<T>.OrderBy => OrderBy;
        Expression<Func<T, object>> IOrderSpecification<T>.OrderByDescending => OrderByDescending;
        Expression<Func<T, object>> IOrderSpecification<T>.ThenBy => ThenBy;
        Expression<Func<T, object>> IOrderSpecification<T>.ThenByDescending => ThenByDescending;
        
        // Internal properties that can be null
        private Expression<Func<T, object>> OrderBy { get; set; }
        private Expression<Func<T, object>> OrderByDescending { get; set; }
        private Expression<Func<T, object>> ThenBy { get; set; }
        private Expression<Func<T, object>> ThenByDescending { get; set; }
        
        // Base criteria expression
        protected Expression<Func<T, bool>> Criteria { get; }
        
        /// <summary>
        /// Add an include expression
        /// </summary>
        protected void AddInclude(Expression<Func<T, object>> includeExpression)
        {
            _includes.Add(includeExpression);
        }
        
        /// <summary>
        /// Add a string-based include path
        /// </summary>
        protected void AddInclude(string includeString)
        {
            _includeStrings.Add(includeString);
        }
        
        /// <summary>
        /// Add an order by expression (ascending)
        /// </summary>
        protected void ApplyOrderBy(Expression<Func<T, object>> orderByExpression)
        {
            OrderBy = orderByExpression;
        }
        
        /// <summary>
        /// Add an order by expression (descending)
        /// </summary>
        protected void ApplyOrderByDescending(Expression<Func<T, object>> orderByDescendingExpression)
        {
            OrderByDescending = orderByDescendingExpression;
        }
        
        /// <summary>
        /// Add a then by expression (ascending)
        /// </summary>
        protected void ApplyThenBy(Expression<Func<T, object>> thenByExpression)
        {
            ThenBy = thenByExpression;
        }
        
        /// <summary>
        /// Add a then by expression (descending)
        /// </summary>
        protected void ApplyThenByDescending(Expression<Func<T, object>> thenByDescendingExpression)
        {
            ThenByDescending = thenByDescendingExpression;
        }
    }
}