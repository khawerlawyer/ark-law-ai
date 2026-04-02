// Initialize global users array - this persists across requests during server runtime
if (typeof global.arkLawUsers === 'undefined') {
  global.arkLawUsers = [];
  console.log('✅ Initialized arkLawUsers array');
}

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
    console.log('📊 Current users in database:', global.arkLawUsers.length);

    // Check if user already exists
    const existingUser = global.arkLawUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log('❌ User already exists:', email);
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

    // Add to global array
    global.arkLawUsers.push(newUser);

    console.log('✅ User created successfully:', email);
    console.log('📊 Total users now:', global.arkLawUsers.length);
    console.log('👥 All users:', global.arkLawUsers.map(u => u.email));

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
