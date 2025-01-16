const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Remove expired sessions every 2 minutes
    }),
  })
);

// Passport setup
passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return done(null, false, { message: 'User not found' });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return done(null, false, { message: 'Invalid password' });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// File upload setup with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// User registration
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));

// Logout
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Upload file
app.get('/upload', async (req, res) => {
  try {
    const folders = await prisma.folder.findMany(); // Fetch all folders
    const files = await prisma.file.findMany(); // Fetch all uploaded files
    res.render('upload', { folders, files }); // Pass folders and files to the view
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading upload page');
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { folderId } = req.body;

  try {
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        folderId: folderId ? parseInt(folderId, 10) : null, // Handle null folderId
        url: `/uploads/${req.file.filename}`,
      },
    });
    res.redirect('/upload'); // Redirect back to the upload page
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});


// Folder CRUD routes
app.get('/folders', async (req, res) => {
  const folders = await prisma.folder.findMany();
  res.render('folders', { folders });
});

app.post('/folders', async (req, res) => {
  const { name } = req.body;

  // Simulate a logged-in user (replace this with your actual user authentication logic)
  const userId = req.user?.id || 1; // Default to a hardcoded userId for now

  if (!name || name.trim() === '') {
    return res.status(400).send('Folder name is required.');
  }

  try {
    await prisma.folder.create({
      data: {
        name,
        userId, // Ensure this is defined
      },
    });
    res.redirect('/upload'); // Redirect back to the upload page
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).send('An error occurred while creating the folder.');
  }
});

app.get('/folders/:id', async (req, res) => {
  const folderId = parseInt(req.params.id, 10);
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  const files = await prisma.file.findMany({ where: { folderId } });
  res.render('folder-details', { folder, files });
});

app.post('/folders/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.folder.delete({ where: { id: parseInt(id, 10) } });
    res.redirect('/folders');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// File details route
app.get('/files/:id', async (req, res) => {
  const fileId = parseInt(req.params.id, 10);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  res.render('file-details', { file });
});

// Share folder route
app.get('/share-folder/:id', async (req, res) => {
  const folderId = parseInt(req.params.id, 10);
  res.render('share-folder', { folderId, shareLink: null });
});

app.post('/share-folder/:id', async (req, res) => {
  const folderId = parseInt(req.params.id, 10);
  const { duration } = req.body;
  const shareLink = `http://localhost:3000/share/${folderId}-${Date.now() + duration * 24 * 60 * 60 * 1000}`;
  res.render('share-folder', { folderId, shareLink });
});

// Static files
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
