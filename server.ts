import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ensure uploads folder exists
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not found in environment variables. Running in mock mode.');
}

// Schemas & Models
const martialArtSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  icon: String, // name of lucide-react icon
});
const MartialArt = mongoose.model('MartialArt', martialArtSchema);

const scheduleSchema = new mongoose.Schema({
  location: String, // Ghencea or Militari
  day: String,
  time: String,
  title: String,
  type: String,
  trainerId: String,
  trainer: String,
  trainerColor: String,
});
const Schedule = mongoose.model('Schedule', scheduleSchema);

const coachSchema = new mongoose.Schema({
  id: String,
  name: String,
  role: String,
  subscriptionTag: String,
  image: String,
  bio: String,
  description: String,
  basePrice: String,
  specialties: [String],
  trainingSchedule: [{
    time: String,
    location: String,
    title: String,
  }],
  locations: [{
    configId: String,
    name: String,
    address: String,
    schedule: String,
  }],
  privatePrice: String,
  privateDetails: [String],
  groupPrice: String,
  groupLocation: String,
  groupSchedule: String,
  groupDetails: [String],
  stats: [{ label: String, value: String }],
  specializations: [String],
});
const Coach = mongoose.model('Coach', coachSchema);

const subscriptionSchema = new mongoose.Schema({
  title: String,
  group: String,
  trainerId: String,
  trainer: String,
  role: String,
  image: String,
  category: String,
  location: String,
  schedule: String,
  price: String,
  details: [String],
  features: [String],
  popular: Boolean,
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);

const fightGalaSchema = new mongoose.Schema({
  name: String,
  fighters: String,
  logo: String,
  location: String,
  years: String,
  highlight: String,
  description: String,
  website: String,
  youtubeUrl: String,
  order: { type: Number, default: 0 },
});
const FightGala = mongoose.model('FightGala', fightGalaSchema);

const competitionSchema = new mongoose.Schema({
  name: String,
  location: String,
  date: String,
  image: String,
  password: String,
  coachIds: [String],
  coaches: [{
    id: String,
    name: String,
  }],
  details: String,
});
const Competition = mongoose.model('Competition', competitionSchema);

const competitionRegistrationSchema = new mongoose.Schema({
  competitionId: String,
  competitionName: String,
  fullName: String,
  weightCategory: String,
  experience: String,
  group: String,
  coachId: String,
  coachName: String,
  createdAt: { type: Date, default: Date.now },
});
const CompetitionRegistration = mongoose.model('CompetitionRegistration', competitionRegistrationSchema);

const gallerySchema = new mongoose.Schema({
  url: String,
  type: { type: String, default: 'image' },
});
const Gallery = mongoose.model('Gallery', gallerySchema);

const locationConfigSchema = new mongoose.Schema({
  name: String,
  address: String,
  wazeUrl: String,
  googleMapsUrl: String,
  image: String,
});
const LocationConfig = mongoose.model('LocationConfig', locationConfigSchema);

const designSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  heroMedia: String,
  heroMediaMobile: String,
  heroMediaDesktop: String,
  heroMediaType: String,
  heroMediaMobileType: String,
  siteLogo: String,
  ctaSectionPhoto: String,
  instagramUrl: String,
  facebookUrl: String,
  youtubeUrl: String,
  whatsappUrl: String,
  palmaresCards: [{
    name: String,
    title: String,
    record: String,
    description: String,
    highlight: String,
  }],
  palmaresProfiles: [{
    slug: String,
    name: String,
    title: String,
    record: String,
    biography: String,
    highlight: String,
    matches: String,
    wins: String,
    kos: String,
    importantGalas: [String],
    tournaments: [String],
    awards: [String],
  }],
  updatedAt: { type: Date, default: Date.now },
});
const DesignSetting = mongoose.model('DesignSetting', designSettingSchema);

const contactRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  interest: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

const reviewSchema = new mongoose.Schema({
  name: String,
  role: String,
  text: String,
  image: String,
  rating: { type: Number, default: 5 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'disabled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model('Review', reviewSchema);

// API Routes
app.post('/api/contact', async (req, res) => {
  try {
    const newRequest = new ContactRequest(req.body);
    await newRequest.save();
    res.json({ success: true, message: 'Solicitare trimisă cu succes!' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la trimiterea solicitării.' });
  }
});

app.get('/api/admin/requests', isAdmin, async (req, res) => {
  const data = await ContactRequest.find().sort({ createdAt: -1 });
  res.json(data);
});

app.delete('/api/admin/requests/:id', isAdmin, async (req, res) => {
  await ContactRequest.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.get('/api/martial-arts', async (req, res) => {
  const data = await MartialArt.find();
  res.json(data);
});

app.get('/api/schedule', async (req, res) => {
  const data = await Schedule.find();
  res.json(data);
});

app.get('/api/coaches', async (req, res) => {
  const data = await Coach.find();
  res.json(data);
});

app.get('/api/subscriptions', async (req, res) => {
  const data = await Subscription.find();
  res.json(data);
});

app.get('/api/fight-galas', async (req, res) => {
  const data = await FightGala.find().sort({ order: 1, name: 1 });
  res.json(data);
});

app.get('/api/competitions', async (req, res) => {
  const data = await Competition.find().sort({ date: 1 });
  res.json(data);
});

app.post('/api/competitions/:id/register', async (req, res) => {
  const competition = await Competition.findById(req.params.id);
  if (!competition) return res.status(404).json({ message: 'Competition not found' });
  if (req.body.password !== competition.password) {
    return res.status(401).json({ message: 'Invalid competition password' });
  }

  const registration = new CompetitionRegistration({
    competitionId: competition._id.toString(),
    competitionName: competition.name,
    fullName: req.body.fullName,
    weightCategory: req.body.weightCategory,
    experience: req.body.experience,
    group: req.body.group,
    coachId: req.body.coachId,
    coachName: req.body.coachName,
  });
  await registration.save();
  res.json({ success: true, registration });
});

app.get('/api/gallery', async (req, res) => {
  const data = await Gallery.find();
  res.json(data);
});

app.get('/api/location-configs', async (req, res) => {
  const data = await LocationConfig.find().sort({ name: 1 });
  res.json(data);
});

app.get('/api/design', async (req, res) => {
  const data = await DesignSetting.findOne({ key: 'main' });
  res.json(data || {});
});

app.get('/api/reviews', async (req, res) => {
  const data = await Review.find({ status: 'approved' }).sort({ createdAt: -1 });
  res.json(data);
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review({
      name: req.body.name,
      role: req.body.role,
      text: req.body.text,
      image: req.body.image,
      rating: Number(req.body.rating) || 5,
      status: 'pending',
    });
    await review.save();
    res.json({ success: true, message: 'Recenzia a fost trimisa si asteapta aprobarea.' });
  } catch (error) {
    res.status(500).json({ error: 'Recenzia nu a putut fi trimisa.' });
  }
});

// Admin Routes (Simple password check)
function isAdmin(req, res, next) {
  const password = req.headers['admin-password'];
  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Generic CRUD helper generator could be used, but for clarity we'll define them
app.get('/api/admin/reviews', isAdmin, async (req, res) => {
  const data = await Review.find().sort({ createdAt: -1 });
  res.json(data);
});
app.put('/api/admin/reviews/:id', isAdmin, async (req, res) => {
  const updatedItem = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/reviews/:id', isAdmin, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Martial Arts
app.post('/api/admin/martial-arts', isAdmin, async (req, res) => {
  const newItem = new MartialArt(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/martial-arts/:id', isAdmin, async (req, res) => {
  const updatedItem = await MartialArt.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/martial-arts/:id', isAdmin, async (req, res) => {
  await MartialArt.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Schedule
app.post('/api/admin/schedule', isAdmin, async (req, res) => {
  const newItem = new Schedule(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/schedule/:id', isAdmin, async (req, res) => {
  const updatedItem = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/schedule/:id', isAdmin, async (req, res) => {
  await Schedule.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Coaches
app.post('/api/admin/coaches', isAdmin, async (req, res) => {
  const newItem = new Coach(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/coaches/:id', isAdmin, async (req, res) => {
  const updatedItem = await Coach.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/coaches/:id', isAdmin, async (req, res) => {
  await Coach.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Subscriptions
app.post('/api/admin/subscriptions', isAdmin, async (req, res) => {
  const newItem = new Subscription(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/subscriptions/:id', isAdmin, async (req, res) => {
  const updatedItem = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/subscriptions/:id', isAdmin, async (req, res) => {
  await Subscription.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Fight Galas
app.post('/api/admin/fight-galas', isAdmin, async (req, res) => {
  const newItem = new FightGala(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/fight-galas/:id', isAdmin, async (req, res) => {
  const updatedItem = await FightGala.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/fight-galas/:id', isAdmin, async (req, res) => {
  await FightGala.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Competitions
app.post('/api/admin/competitions', isAdmin, async (req, res) => {
  const newItem = new Competition(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/competitions/:id', isAdmin, async (req, res) => {
  const updatedItem = await Competition.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/competitions/:id', isAdmin, async (req, res) => {
  await Competition.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.get('/api/admin/registrations', isAdmin, async (req, res) => {
  const data = await CompetitionRegistration.find().sort({ createdAt: -1 });
  res.json(data);
});
app.delete('/api/admin/registrations/:id', isAdmin, async (req, res) => {
  await CompetitionRegistration.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Gallery
app.post('/api/admin/gallery', isAdmin, async (req, res) => {
  const newItem = new Gallery(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/gallery/:id', isAdmin, async (req, res) => {
  const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/gallery/:id', isAdmin, async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Location Configs
app.post('/api/admin/location-configs', isAdmin, async (req, res) => {
  const newItem = new LocationConfig(req.body);
  await newItem.save();
  res.json(newItem);
});
app.put('/api/admin/location-configs/:id', isAdmin, async (req, res) => {
  const updatedItem = await LocationConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/location-configs/:id', isAdmin, async (req, res) => {
  await LocationConfig.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Design Settings
app.get('/api/admin/design', isAdmin, async (req, res) => {
  const data = await DesignSetting.findOne({ key: 'main' });
  res.json(data ? [data] : []);
});
app.post('/api/admin/design', isAdmin, async (req, res) => {
  const updatedItem = await DesignSetting.findOneAndUpdate(
    { key: 'main' },
    { ...req.body, key: 'main', updatedAt: new Date() },
    { returnDocument: 'after', upsert: true }
  );
  res.json(updatedItem);
});
app.put('/api/admin/design/:id', isAdmin, async (req, res) => {
  const updatedItem = await DesignSetting.findByIdAndUpdate(req.params.id, { ...req.body, key: 'main', updatedAt: new Date() }, { new: true });
  res.json(updatedItem);
});
app.delete('/api/admin/design/:id', isAdmin, async (req, res) => {
  await DesignSetting.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Upload API
app.post('/api/reviews/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post('/api/admin/upload', isAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
