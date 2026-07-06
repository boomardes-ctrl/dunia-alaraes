import bcrypt from 'bcryptjs';
import db from './db.js';

const hash = bcrypt.hashSync('1234', 10);
db.prepare('UPDATE admins SET password = ? WHERE id = 1').run(hash);
console.log('Password changed to 1234');
process.exit(0);
