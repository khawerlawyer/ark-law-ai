// Ensure global array exists
if (typeof global.arkLawUsers === 'undefined') {
  global.arkLawUsers = [];
  console.log('⚠️ Warning: arkLawUsers was not initialized. Creating empty array.');
}

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

    console.log('🔐 Login attempt for:', email);
    console.log('📊 Total users in database:', global.arkLawUsers.length);
    console.log('👥 Available users:', global.arkLawUsers.map(u => u.email));

    // Find user (case-insensitive email)
    const user = global.arkLawUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ User found:', user.email);

    // Check password
    const hashedPassword = hashPassword(password);
    console.log('🔑 Comparing passwords...');
    console.log('   Provided (hashed):', hashedPassword);
    console.log('   Stored (hashed):', user.password);
    
    if (user.password !== hashedPassword) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', user.email);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during login',
      details: error.message 
    });
  }
}
