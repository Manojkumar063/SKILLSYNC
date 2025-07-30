# SkillSync - Developer Marketplace Platform

A comprehensive freelancer marketplace platform where developers can showcase their skills, apply to jobs, and clients can post projects, hire talent, and manage project progress. Built with Node.js, Express, MongoDB, and modern web technologies.

## 🚀 Features

### For Developers
- **Profile Management**: Create detailed profiles with skills, experience, and portfolio
- **Job Discovery**: Browse and search available projects with advanced filtering
- **Application System**: Apply to jobs with cover letters and portfolio samples
- **Real-time Messaging**: Communicate with clients throughout the project lifecycle
- **Rating System**: Build reputation through client reviews and ratings
- **File Management**: Upload resumes, portfolios, and project attachments

### For Clients
- **Project Posting**: Create detailed job postings with requirements and budgets
- **Developer Discovery**: Browse developer profiles and skills
- **Application Management**: Review and manage job applications
- **Hiring System**: Hire developers and track project progress
- **Payment Integration**: Secure payment processing with Stripe
- **Communication Tools**: Direct messaging with hired developers

### For Administrators
- **Dashboard Analytics**: Comprehensive platform statistics and insights
- **User Management**: Manage users, jobs, and platform moderation
- **Content Moderation**: Monitor and moderate platform content
- **Platform Statistics**: Track growth, revenue, and user engagement

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Payment Processing**: Stripe
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

### Development Tools
- **Environment**: dotenv for configuration
- **Logging**: Custom logging system
- **API Documentation**: Standardized response format
- **Code Quality**: ESLint, Prettier (recommended)

## 📁 Project Structure

```
skillsync-backend/
├── config/                 # Configuration files
│   ├── database.js         # MongoDB connection
│   ├── auth.js            # JWT configuration
│   └── stripe.js          # Stripe payment configuration
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication logic
│   ├── userController.js  # User management
│   ├── jobController.js   # Job management
│   ├── applicationController.js # Application handling
│   ├── messageController.js # Messaging system
│   ├── ratingController.js # Rating and review system
│   └── adminController.js # Admin panel functionality
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── roleCheck.js      # Role-based access control
│   └── upload.js         # File upload handling
├── models/               # Database schemas
│   ├── User.js          # User model (clients, developers, admins)
│   ├── Job.js           # Job posting model
│   ├── Application.js   # Job application model
│   ├── Message.js       # Messaging model
│   └── Rating.js        # Rating and review model
├── routes/              # API endpoints
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── jobs.js         # Job management routes
│   ├── applications.js # Application routes
│   ├── messages.js     # Messaging routes
│   ├── ratings.js      # Rating routes
│   └── admin.js        # Admin panel routes
├── utils/               # Utility functions
│   ├── emailService.js  # Email templates and sending
│   ├── fileUpload.js    # File handling utilities
│   ├── validation.js    # Validation rules
│   ├── response.js      # Standardized API responses
│   ├── helpers.js       # Common helper functions
│   └── logger.js        # Logging system
├── seeds/               # Database seeding
│   └── seedData.js      # Sample data for development
├── uploads/             # File storage directory
├── logs/               # Application logs
├── app.js              # Express application setup
├── server.js           # Server entry point
├── package.json        # Dependencies and scripts
└── README.md          # Project documentation
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Gmail account** (for email services)
- **Stripe account** (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillsync-backend.git
   cd skillsync-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/skillsync
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-refresh-token-secret-here
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   
   # Stripe Payment
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   
   # Logging
   LOG_LEVEL=INFO
   ```

4. **Create required directories**
   ```bash
   mkdir uploads logs
   touch uploads/.gitkeep logs/.gitkeep
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For macOS with Homebrew
   brew services start mongodb-community
   
   # For Ubuntu/Debian
   sudo systemctl start mongod
   
   # For Windows
   net start MongoDB
   ```

6. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will be running at `http://localhost:5000`

## 📱 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | User logout | Private |
| GET | `/auth/me` | Get current user | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users/profile/:id?` | Get user profile | Private |
| PUT | `/users/profile` | Update user profile | Private |
| POST | `/users/avatar` | Upload user avatar | Private |
| POST | `/users/resume` | Upload resume (developers) | Private |
| GET | `/users/developers` | Get all developers | Public |
| PUT | `/users/change-password` | Change password | Private |
| PATCH | `/users/deactivate` | Deactivate account | Private |

### Job Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/jobs` | Create new job | Client |
| GET | `/jobs` | Get all jobs with filters | Public |
| GET | `/jobs/:id` | Get job by ID | Public |
| PUT | `/jobs/:id` | Update job | Client (owner) |
| DELETE | `/jobs/:id` | Delete job | Client (owner) |
| GET | `/jobs/client/my-jobs` | Get client's jobs | Client |
| POST | `/jobs/hire` | Hire developer | Client |
| PATCH | `/jobs/:id/complete` | Mark job as completed | Client |

### Application Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/applications/job/:jobId` | Apply to job | Developer |
| GET | `/applications/job/:jobId` | Get job applications | Client (owner) |
| GET | `/applications/my-applications` | Get developer's applications | Developer |
| PUT | `/applications/:id` | Update application | Developer (owner) |
| PATCH | `/applications/:id/withdraw` | Withdraw application | Developer (owner) |

### Messaging Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/messages` | Send message | Private |
| GET | `/messages/job/:jobId` | Get job messages | Private |
| GET | `/messages/conversations` | Get all conversations | Private |
| PATCH | `/messages/:messageId/read` | Mark message as read | Private |
| GET | `/messages/unread-count` | Get unread count | Private |

### Rating Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/ratings` | Create rating | Client |
| GET | `/ratings/developer/:developerId` | Get developer ratings | Public |
| GET | `/ratings/job/:jobId` | Get job rating | Public |
| PUT | `/ratings/:ratingId` | Update rating | Client (owner) |
| DELETE | `/ratings/:ratingId` | Delete rating | Client (owner) |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/admin/analytics` | Get dashboard analytics | Admin |
| GET | `/admin/users` | Get all users | Admin |
| GET | `/admin/jobs` | Get all jobs | Admin |
| DELETE | `/admin/users/:userId` | Delete user | Admin |
| DELETE | `/admin/jobs/:jobId` | Delete job | Admin |
| PATCH | `/admin/users/:userId/toggle-status` | Toggle user status | Admin |
| GET | `/admin/statistics` | Get platform statistics | Admin |

## 📋 Request/Response Examples

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "developer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8a123b456789012345678",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "developer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2023-09-06T10:30:00.000Z"
}
```

### Create Job Posting
```bash
POST /api/jobs
Authorization: Bearer 
Content-Type: application/json

{
  "title": "Build E-commerce Website",
  "description": "Looking for a full-stack developer to build a modern e-commerce website...",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "budget": 2500,
  "budgetType": "fixed",
  "deadline": "2024-02-15T00:00:00.000Z",
  "experienceLevel": "intermediate",
  "category": "web-development"
}
```

### Apply to Job
```bash
POST /api/applications/job/64f8a123b456789012345678
Authorization: Bearer 
Content-Type: application/json

{
  "coverLetter": "I am excited to work on your e-commerce project...",
  "proposedRate": 2200,
  "estimatedDuration": "3 weeks",
  "portfolio": [
    {
      "title": "E-commerce Dashboard",
      "url": "https://demo.example.com",
      "description": "Admin dashboard for managing products"
    }
  ]
}
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure access and refresh token implementation
- **Role-based Access**: Different permissions for clients, developers, and admins
- **Password Security**: Bcrypt hashing with salt rounds
- **Token Rotation**: Automatic refresh token rotation

### Security Middleware
- **Helmet**: Security headers protection
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: File type and size validation

### Data Protection
- **Environment Variables**: Sensitive data protection
- **Database Security**: Mongoose schema validation
- **Error Handling**: Secure error messages without data leakage

## 🗄️ Database Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (client/developer/admin),
  avatar: String,
  isEmailVerified: Boolean,
  
  // Developer-specific fields
  bio: String,
  skills: [String],
  hourlyRate: Number,
  experience: String,
  portfolio: String,
  resume: String,
  rating: Number,
  totalRatings: Number,
  completedProjects: Number,
  
  // Client-specific fields
  company: String,
  phoneNumber: String,
  
  // System fields
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model
```javascript
{
  title: String,
  description: String,
  requiredSkills: [String],
  budget: Number,
  budgetType: String (fixed/hourly),
  deadline: Date,
  experienceLevel: String,
  client: ObjectId (ref: User),
  status: String (open/in_progress/completed/cancelled),
  hiredDeveloper: ObjectId (ref: User),
  applications: [ObjectId] (ref: Application),
  category: String,
  isUrgent: Boolean,
  estimatedDuration: String,
  paymentReleased: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model
```javascript
{
  job: ObjectId (ref: Job),
  developer: ObjectId (ref: User),
  coverLetter: String,
  proposedRate: Number,
  estimatedDuration: String,
  status: String (pending/accepted/rejected/withdrawn),
  portfolio: [{
    title: String,
    url: String,
    description: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 📧 Email Templates

The platform includes comprehensive email notifications:

- **Welcome Email**: New user registration
- **Job Application**: Notify clients of new applications
- **Hire Notification**: Notify developers when hired
- **Job Completion**: Project completion notifications
- **Password Reset**: Secure password reset process
- **Email Verification**: Account verification
- **Message Notifications**: New message alerts

## 📊 Logging & Monitoring

### Logging System
- **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG
- **File-based Logging**: Separate log files by level
- **Request Logging**: HTTP request/response logging
- **Structured Logging**: JSON-formatted log entries

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run seed        # Seed database with sample data

# Database
npm run db:reset    # Reset database (clear all data)
npm run db:migrate  # Run database migrations (if implemented)

# Testing (to be implemented)
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsync
   JWT_SECRET=your-production-jwt-secret
   # ... other production values
   ```

2. **Database Setup**
   - Use MongoDB Atlas for cloud hosting
   - Set up proper indexes for performance
   - Configure backup strategies

3. **File Storage**
   - Configure AWS S3 or similar for file uploads
   - Set up CDN for better performance

### Deployment Platforms

#### Heroku
```bash
# Install Heroku CLI and login
heroku create skillsync-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
# ... set other config vars
git push heroku main
```

#### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### AWS EC2 / DigitalOcean
- Set up reverse proxy with Nginx
- Configure SSL certificates
- Set up process manager (PM2)
- Configure environment variables

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** (when test suite is implemented)
5. **Run linting**
   ```bash
   npm run lint
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Code Style Guidelines

- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and constructors
- Use **UPPER_SNAKE_CASE** for constants
- Add **JSDoc comments** for functions
- Follow **RESTful API** conventions
- Implement proper **error handling**
- Write **descriptive commit messages**

### Testing Guidelines (Future Implementation)

- Write unit tests for all controllers
- Add integration tests for API endpoints
- Mock external services (email, payment)
- Achieve minimum 80% code coverage

## 📋 TODO / Roadmap

### Phase 1 - Core Features ✅
- [x] User authentication and authorization
- [x] Job posting and management
- [x] Application system
- [x] Basic messaging
- [x] Rating and review system
- [x] Admin panel

### Phase 2 - Enhanced Features 🚧
- [ ] Real-time messaging with WebSockets
- [ ] Advanced search and filtering
- [ ] Payment integration completion
- [ ] Email notification system
- [ ] File upload optimization
- [ ] API rate limiting enhancement

### Phase 3 - Advanced Features 📅
- [ ] AI-powered job matching
- [ ] Video call integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app API optimization
- [ ] Multi-language support
- [ ] Advanced reporting system

### Phase 4 - Scaling & Performance 🔮
- [ ] Database optimization and indexing
- [ ] Caching implementation (Redis)
- [ ] CDN integration for file serving
- [ ] Microservices architecture
- [ ] Load balancing setup
- [ ] Monitoring and alerting

## ⚠️ Known Issues

1. **File Upload**: Currently stores files locally; needs cloud storage integration
2. **Real-time Features**: WebSocket implementation pending
3. **Payment Processing**: Stripe integration needs completion
4. **Email Queue**: Email sending should be queued for better performance
5. **Test Coverage**: Comprehensive test suite needs implementation

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
*Solution*: Ensure MongoDB is running on your system

**JWT Token Error**
```bash
Error: jwt malformed
```
*Solution*: Check if JWT_SECRET is properly set in .env file

**File Upload Error**
```bash
Error: ENOENT: no such file or directory, open 'uploads/...'
```
*Solution*: Ensure uploads directory exists with proper permissions

**Email Service Error**
```bash
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
*Solution*: Use App Password for Gmail, not regular password

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // Add to MongoDB
   db.jobs.createIndex({ "requiredSkills": 1 })
   db.jobs.createIndex({ "status": 1, "createdAt": -1 })
   db.users.createIndex({ "email": 1 }, { unique: true })
   ```

2. **Query Optimization**
   - Use `select()` to limit returned fields
   - Implement pagination for large datasets
   - Use aggregation pipelines for complex queries

3. **Caching Strategy**
   - Implement Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static file serving

## 📞 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: contact@skillsync.com (if applicable)

### Useful Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/) - JWT debugging
- [Stripe API Documentation](https://stripe.com/docs/api)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Developer**: [Your Name](https://github.com/yourusername)
- **Project Manager**: [Name](mailto:email@example.com)
- **UI/UX Designer**: [Name](mailto:email@example.com)

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the robust database solution
- All contributors and testers
- Open source community for inspiration and support

**Built with ❤️ by the SkillSync Team**

For more information, visit our [website](https://skillsync.com) or follow us on [Twitter](https://twitter.com/skillsync).