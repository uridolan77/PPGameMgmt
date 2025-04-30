-- This is a SQL script to update the application configuration in the database
-- to disable Redis timeouts or use in-memory caching instead

-- Note: This assumes you have a configuration table in your database
-- If you don't, you'll need to modify the appsettings.json file instead

-- Example of how to update a configuration table if it exists:
-- UPDATE app_configuration 
-- SET value = 'InMemory' 
-- WHERE key = 'Caching:Provider';

-- UPDATE app_configuration 
-- SET value = '500' 
-- WHERE key = 'Caching:Redis:ConnectTimeout';

-- Since we don't know if you have a configuration table,
-- you should modify the appsettings.json file directly:
-- 1. Open appsettings.json
-- 2. Find the Redis connection string
-- 3. Either:
--    a. Change the connection timeout to a lower value: "localhost:6379,abortConnect=false,connectTimeout=1000"
--    b. Or switch to in-memory caching by adding a "Caching:Provider" setting set to "InMemory"
