const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { setCookies, clearCookies } = require('../utils/setCookies'); // <-- Zedt clearCookies hna

const prisma = new PrismaClient();

exports.register = async (req, res, next) => {
  try {
    const { email, password, lastName, firstName, role, ...profileData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const ROLE_MAP = {
      etudiant: 'STUDENT',
      professeur: 'PROFESSOR',
      admin: 'ADMINISTRATOR',
      professionnel: 'PROFESSIONAL'
    };

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          lastName,
          firstName,
          passwordHash: hashedPassword,
          role: ROLE_MAP[role],
          accountStatus: 'PENDING' 
        }
      });

      if (role === 'etudiant') {
        await tx.student.create({ data: { userId: newUser.id, ...profileData } });
      } else if (role === 'professionnel') {
        await tx.professional.create({ data: { userId: newUser.id, ...profileData } });
      }
      return newUser;
    });

    res.status(201).json({ success: true, message: "User created, pending activation." });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, professor: true, administrator: true, professional: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: "Account not active or suspended" });
    }

    let roleId = null;
    if (user.role === 'STUDENT') roleId = user.student?.id;
    if (user.role === 'PROFESSIONAL') roleId = user.professional?.id;

    const accessToken = generateAccessToken({ 
      userId: user.id, 
      role: user.role, 
      roleId: roleId 
    });
    
    const refreshToken = generateRefreshToken({ userId: user.id });

    setCookies(res, accessToken, refreshToken);
    res.json({ success: true, message: "Login successful", role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, lastName: true, firstName: true, email: true, role: true }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};


exports.logout = (req, res) => {
  clearCookies(res);
  res.json({ success: true, message: "Logout successful" });
};