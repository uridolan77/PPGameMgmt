using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Generic repository interface
    /// </summary>
    [Obsolete("Use PPGameMgmt.Core.Interfaces.Repositories.IRepository<T> instead")]
    public interface IRepository<T> where T : class
    {
        // This interface is deprecated. Use PPGameMgmt.Core.Interfaces.Repositories.IRepository<T> instead
    }
}