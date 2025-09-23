# Civic Issues Platform - Frontend

A modern React-based frontend for the Civic Issues Platform, built with Vite, TailwindCSS, ShadCN UI, and React Router.

## 🚀 Features

- **Interactive Map**: Leaflet.js integration with real-time issue markers
- **Issue Reporting**: Photo upload with Cloudinary integration
- **Role-based Access**: Citizen, Official, and Admin dashboards
- **Real-time Updates**: WebSocket integration for live updates
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern UI**: ShadCN components with beautiful design

## 🛠 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN UI** - Component library
- **React Router DOM** - Client-side routing
- **React Leaflet** - Map integration
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Update the following variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎨 UI Components

The project uses ShadCN UI components with custom styling:

- **Button** - Various button styles and sizes
- **Card** - Content containers
- **Input** - Form inputs with validation
- **Select** - Dropdown selections
- **Badge** - Status indicators
- **Textarea** - Multi-line text inputs

## 🗺 Map Integration

- **Leaflet.js** for interactive maps
- **OpenStreetMap** tiles
- **Custom markers** for different issue statuses
- **Real-time updates** via WebSocket
- **Geolocation** support for current location

## 🔐 Authentication

- **JWT-based** authentication
- **Role-based** access control
- **Protected routes** for authenticated users
- **Context API** for state management

## 📱 Responsive Design

- **Mobile-first** approach
- **TailwindCSS** responsive utilities
- **Touch-friendly** interface
- **Optimized** for all screen sizes

## 🚀 Deployment

The frontend can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Any static hosting**

Build command: `npm run build`

## 🔧 Development

- **Hot reload** with Vite
- **ESLint** for code quality
- **TypeScript** support (optional)
- **Component-based** architecture

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN UI components
│   ├── Common/         # Common components
│   ├── Map/            # Map-related components
│   └── Forms/          # Form components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and external services
└── utils/              # Utility functions
```

## 🎯 Key Features

### Issue Reporting
- **Location selection** with map or GPS
- **Photo upload** with Cloudinary
- **Category selection** with icons
- **Severity rating** (1-5 scale)
- **Real-time validation**

### Interactive Map
- **Issue markers** with status colors
- **Popup details** on marker click
- **Filter by category/status**
- **Clustering** for dense areas
- **Responsive design**

### Dashboard
- **Role-based views** (Citizen/Official/Admin)
- **Issue management** with status updates
- **Analytics** and reporting
- **Real-time notifications**

## 🔗 API Integration

- **RESTful API** calls with Axios
- **Error handling** with toast notifications
- **Loading states** for better UX
- **Optimistic updates** for real-time feel

## 🎨 Styling

- **TailwindCSS** for utility-first styling
- **Custom CSS** for Leaflet map styling
- **Dark mode** support (ready for implementation)
- **Consistent** design system

## 📊 Performance

- **Code splitting** with React.lazy
- **Image optimization** with Cloudinary
- **Bundle optimization** with Vite
- **Lazy loading** for better performance

## 🧪 Testing

- **Jest** for unit testing
- **React Testing Library** for component testing
- **E2E testing** with Cypress (optional)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the backend server
5. Run `npm run dev`
6. Open http://localhost:5173

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.