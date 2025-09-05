# 🚗 Car Rental Backend API

A comprehensive Node.js/Express.js backend application for managing car rental services with advanced features including user management, rental lifecycle tracking, and administrative controls.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🚗 **Car Management**
- Complete vehicle inventory management
- Technical specifications (gearbox, fuel type, doors, seats)
- Equipment tracking (ABS, airbags, cruise control)
- Image upload and management
- Real-time availability tracking
- Advanced search and filtering

### 👥 **User Management**
- Multi-role support (Customer, Manager, Admin)
- Comprehensive user profiles with driver license validation
- User preferences and rental history
- JWT-based authentication with password hashing
- Profile management and password changes

### 🏢 **Branch Management**
- Geographic location services with 2D sphere indexing
- Multi-location support across cities
- Nearby branch search within radius
- City-based filtering and search

### 🚙 **Rental Management**
- Complete rental lifecycle management
- Advanced booking system with conflict detection
- Pickup and return management
- Car condition tracking (pre/post rental)
- Payment integration with multiple methods
- Insurance management with different tiers
- Flexible cancellation policies

### 📊 **Administrative Features**
- Dashboard with rental statistics
- Complete user and rental oversight
- Branch administration
- Advanced search and reporting

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Environment**: dotenv

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/car-rent-backend.git
   cd car-rent-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/car-rental
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/users/register` | Register new user | Public |
| POST | `/users/login` | User login | Public |
| GET | `/users/profile` | Get user profile | Private |
| PUT | `/users/profile` | Update user profile | Private |
| PUT | `/users/change-password` | Change password | Private |

### Car Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/cars` | Get all cars | Public |
| GET | `/cars/available` | Get available cars | Public |
| GET | `/cars/search` | Search cars | Public |
| GET | `/cars/:id` | Get car by ID | Public |
| GET | `/cars/:id/similar` | Get similar cars | Public |
| POST | `/cars` | Create new car | Admin |
| PUT | `/cars/:id` | Update car | Admin |
| DELETE | `/cars/:id` | Delete car | Admin |

### Rental Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/rentals` | Create new rental | Private |
| GET | `/rentals/my-rentals` | Get user's rentals | Private |
| GET | `/rentals/:id` | Get rental by ID | Private |
| PUT | `/rentals/:id` | Update rental | Private |
| PUT | `/rentals/:id/cancel` | Cancel rental | Private |
| GET | `/rentals` | Get all rentals | Admin/Manager |
| GET | `/rentals/stats/overview` | Get rental statistics | Admin/Manager |

### Branch Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/branches` | Get all branches | Public |
| GET | `/branches/search` | Search branches | Public |
| GET | `/branches/nearby` | Find nearby branches | Public |
| GET | `/branches/city/:city` | Get branches by city | Public |
| GET | `/branches/:id` | Get branch by ID | Public |
| POST | `/branches` | Create new branch | Admin |
| PUT | `/branches/:id` | Update branch | Admin |
| DELETE | `/branches/:id` | Delete branch | Admin |

## 🗄 Database Schema

### User Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  dateOfBirth: Date,
  driverLicense: {
    number: String (unique),
    expiryDate: Date,
    issuingCountry: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: String (enum: ['user', 'admin', 'manager']),
  preferences: {
    preferredCarTypes: [String],
    preferredFuelType: String,
    maxDailyBudget: Number
  },
  rentalHistory: [ObjectId]
}
```

### Car Schema
```javascript
{
  name: String,
  brand: String,
  pricePerDay: Number,
  isAvailable: Boolean,
  images: [String],
  technicalSpecs: {
    gearBox: String (enum: ['Manual', 'Automatic']),
    fuel: String (enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']),
    doors: Number,
    airConditioner: Boolean,
    seats: Number,
    distance: String
  },
  equipment: {
    ABS: Boolean,
    airBags: Boolean,
    airConditioning: Boolean,
    cruiseControl: Boolean
  }
}
```

### Rental Schema
```javascript
{
  userId: ObjectId (ref: 'User'),
  carId: ObjectId (ref: 'Car'),
  startDate: Date,
  endDate: Date,
  duration: Number,
  pricePerDay: Number,
  totalPrice: Number,
  additionalFees: {
    insurance: Number,
    fuel: Number,
    cleaning: Number,
    lateReturn: Number
  },
  finalAmount: Number,
  status: String (enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'overdue']),
  payment: {
    method: String,
    status: String,
    transactionId: String,
    paidAt: Date
  },
  pickup: {
    location: String,
    branch: ObjectId (ref: 'Branch'),
    time: Date,
    notes: String
  },
  return: {
    location: String,
    branch: ObjectId (ref: 'Branch'),
    time: Date,
    notes: String,
    actualReturnTime: Date
  },
  carCondition: {
    pickup: Object,
    return: Object
  },
  driverInfo: Object,
  insurance: Object,
  cancellationPolicy: Object
}
```

### Branch Schema
```javascript
{
  name: String,
  address: String,
  city: String,
  country: String,
  location: {
    type: String (enum: ['Point']),
    coordinates: [Number]
  }
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```javascript
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control
- **Public**: Registration, login, car browsing, branch information
- **Private**: User profile management, rental creation
- **Manager/Admin**: Rental management, statistics
- **Admin**: Complete system administration

## 💡 Usage Examples

### User Registration
```javascript
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "driverLicense": {
    "number": "DL123456789",
    "expiryDate": "2025-12-31",
    "issuingCountry": "USA"
  },
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Create Rental
```javascript
POST /api/rentals
Authorization: Bearer <token>
Content-Type: application/json

{
  "carId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "pickup": {
    "location": "Downtown Branch",
    "branch": "60f7b3b3b3b3b3b3b3b3b3b4",
    "time": "2024-02-01T10:00:00Z"
  },
  "return": {
    "location": "Downtown Branch",
    "branch": "60f7b3b3b3b3b3b3b3b3b3b4",
    "time": "2024-02-05T18:00:00Z"
  },
  "driverInfo": {
    "licenseNumber": "DL123456789",
    "licenseExpiry": "2025-12-31"
  },
  "payment": {
    "method": "credit_card"
  }
}
```

### Search Cars
```javascript
GET /api/cars/search?brand=Toyota&fuel=Hybrid&minPrice=50&maxPrice=200
```

### Find Nearby Branches
```javascript
GET /api/branches/nearby?lat=40.7128&lng=-74.0060&radius=10
```

## 🧪 Testing

The project includes Artillery load testing configurations:

```bash
# Quick connectivity test
npm run test:quick

# Load testing
npm run test:load

# Stress testing
npm run test:stress

# Admin operations testing
npm run test:admin

# Run all tests
npm run test:all
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/car-rental

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

## 📁 Project Structure

```
car-rent-backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── userController.js     # User management logic
│   ├── carController.js      # Car management logic
│   ├── rentalController.js   # Rental management logic
│   └── branchController.js   # Branch management logic
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User schema
│   ├── Car.js               # Car schema
│   ├── Rental.js            # Rental schema
│   └── Branch.js            # Branch schema
├── routes/
│   ├── userRoutes.js        # User routes
│   ├── carRoutes.js         # Car routes
│   ├── rentalRoutes.js      # Rental routes
│   └── branchRoutes.js      # Branch routes
├── uploads/                 # File uploads directory
├── utils/
│   └── imageUtils.js        # Image processing utilities
├── server.js                # Main application file
├── package.json
└── README.md
```

