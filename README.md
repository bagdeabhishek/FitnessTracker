# Workout Tracker

A Progressive Web App (PWA) for tracking workouts offline. Built with React, Vite, Tailwind CSS, shadcn/ui, and Dexie.js.

## Features

- **Offline Support**: Full offline functionality via vite-plugin-pwa
- **Workout Plans**: Import custom workout plans via JSON
- **Schedule Support**: Weekly and biweekly workout schedules
- **Active Workout**: Log sets with weight, reps, and completion tracking
- **Rest Timer**: Built-in rest timer between sets
- **History**: View past workout sessions with volume tracking
- **Dark Mode**: Full dark mode support
- **Mobile-First**: Large touch targets, one-handed use
- **Data Export**: Export all data as JSON backup

## Tech Stack

- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- shadcn/ui components
- Dexie.js (IndexedDB)
- vite-plugin-pwa
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Optional: Google Analytics

If you want analytics, create a `.env` file from `.env.example` and set:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

If this value is not set, analytics scripts are not loaded.

### Building for Production

```bash
npm run build
```

The `dist` folder will contain the static build ready for deployment.

## Deployment to Coolify

### Option 1: Static Site Deployment

1. **Push your code to a Git repository** (GitHub, GitLab, etc.)

2. **In Coolify:**
   - Create a new service
   - Select "Static Site"
   - Connect your repository
   
3. **Build Configuration:**
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: (leave empty)

4. **Optional Environment Variable:**
   - `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

5. **Domain Configuration:**
    - Set domain: `workout.abhishekdoesstuff.com`
    - Enable HTTPS (Let's Encrypt)

6. **Deploy!**

### Option 2: Docker Deployment (Alternative)

If you prefer Docker, create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

And `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Then in Coolify:
- Create a new service
- Select "Dockerfile"
- Set the repository and branch

## Workout Plan JSON Schema

Example workout plan:

```json
{
  "version": "1.0",
  "program_name": "Beginner Full Body",
  "description": "3-day full body routine",
  "workouts": [
    {
      "day_of_week": "Monday",
      "name": "Workout A",
      "exercises": [
        {
          "id": "squat",
          "name": "Barbell Squat",
          "muscle_group": "Legs",
          "sets": 3,
          "target_reps": "8-10",
          "rest_seconds": 180,
          "reference_url": "https://exrx.net/WeightExercises/Quadriceps/BBFullSquat",
          "notes": "Keep chest up"
        }
      ]
    }
  ]
}
```

### Fields

- `version`: Schema version
- `program_name`: Name of your program
- `description`: Optional description
- `workouts`: Array of workout days
  - `day_of_week`: Monday-Sunday
  - `week_offset`: 0 for weekly, 1 for biweekly week 2
  - `name`: Workout name
  - `exercises`: Array of exercises
    - `id`: Unique exercise identifier
    - `name`: Exercise name
    - `muscle_group`: Optional muscle group
    - `sets`: Number of sets
    - `target_reps`: Target rep range (e.g., "8-12")
    - `rest_seconds`: Rest time between sets
    - `reference_url`: Optional URL for exercise info
    - `notes`: Optional notes

## Development

### Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── workout/         # Workout screens
│   ├── history/         # History views
│   └── settings/        # Settings screen
├── lib/
│   ├── db.ts           # Dexie database
│   ├── validation.ts   # JSON validation
│   └── helpers.ts      # Utility functions
├── types/
│   └── index.ts        # TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

### Adding New Features

1. **New Components**: Add to appropriate folder in `src/components/`
2. **Database Changes**: Update schema in `src/lib/db.ts`
3. **Types**: Add types to `src/types/index.ts`

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

## License

MIT License

## Support

For issues or questions, please open an issue on the repository.
