/**
 * Database Initialization Script
 * Creates necessary tables and inserts demo data by reading from setup.sql
 */

const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Parse SQL file and extract executable statements
 * @param {string} sqlContent - Content of the SQL file
 * @returns {Array} Array of SQL statements
 */
const parseSQLFile = (sqlContent) => {
    // Remove comments (-- style and /* */ style)
    let cleanContent = sqlContent
        .replace(/--.*$/gm, '') // Remove -- comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
        .replace(/^\s*$/gm, '') // Remove empty lines
        .trim();
    
    // Split by semicolon and filter out empty statements
    const statements = cleanContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.toLowerCase().startsWith('select'));
    
    return statements;
};

/**
 * Read and execute SQL statements from setup.sql file
 */
const executeSQLFile = async () => {
    try {
        const sqlFilePath = path.join(__dirname, 'setup.sql');
        
        if (!fs.existsSync(sqlFilePath)) {
            throw new Error('setup.sql file not found');
        }
        
        console.log('Reading SQL statements from setup.sql...');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        const statements = parseSQLFile(sqlContent);
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            
            try {
                await query(statement);
                
                // Log what was executed
                if (statement.toLowerCase().includes('create table')) {
                    const tableName = statement.match(/create table[^`]*`?(\w+)`?/i)?.[1];
                    console.log(`✓ Table '${tableName}' created/verified`);
                } else if (statement.toLowerCase().includes('insert into')) {
                    const tableName = statement.match(/insert into[^`]*`?(\w+)`?/i)?.[1];
                    console.log(`✓ Data inserted into '${tableName}' table`);
                } else {
                    console.log(`✓ Statement executed successfully`);
                }
            } catch (error) {
                console.error(`✗ Error executing statement ${i + 1}:`, error.message);
                console.error('Statement:', statement.substring(0, 100) + '...');
                // Continue with next statement instead of failing completely
            }
        }
        
        return { success: true, statementsExecuted: statements.length };
        
    } catch (error) {
        console.error('Error reading or executing SQL file:', error.message);
        throw error;
    }
};

/**
 * Initialize the database with required tables and demo data
 */
const initializeDatabase = async () => {
    try {
        console.log('Starting database initialization from setup.sql...');
        
        // Execute all statements from setup.sql
        const result = await executeSQLFile();
        
        // Verify the setup by checking for users
        try {
            const users = await query('SELECT id, username, created_at FROM pj1_credentials LIMIT 5');
            console.log('✓ Database initialization completed successfully');
            console.log(`Available users: ${users.map(u => u.username).join(', ')}`);
            
            return {
                success: true,
                message: 'Database initialized successfully from setup.sql',
                userCount: users.length,
                statementsExecuted: result.statementsExecuted
            };
        } catch (verificationError) {
            console.warn('Database initialized but verification failed:', verificationError.message);
            return {
                success: true,
                message: 'Database initialized (verification failed)',
                statementsExecuted: result.statementsExecuted
            };
        }
        
    } catch (error) {
        console.error('✗ Database initialization failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Check if the database is properly set up
 */
const checkDatabaseSetup = async () => {
    try {
        const users = await query('SELECT COUNT(*) as count FROM pj1_credentials');
        return {
            success: true,
            userCount: users[0].count
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Run initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase()
        .then((result) => {
            if (result.success) {
                console.log('Database setup completed!');
                process.exit(0);
            } else {
                console.error('Database setup failed:', result.error);
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = {
    initializeDatabase,
    checkDatabaseSetup
};