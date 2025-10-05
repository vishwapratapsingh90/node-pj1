const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const ENV_NAME = process.env.ENV_NAME || 'dev';

// Database configurations for different environments
const dbConfigs = {
    dev: {
        host: process.env.DB_DEV_HOST || 'localhost',
        user: process.env.DB_DEV_USER || 'root',
        password: process.env.DB_DEV_PASSWORD || '',
        database: process.env.DB_DEV_NAME || 'myapp_dev',
        port: process.env.DB_DEV_PORT || 3306,
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    test: {
        host: process.env.DB_TEST_HOST || 'localhost',
        user: process.env.DB_TEST_USER || 'root',
        password: process.env.DB_TEST_PASSWORD || '',
        database: process.env.DB_TEST_NAME || 'myapp_test',
        port: process.env.DB_TEST_PORT || 3306,
        connectionLimit: 5,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    staging: {
        host: process.env.DB_STAGING_HOST || 'localhost',
        user: process.env.DB_STAGING_USER || 'root',
        password: process.env.DB_STAGING_PASSWORD || '',
        database: process.env.DB_STAGING_NAME || 'myapp_staging',
        port: process.env.DB_STAGING_PORT || 3306,
        connectionLimit: 15,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    prod: {
        host: process.env.DB_PROD_HOST || 'localhost',
        user: process.env.DB_PROD_USER || 'root',
        password: process.env.DB_PROD_PASSWORD || '',
        database: process.env.DB_PROD_NAME || 'myapp_prod',
        port: process.env.DB_PROD_PORT || 3306,
        connectionLimit: 20,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        ssl: process.env.DB_PROD_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false
    }
};

// Get the current environment configuration
const getCurrentConfig = () => {
    const config = dbConfigs[ENV_NAME];
    if (!config) {
        throw new Error(`Database configuration not found for environment: ${ENV_NAME}`);
    }
    return config;
};

// Create MySQL connection using mysql2 (recommended) or mysql
let mysql;
let pool;

try {
    // Try to use mysql2 first (more performant and supports promises)
    mysql = require('mysql2');
} catch (error) {
    try {
        // Fallback to mysql
        mysql = require('mysql');
    } catch (fallbackError) {
        console.error('Neither mysql2 nor mysql package is installed. Please install one of them:');
        console.error('npm install mysql2');
        console.error('or');
        console.error('npm install mysql');
        process.exit(1);
    }
}

// Create connection pool
const createPool = () => {
    try {
        const config = getCurrentConfig();
        console.log(`Connecting to MySQL database for environment: ${ENV_NAME}`);
        console.log(`Database: ${config.database} on ${config.host}:${config.port}`);
        
        pool = mysql.createPool(config);
        
        // Test the connection
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error connecting to MySQL database:', err.message);
                return;
            }
            console.log(`Successfully connected to MySQL database: ${config.database}`);
            connection.release();
        });
        
        return pool;
    } catch (error) {
        console.error('Error creating database pool:', error.message);
        throw error;
    }
};

// Initialize the pool
const getPool = () => {
    if (!pool) {
        pool = createPool();
    }
    return pool;
};

// Utility function to execute queries
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const pool = getPool();
        pool.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// Close the connection pool
const closePool = () => {
    if (pool) {
        pool.end((err) => {
            if (err) {
                console.error('Error closing database pool:', err.message);
            } else {
                console.log('Database pool closed successfully');
            }
        });
    }
};

module.exports = {
    getCurrentConfig,
    getPool,
    query,
    closePool,
    ENV_NAME
};