const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// ← Fix: import directly from the canonical auth middleware, not the legacy shim
const { authenticateToken } = require("../middlewares/auth.middleware");
const crypto = require("crypto");
const { sendEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Sign Up ──────────────────────────────────────────────────────────────────
router.post("/sign-up", async (req, res, next) => {
  try {
    const { username, email, password, address } = req.body;

    if (!username || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain an uppercase, lowercase, number, and special character." });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashPass, address });
    await newUser.save();

    return res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    next(error);
  }
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link is valid for 15 minutes.</p>
      </div>
    `;

    const emailSent = await sendEmail(user.email, "Password Reset Request", emailHtml);
    if (!emailSent) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
});

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const { password } = req.body;
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain an uppercase, lowercase, number, and special character." });
    }

    const hashPass = await bcrypt.hash(password, 10);
    user.password = hashPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    next(error);
  }
});

// ─── Token Utilities ────────────────────────────────────────────────────────────
const Token = require("../models/token");

const generateTokens = async (user) => {
  const authClaims = {
    id: user._id,
    name: user.username,
    role: user.role,
  };
  
  // Access Token: Short-lived (e.g. 15m)
  const accessToken = jwt.sign(authClaims, JWT_SECRET, { expiresIn: "15m" });
  
  // Refresh Token: Long-lived (e.g. 7d)
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

  // Store refresh token
  await Token.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return { accessToken, refreshToken };
};

// ─── Sign In ──────────────────────────────────────────────────────────────────
router.post("/sign-in", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = await generateTokens(existingUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      id: existingUser._id,
      role: existingUser.role,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    // Verify token exists in DB
    const tokenDoc = await Token.findOne({ token: refreshToken, isRevoked: false });
    if (!tokenDoc) return res.status(403).json({ message: "Invalid or revoked refresh token" });

    // Verify JWT
    jwt.verify(refreshToken, JWT_SECRET, async (err, decoded) => {
      if (err) {
        tokenDoc.isRevoked = true;
        await tokenDoc.save();
        return res.status(403).json({ message: "Refresh token expired" });
      }

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Revoke old token and generate new pair (Token Rotation)
      tokenDoc.isRevoked = true;
      await tokenDoc.save();

      const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({ token: accessToken });
    });
  } catch (error) {
    next(error);
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await Token.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    }
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
});

// ─── Get User Information ─────────────────────────────────────────────────────
router.get("/get-user-information", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Corrected: Using token identity
    const data = await User.findById(userId).select("-password");
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// ─── Update Address ───────────────────────────────────────────────────────────
router.put("/update-address", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    await User.findByIdAndUpdate(userId, { address });
    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    next(error);
  }
});

// ─── Update Avatar ────────────────────────────────────────────────────────────
router.put("/update-avatar", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: "Avatar URL is required" });
    }

    await User.findByIdAndUpdate(userId, { avatar });
    return res.status(200).json({ message: "Profile picture updated!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;