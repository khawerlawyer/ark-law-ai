import { readUsers, writeUsers, findUserByEmail } from '../../../lib/userDatabase';

function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

export default async function handler(req, res) {
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

    // Validate required fields
    if (!email || !password || !name || !age || !profession || !city || !province || !country) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('📝 Signup attempt for:', email);

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password: hashPassword(password),
      name,
      age: parseInt(age),
      profession,
      barOfPractice: barOfPractice || '',
      city,
      province,
      country,
      tokens: 500000, // Start with 500K tokens
      chatHistory: [], // Empty chat history
      createdAt: new Date().toISOString(),
    };

    // Add to file database
    const users = readUsers();
    users.push(newUser);
    const saved = writeUsers(users);

    if (!saved) {
      return res.status(500).json({ error: 'Failed to save user data' });
    }

    console.log('✅ User created successfully:', email);
    console.log('📊 Total users now:', users.length);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during signup',
      details: error.message 
    });
  }
}
