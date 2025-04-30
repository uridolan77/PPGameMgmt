-- Enable slow query logging in MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Log queries that take more than 1 second
SET GLOBAL slow_query_log_file = '/var/log/mysql/mysql-slow.log';

-- Show current slow query log status
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- If you want to see the current running queries
SHOW PROCESSLIST;

-- To check if there are any locked tables
SHOW OPEN TABLES WHERE in_use > 0;

-- To check table statistics
SHOW TABLE STATUS;

-- To check index usage (requires performance_schema to be enabled)
SELECT object_schema, object_name, index_name, count_star, count_fetch
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'pp_recommeder_db'
ORDER BY count_star DESC;

-- Note: To disable slow query logging when done
-- SET GLOBAL slow_query_log = 'OFF';
