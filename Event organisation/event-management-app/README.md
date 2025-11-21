# RUAS Connect

A comprehensive event management web application built with React and Supabase for RUAS college students.

## Features

- 🔐 **User Authentication** - Email/password and Google OAuth login
- 📅 **Event Management** - Browse, search, and filter events (workshops, seminars, hackathons, competitions)
- ✅ **Event Registration** - Quick one-click registration for events
- 👤 **User Profile** - Manage profile, view upcoming events, and certificates
- 🏆 **Certificates** - Store and view earned certificates
- 🎯 **Auto-Updating Counters** - Certificates and upcoming events automatically tracked
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 🔔 **Real-time Updates** - Supabase real-time subscriptions

## Tech Stack

- **Frontend:** React 18, React Router DOM
- **Backend:** Supabase (PostgreSQL, Authentication, Storage)
- **Styling:** Custom CSS with modern design
- **Hosting:** Vercel (recommended)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Installation

### 1. Clone or download this project

```bash
cd event-management-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to Settings → API
4. Copy the `Project URL` and `anon public` key

### 4. Database Setup

Make sure you've already set up the database schema in Supabase using the `database-schema.sql` file from the parent directory.

If not, run the SQL in Supabase SQL Editor to create:
- 7 tables (profiles, clubs, events, registrations, certificates, club_members, announcements)
- Auto-updating triggers
- Row-level security policies
- Sample data

### 5. Run the development server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
event-management-app/
├── public/
├── src/
│   ├── components/
│   │   ├── EventCard.js          # Event card component
│   │   ├── EventCard.css
│   │   ├── Navbar.js              # Navigation bar
│   │   ├── Navbar.css
│   │   └── ProtectedRoute.js      # Route protection
│   ├── config/
│   │   └── supabaseClient.js      # Supabase configuration
│   ├── context/
│   │   └── AuthContext.js         # Authentication context
│   ├── pages/
│   │   ├── Dashboard.js           # Main events dashboard
│   │   ├── Dashboard.css
│   │   ├── EventDetails.js        # Single event page
│   │   ├── EventDetails.css
│   │   ├── Login.js               # Login/Signup page
│   │   ├── Login.css
│   │   ├── Profile.js             # User profile page
│   │   └── Profile.css
│   ├── App.js                     # Main app component with routing
│   ├── App.css
│   ├── index.js                   # App entry point
│   └── index.css
├── .env                           # Environment variables (create this!)
├── package.json
└── README.md
```

## Usage

### For Students

1. **Sign Up/Login**
   - Use your college email
   - Or sign in with Google

2. **Browse Events**
   - View all upcoming events on the dashboard
   - Filter by type (workshop, seminar, hackathon, competition)
   - Search events by name or description

3. **Register for Events**
   - Click on an event to view details
   - Click "Register Now" to register
   - View your registrations in your profile

4. **View Profile**
   - See your upcoming events count
   - View certificates earned
   - Edit your profile information

### For Event Organizers

Event organizers (club admins) can create events through the Supabase dashboard or you can build an admin panel.

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

### `npm run eject`
Ejects from Create React App (one-way operation)

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

4. Your app will be live at: `https://your-project.vercel.app`

### Alternative: Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `build` folder to [Netlify](https://app.netlify.com/)

3. Add environment variables in Netlify dashboard

## Features in Detail

### Authentication
- Email/password authentication with email verification
- Google OAuth integration
- Protected routes for authenticated users
- Persistent sessions

### Events
- Browse all active events
- Filter by event type
- Search functionality
- View event details (date, location, description, organizer)
- See registration count and spots remaining
- Register/cancel registration

### Profile Management
- Edit profile information
- View statistics (upcoming events, certificates earned)
- See all registered events
- View earned certificates

### Auto-Updating Counters
- `certificates_received` - Automatically increments when certificates are issued
- `upcoming_events` - Automatically updates based on registrations for future events
- Database triggers handle all updates

## Database Schema

### Main Tables
- **profiles** - User profiles with auto-updating counters
- **clubs** - Clubs and organizations
- **events** - All events
- **registrations** - Event registrations
- **certificates** - User certificates
- **club_members** - Club membership
- **announcements** - Club announcements

### Key Relationships
- Events belong to clubs
- Registrations link users to events
- Certificates link users to events
- Club members belong to clubs

## Security

- Row-Level Security (RLS) enabled on all tables
- Users can only access their own data
- Events and clubs are publicly viewable
- Only club admins can create events

## Troubleshooting

### "Missing Supabase environment variables"
Make sure you've created a `.env` file with the correct variables

### "Cannot connect to Supabase"
- Check your Project URL is correct
- Check you're using the `anon` key, not `service_role` key
- Make sure you're connected to the internet

### Events not showing
- Make sure you've run the database schema SQL
- Check if events exist in Supabase Table Editor
- Check browser console for errors

### Authentication not working
- Check email verification is enabled in Supabase
- Check your email provider settings in Supabase
- Check redirect URLs are configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for educational purposes for RUAS.

## Support

For issues or questions:
- Check the documentation in the parent directory
- Review Supabase docs: https://supabase.com/docs
- Review React docs: https://react.dev

## Credits

Built with ❤️ for RUAS Event Management

---

**Happy Coding! 🚀**
