# Shop Smart & Chic - Modern E-commerce Platform

A full-stack e-commerce platform built with React, TypeScript, and Flask, featuring a modern UI, robust backend, and comprehensive product management system.

## 🌟 Features

### Frontend

- Modern, responsive UI built with React and TypeScript
- Beautiful product grid and list views
- Advanced search and filtering capabilities
- Real-time product updates
- Shopping cart functionality
- User authentication and profile management
- Wishlist feature
- Order tracking
- Responsive design for all devices

### Backend

- RESTful API built with Flask
- SQLAlchemy ORM for database management
- JWT-based authentication
- Advanced search and filtering
- Pagination support
- Category management
- Order processing
- User management

## 🛠️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Query
- Zustand (State Management)

### Backend

- Python 3.8+
- Flask
- SQLAlchemy
- Flask-Migrate
- Flask-CORS
- JWT Authentication
- PostgreSQL/SQLite

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd shop-smart-and-chic

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
DATABASE_URL=sqlite:///ecommerce.db
SECRET_KEY=your-secret-key-here

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed database with mock data
python seed.py

# Run development server
flask run
```

## 📁 Project Structure

```
shop-smart-and-chic/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── context/          # React context
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── backend/              # Backend source code
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── migrations/      # Database migrations
│   └── seed.py          # Database seeder
└── public/              # Static assets
```

## 🔑 API Endpoints

### Products

- `GET /api/products/` - Get all products with filtering
- `GET /api/products/<id>` - Get product by ID
- `GET /api/products/categories` - Get all categories
- `GET /api/products/search` - Search products

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Orders

- `GET /api/orders/` - Get all orders
- `GET /api/orders/<id>` - Get order by ID
- `POST /api/orders/` - Create new order

## 🎨 UI Features

### Product Display

- Grid and list view options
- Product cards with images
- Price and discount display
- Rating system
- Quick add to cart
- Wishlist functionality

### Filtering & Search

- Category filtering
- Price range filtering
- Search by name/description
- Sort by price, rating, popularity
- Pagination

### User Interface

- Clean, modern design
- Responsive layout
- Dark/light mode support
- Loading states
- Error handling
- Toast notifications

## 🔒 Security Features

- JWT authentication
- Password hashing
- CORS protection
- Input validation
- Rate limiting
- Secure headers

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
python -m pytest
```

## 📦 Deployment

### Frontend

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Set production environment variables
export FLASK_ENV=production
export DATABASE_URL=your_production_db_url
export SECRET_KEY=your_production_secret_key

# Run with production server
gunicorn app:app
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- shadcn/ui for the beautiful components
- Tailwind CSS for the utility-first CSS framework
- Flask for the backend framework
- All contributors who have helped shape this project
