# 🏪 Laptop Store CRM System

A comprehensive Customer Relationship Management system built for laptop stores with multi-location support, real-time notifications, and complete sales & repair tracking.

## ✨ Features

### 🛍️ Sales Management

- Multi-store inventory tracking
- Customer search with barcode scanning
- Payment processing (Cash, Card, UPI, EMI)
- Sales analytics and reporting

### 🔧 Repair Management

- Complete repair workflow
- Real-time status tracking
- WhatsApp & Email notifications
- Technician assignment and tracking

### 👥 Customer Management

- Comprehensive customer profiles
- Purchase history tracking
- Loyalty points system
- Communication preferences

### 📊 Analytics & Reporting

- Sales performance dashboards
- Repair service metrics
- Multi-store comparison
- Revenue analytics

### 🔔 Real-time Notifications

- WhatsApp Business API integration
- Professional HTML email templates
- Automated status updates
- Customer consent management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/laptop-store-crm.git
   cd laptop-store-crm
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**

   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb/brew/mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

5. **Seed Database**

   ```bash
   npm run seed
   ```

6. **Start Development Server**

   ```bash
   npm run dev
   ```

7. **Access Application**
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:5001/api

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/laptop_store_crm

# Server
PORT=5001
NODE_ENV=development

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=your_whatsapp_number

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📱 Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Router** for navigation
- **Recharts** for analytics

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Express Validator** for validation
- **Helmet** for security

### Notifications

- **Twilio** WhatsApp Business API
- **Nodemailer** for email delivery
- **Professional HTML templates**

### Development

- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Concurrently** for development workflow

## 📖 API Documentation

### Health Check

```bash
GET /api/health
```

### Customers

```bash
GET    /api/customers          # Get all customers
POST   /api/customers          # Create customer
GET    /api/customers/:id      # Get customer by ID
PUT    /api/customers/:id      # Update customer
DELETE /api/customers/:id      # Delete customer
```

### Products

```bash
GET    /api/products           # Get all products
POST   /api/products           # Create product
GET    /api/products/:id       # Get product by ID
PUT    /api/products/:id       # Update product
```

### Sales

```bash
GET    /api/sales              # Get all sales
POST   /api/sales              # Create sale
GET    /api/sales/:id          # Get sale by ID
PUT    /api/sales/:id/status   # Update sale status
```

### Repairs

```bash
GET    /api/repairs            # Get all repairs
POST   /api/repairs            # Create repair
GET    /api/repairs/:id        # Get repair by ID
PUT    /api/repairs/:id/status # Update repair status
```

### Notifications

```bash
GET    /api/notifications/test         # Test notification services
POST   /api/notifications/repair/:id   # Send repair notification
```

## 🏗️ Project Structure

```
laptop-store-crm/
├── src/                      # Frontend source
│   ├── components/           # React components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
├── models/                  # MongoDB models
├── routes/                  # Express routes
├── middleware/              # Express middleware
├── services/                # Backend services
├── scripts/                 # Database scripts
├── server.js                # Main server file
├─��� package.json             # Dependencies
└── .env                     # Environment config
```

## 🔄 Development Scripts

```bash
npm run dev          # Start development server
npm run client       # Start frontend only
npm run server       # Start backend only
npm run build        # Build for production
npm run seed         # Seed database with sample data
npm run db:reset     # Reset database
```

## 📝 Sample Data

The system includes comprehensive sample data:

- 3 stores (Central, North, South)
- Sample customers with purchase history
- Product inventory with multi-store stock
- Sales transactions
- Repair tickets with notification settings

## 🛡️ Security Features

- Helmet.js security headers
- Rate limiting
- Input validation
- JWT authentication
- Environment variable protection
- CORS configuration

## 📱 PWA Features

- Offline functionality
- App installation
- Service worker caching
- Mobile-responsive design

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@laptopstore.com or create an issue on GitHub.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world CRM requirements
- Designed for scalability and maintainability
