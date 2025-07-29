const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; 

// Fungsi register
exports.register = async (req, res) => {
    const { username, email, password, full_name, role } = req.body;
    try {
        const existingUsername = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (existingUsername.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        const existingEmail = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'admin'; 
        const userFullName = full_name || username; 

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, full_name, role',
            [username, email, hashedPassword, userFullName, userRole]
        );
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

exports.login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Username/Email and password are required.' });
    }

    try {
        const result = await pool.query(
            'SELECT user_id, username, email, password_hash, role, full_name FROM users WHERE username = $1 OR email = $1',
            [usernameOrEmail]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Buat JWT dengan user_id
        const token = jwt.sign(
            { id: user.user_id, username: user.username, role: user.role }, 
            JWT_SECRET,
            { expiresIn: '1h' } 
        );

        const userData = {
            user_id: user.user_id, 
            username: user.username,
            email: user.email,
            fullName: user.full_name, 
            role: user.role
        };

        res.status(200).json({
            message: 'Logged in successfully',
            accessToken: token,
            userData: userData 
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// Middleware verifyToken
exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'Token not provided.' });

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        try {
            const userResult = await pool.query('SELECT user_id, username, email, full_name, role FROM users WHERE user_id = $1', [decoded.id]); // decoded.id adalah user_id dari JWT
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            req.user = userResult.rows[0];
            next();
        } catch (dbError) {
            console.error('Database error fetching user for token verification:', dbError);
            res.status(500).json({ message: 'Internal server error during token verification.' });
        }
    });
};

exports.getMe = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    const userData = {
        user_id: req.user.user_id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.full_name, 
        role: req.user.role
    };

    res.status(200).json({ userData }); 
};
