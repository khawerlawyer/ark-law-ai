let users = [];

function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Import users from global storage if available
    if (global.arkLawUsers) {
      users = global.arkLawUsers;
    }

    console.log('Login attempt for:', email);
    console.log('Total users in database:', users.length);

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const hashedPassword = hashPassword(password);
    console.log('Password match:', user.password === hashedPassword);
    
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful for:', user.email);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during login',
      details: error.message 
    });
  }
}
