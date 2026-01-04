const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in your SQL file (admin_auth_schema.sql)');
}

generateHash();
