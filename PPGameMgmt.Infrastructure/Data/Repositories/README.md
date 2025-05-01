# Enhanced Repository Pattern Implementation

This document describes the enhanced Repository Pattern implementation in the PPGameMgmt application.

## Overview

The Repository Pattern has been enhanced to:

1. Reduce code duplication across repositories
2. Centralize error handling directly in the repositories
3. Support the Specification Pattern for complex queries
4. Improve maintainability and testability

## Key Components

### Repository<T> Base Class

The `Repository<T>` base class provides a robust implementation of the Repository Pattern with integrated exception handling. It serves as the foundation for all entity-specific repositories.

```csharp
public class Repository<T> : IRepository<T> where T : class
{
    // Base implementation with exception handling
}
```

### IRepository<T> Interface

The `IRepository<T>` interface defines the standard operations for repositories:

```csharp
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(string id);
    Task DeleteAsync(T entity);
    // ... additional methods
}
```

### Specification Pattern

The Specification Pattern allows you to define reusable query specifications:

#### BaseSpecification<T>

```csharp
public abstract class BaseSpecification<T> : Specification<T>,
    IIncludeSpecification<T>, IOrderSpecification<T>
{
    // Base implementation with include and ordering support
}
```

#### SpecificationEvaluator<T>

```csharp
public class SpecificationEvaluator<T> where T : class
{
    public static IQueryable<T> GetQuery(IQueryable<T> inputQuery, Specification<T> specification)
    {
        // Applies the specification to the query
    }
}
```

## How to Use

### Creating a Concrete Repository

```csharp
public class GameRepository : Repository<Game>, IGameRepository
{
    public GameRepository(CasinoDbContext context, ILogger<GameRepository> logger = null)
        : base(context, logger)
    {
    }
    
    // Implement additional methods specific to Game entities
}
```

### Creating Specifications

```csharp
public class ActivePlayersSpecification : BaseSpecification<Player>
{
    public ActivePlayersSpecification(int daysActive)
        : base(p => p.LastLoginDate >= DateTime.UtcNow.AddDays(-daysActive))
    {
        ApplyOrderByDescending(p => p.LastLoginDate);
    }
}
```

### Using Specifications in Repositories

```csharp
public async Task<IEnumerable<Player>> GetActivePlayersAsync(int daysActive)
{
    var specification = new ActivePlayersSpecification(daysActive);
    return await FindWithSpecificationAsync(specification);
}
```

### Error Handling

All repository methods automatically handle exceptions through the `ExecuteRepositoryOperationAsync` method:

```csharp
// This method is protected in Repository<T>
protected virtual async Task<T> ExecuteRepositoryOperationAsync<T>(
    Func<Task<T>> operation, 
    string errorMessage)
{
    try
    {
        return await operation();
    }
    catch (Exception ex)
    {
        // Standardized exception handling
    }
}
```

## Benefits

- **Reduced Code Duplication**: Exception handling is centralized
- **Enhanced Maintainability**: Domain logic is separated from data access concerns
- **Better Reusability**: Specifications can be reused and combined
- **Consistent Error Handling**: All repositories handle errors in the same way

## Migrating from the Old Pattern

The `RepositoryExceptionHandler` class has been deprecated in favor of the integrated exception handling in `Repository<T>`. If you have repositories that don't extend `Repository<T>`, you can either:

1. Refactor them to extend `Repository<T>`
2. Use the `ExecuteRepositoryOperationAsync` pattern directly in your custom repositories

## Example Migration

```csharp
// Old approach
public async Task<Game> GetByIdAsync(string id)
{
    return await RepositoryExceptionHandler.ExecuteAsync(
        async () => {
            return await _context.Games.FindAsync(id);
        },
        "Game",
        $"Error retrieving game with ID: {id}",
        _logger
    );
}

// New approach
public async Task<Game> GetByIdAsync(string id)
{
    var specification = new GameByIdSpecification(id);
    return await FindWithSpecificationAsync(specification);
}
```