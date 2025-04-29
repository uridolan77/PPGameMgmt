using System;
using System.Linq;
using System.Linq.Expressions;

namespace PPGameMgmt.Core.Specifications
{
    /// <summary>
    /// Base abstract class for specifications
    /// </summary>
    /// <typeparam name="T">Type of entity the specification applies to</typeparam>
    public abstract class Specification<T>
    {
        /// <summary>
        /// Converts the specification to a LINQ expression
        /// </summary>
        /// <returns>A LINQ expression representing the specification</returns>
        public abstract Expression<Func<T, bool>> ToExpression();

        /// <summary>
        /// Determines whether an entity satisfies the specification
        /// </summary>
        /// <param name="entity">Entity to check</param>
        /// <returns>True if the entity satisfies the specification</returns>
        public bool IsSatisfiedBy(T entity) => ToExpression().Compile()(entity);

        /// <summary>
        /// Creates a new specification that is the logical AND of this specification and another
        /// </summary>
        /// <param name="specification">Specification to AND with this one</param>
        /// <returns>A new specification</returns>
        public Specification<T> And(Specification<T> specification) => new AndSpecification<T>(this, specification);

        /// <summary>
        /// Creates a new specification that is the logical OR of this specification and another
        /// </summary>
        /// <param name="specification">Specification to OR with this one</param>
        /// <returns>A new specification</returns>
        public Specification<T> Or(Specification<T> specification) => new OrSpecification<T>(this, specification);

        /// <summary>
        /// Creates a new specification that is the logical NOT of this specification
        /// </summary>
        /// <returns>A new specification</returns>
        public Specification<T> Not() => new NotSpecification<T>(this);
    }

    /// <summary>
    /// Specification representing a logical AND of two specifications
    /// </summary>
    /// <typeparam name="T">Type of entity the specification applies to</typeparam>
    public class AndSpecification<T> : Specification<T>
    {
        private readonly Specification<T> _left;
        private readonly Specification<T> _right;

        public AndSpecification(Specification<T> left, Specification<T> right)
        {
            _left = left;
            _right = right;
        }

        public override Expression<Func<T, bool>> ToExpression()
        {
            var leftExpression = _left.ToExpression();
            var rightExpression = _right.ToExpression();

            // Create parameter for the combined expression
            var parameter = Expression.Parameter(typeof(T), "x");

            // Invoke both expressions with the parameter
            var leftBody = ReplaceParameter(leftExpression.Body, leftExpression.Parameters[0], parameter);
            var rightBody = ReplaceParameter(rightExpression.Body, rightExpression.Parameters[0], parameter);

            // Combine the expressions with AND
            var body = Expression.AndAlso(leftBody, rightBody);

            // Create and return the lambda expression
            return Expression.Lambda<Func<T, bool>>(body, parameter);
        }

        private static Expression ReplaceParameter(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            var visitor = new ParameterReplaceVisitor(oldParameter, newParameter);
            return visitor.Visit(expression);
        }
    }

    /// <summary>
    /// Specification representing a logical OR of two specifications
    /// </summary>
    /// <typeparam name="T">Type of entity the specification applies to</typeparam>
    public class OrSpecification<T> : Specification<T>
    {
        private readonly Specification<T> _left;
        private readonly Specification<T> _right;

        public OrSpecification(Specification<T> left, Specification<T> right)
        {
            _left = left;
            _right = right;
        }

        public override Expression<Func<T, bool>> ToExpression()
        {
            var leftExpression = _left.ToExpression();
            var rightExpression = _right.ToExpression();
            
            // Create parameter for the combined expression
            var parameter = Expression.Parameter(typeof(T), "x");
            
            // Invoke both expressions with the parameter
            var leftBody = ReplaceParameter(leftExpression.Body, leftExpression.Parameters[0], parameter);
            var rightBody = ReplaceParameter(rightExpression.Body, rightExpression.Parameters[0], parameter);
            
            // Combine the expressions with OR
            var body = Expression.OrElse(leftBody, rightBody);
            
            // Create and return the lambda expression
            return Expression.Lambda<Func<T, bool>>(body, parameter);
        }
        
        private static Expression ReplaceParameter(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            var visitor = new ParameterReplaceVisitor(oldParameter, newParameter);
            return visitor.Visit(expression);
        }
    }

    /// <summary>
    /// Specification representing a logical NOT of a specification
    /// </summary>
    /// <typeparam name="T">Type of entity the specification applies to</typeparam>
    public class NotSpecification<T> : Specification<T>
    {
        private readonly Specification<T> _specification;

        public NotSpecification(Specification<T> specification)
        {
            _specification = specification;
        }

        public override Expression<Func<T, bool>> ToExpression()
        {
            var expression = _specification.ToExpression();
            var body = Expression.Not(expression.Body);
            return Expression.Lambda<Func<T, bool>>(body, expression.Parameters);
        }
    }

    /// <summary>
    /// Expression visitor that replaces parameters in expressions
    /// </summary>
    internal class ParameterReplaceVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _oldParameter;
        private readonly ParameterExpression _newParameter;

        public ParameterReplaceVisitor(ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            _oldParameter = oldParameter;
            _newParameter = newParameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _oldParameter ? _newParameter : base.VisitParameter(node);
        }
    }
}