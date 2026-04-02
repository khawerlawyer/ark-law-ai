// Simple signup API - No file system needed
// This stores users in memory (will reset when server restarts)

let users = [];

function hashPassword(password) {
  // Simple hash for now
  return Buffer.from(password).toString('base64');
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      password,
      name,
      age,
      profession,
      barOfPractice,
      city,
      province,
      country,
    } = req.body;

    // Check required fields
    if (!email || !password || !name || !age || !profession || !city || !province || !country) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashPassword(password),
      name,
      age: parseInt(age),
      profession,
      barOfPractice: barOfPractice || '',
      city,
      province,
      country,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    console.log('User created:', newUser.email);
    console.log('Total users:', users.length);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created su
