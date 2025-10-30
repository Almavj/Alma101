# Sentinel Learn Lab

A modern, secure learning platform built with React and PHP, featuring authentication, blog management, and cybersecurity tools.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Query for state management
- React Router for navigation
- Sentry for error tracking

### Backend
- PHP
- Supabase for authentication and database
- Redis for caching
- JWT for token management

## Getting Started

### Prerequisites
- Node.js & npm
- PHP 8.0 or higher
- Composer
- Redis (optional for caching)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Almavj/sentinel-learn-lab.git
cd sentinel-learn-lab
```

2. Install Frontend Dependencies
```bash
npm install
```

3. Install Backend Dependencies
```bash
cd backend
composer install
```

4. Environment Setup
Create `.env` file in the project root for frontend:
```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_URL=your_supabase_url
```

Create `.env` file in the backend directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Running the Application

1. Start the Frontend
```bash
npm run dev
```

2. Start the Backend (in a separate terminal)
```bash
cd backend
php -S localhost:8000
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Features

- User Authentication (Sign up, Sign in)
- Blog Management (Create, Read, Update, Delete)
- Responsive UI with modern design
- Error tracking and monitoring
- Rate limiting and CORS protection
- Security best practices implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
