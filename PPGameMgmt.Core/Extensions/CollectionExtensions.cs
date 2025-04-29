using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Extensions
{
    /// <summary>
    /// Extension methods for collections
    /// </summary>
    public static class CollectionExtensions
    {
        /// <summary>
        /// Asynchronously determines whether a sequence returned by a task contains any elements.
        /// </summary>
        /// <typeparam name="T">The type of the elements in the sequence</typeparam>
        /// <param name="taskSequence">Task returning an IEnumerable to check for elements</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains true if the source sequence contains any elements; otherwise, false.</returns>
        public static async Task<bool> AnyAsync<T>(this Task<IEnumerable<T>> taskSequence)
        {
            if (taskSequence == null)
                throw new ArgumentNullException(nameof(taskSequence));

            var sequence = await taskSequence;
            return sequence.Any();
        }

        /// <summary>
        /// Asynchronously determines whether any element of a sequence returned by a task satisfies a condition.
        /// </summary>
        /// <typeparam name="T">The type of the elements in the sequence</typeparam>
        /// <param name="taskSequence">Task returning an IEnumerable to check</param>
        /// <param name="predicate">A function to test each element for a condition</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains true if any elements in the source sequence pass the test in the predicate; otherwise, false.</returns>
        public static async Task<bool> AnyAsync<T>(this Task<IEnumerable<T>> taskSequence, Func<T, bool> predicate)
        {
            if (taskSequence == null)
                throw new ArgumentNullException(nameof(taskSequence));
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            var sequence = await taskSequence;
            return sequence.Any(predicate);
        }
    }
}