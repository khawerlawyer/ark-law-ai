import fs from 'fs';
import path from 'path';

// Path to store users data
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read users from file
export function readUsers() {
  ensureDataDir();
  
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading users file:', error);
  }
  
  return [];
}

// Write users to file
export function writeUsers(users) {
  ensureDataDir();
  
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

// Add a user
export function addUser(user) {
  const users = readUsers();
  users.push(user);
  return writeUsers(users);
}

// Find user by email
export function findUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Get all users
export function getAllUsers() {
  return readUsers();
}
