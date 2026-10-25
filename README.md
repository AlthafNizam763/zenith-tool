# Zenith-Tool — Support & Content Management Dashboard

A modern, responsive Support and Content Management Dashboard for **Zenith-Academy**, built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and MongoDB.

This tool centralizes the administration of Zenith-Academy's homepage video, student success stories (videos & images), Happening Now promo banners & destination links, and structured rank file study materials without manual source code editing.

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - Live metric cards (Stories, Video, Banners, Rank File)
   - MongoDB connection health status
   - Quick management shortcuts
   - Link to live Zenith-Academy site

2. **Student Success Stories Management**:
   - Manage both short video reels/clips and image testimonials
   - Edit student name, story headline, feedback/quote, and district/exam rank achievements
   - Upload new videos or replacement images with live preview
   - Configure video posters/thumbnails
   - Instant publish / unpublish toggle (hides from public site without deleting)
   - Story reordering (moves position in the live carousel/marquee)
   - Safe deletion with confirmation modal

3. **Homepage Video Management**:
   - Live video playback of current active hero video
   - Replace video file with a single upload or direct media URL
   - Optional responsive variants for tablet and mobile screens
   - Configure video poster/thumbnail, title, and description
   - Automatic version archiving into a 10-revision history
   - One-click rollback to restore any previous video version

4. **Happening Now Banner & Link Management**:
   - Upload and replace promotional banners
   - Configure clickable destination URLs (e.g. WhatsApp, course registration, exam links)
   - Live banner preview
   - Reorder banner sequence in the infinite auto-scroll carousel
   - Enable or disable individual banners

5. **Structured Study Materials (Rank File)**:
   - Logical identifier (`rank_file`) preserving database integrity
   - Upload replacement rank file (PDF, docx, zip)
   - Upload rank file book cover graphic
   - Edit title, exam alignment description, and audit notes
   - Version history and instant rollback
   - Direct download and preview

6. **Media & File Asset Library**:
   - Centralized media asset management
   - Filter by images, videos, and documents
   - Copy public asset URLs directly to clipboard

7. **Security & Authentication**:
   - Password hashing with `bcryptjs`
   - Signed session JWT tokens using `jose`
   - Secure HTTP-only cookies
   - Route protection middleware guarding `/dashboard/*` and administrative API routes

8. **Public Content API (CORS Enabled)**:
   - `GET /api/public/all`: Unified payload of all published content in one call
   - `GET /api/public/stories`: Published success stories (filter by `type=video` or `type=image`)
   - `GET /api/public/homepage-video`: Active published hero video
   - `GET /api/public/happening-now`: Active promotional banners and destination URLs
   - `GET /api/public/study-materials`: Active rank file details and download links

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router with TypeScript)
- **Database**: MongoDB Atlas with Mongoose
- **Styling**: Tailwind CSS with custom glassmorphism design tokens (sleek pitch-dark background, frosted glass panels, refined borders)
- **Storage Adapter**: Reusable storage provider saving to `public/uploads/{images,videos,documents}` with static asset serving
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Environment Setup

Create `.env.local` inside `zenith-tool`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/zenith_academy?retryWrites=true&w=majority
MONGODB_DB=zenith_academy
ADMIN_SESSION_SECRET=your_secure_random_session_secret_32_chars
NEXT_PUBLIC_APP_URL=http://localhost:3001
PORT=3001
MEDIA_STORAGE_PROVIDER=local
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The support tool runs on **`http://localhost:3001`**.

---

## 🔐 Default Administrator Login

On first run, the database automatically provisions the default administrator account if none exists:

- **Email**: `admin@zenithacademy.com`
- **Password**: `ZenithAdmin2026!`

---

## 🔗 Main Website Integration

The main `Zenith-Academy` website connects to `zenith-tool` via `src/services/zenithContentService.js`.

Configure `Zenith-Academy/.env`:

```env
VITE_ZENITH_TOOL_API_URL=http://localhost:3001/api/public
```

When changes are published in `zenith-tool`, they reflect dynamically on:
- `HeroSection.jsx` (Hero video)
- `Achievement.jsx` (Marquee success stories)
- `SubscribeSection.jsx` (Video success stories swiper)
- `BannerImages.jsx` (Happening Now carousel)
- `Order.jsx` (Structured Study Materials book cover & rank file details)
