const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_D3eOgYVXL1TC@ep-summer-water-aim1ymkd-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

async function checkTables() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log("TABLES IN NEONDB:");
        res.rows.forEach(r => console.log("- " + r.table_name));

        const res2 = await client.query('SELECT COUNT(*) FROM products;');
        console.log("PRODUCTS COUNT:", res2.rows[0].count);
    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        await client.end();
    }
}

checkTables();
