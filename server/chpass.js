import bcrypt from 'bcryptjs';
import db from './db.js';

const hash = bcrypt.hashSync('123456', 10);
db.prepare('UPDATE admins SET password = ? WHERE id = 1').run(hash);
console.log('Password changed to 123456');
process.exit(0);
