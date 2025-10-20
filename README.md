# Priority Interview Project

A full-stack application demonstrating a .NET Core 8 backend with a React frontend.

## Project Structure

```
priority-interview/
├── backend/
│   └── InterviewApi/          # .NET Core 8 Web API
│       ├── Program.cs         # Main API configuration
│       └── Properties/
│           └── launchSettings.json
├── frontend/
│   └── src/
│       ├── pages/             # React page components
│       │   └── Welcome.js     # Home page that fetches from API
│       ├── components/        # Reusable components
│       └── App.js             # Main React app with routing
└── README.md
```

## Setup Instructions

### Backend (.NET Core 8)
1. Navigate to backend folder:
   ```bash
   cd backend/InterviewApi
   ```
2. Restore dependencies:
   ```bash
   dotnet restore
   ```
3. Run the API:
   ```bash
   dotnet run --launch-profile http
   ```
4. API will run on: **http://localhost:5000**
5. Swagger UI available at: **http://localhost:5000/swagger**

### Frontend (React)
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. App will open on: **http://localhost:3000**

## API Endpoints

### Current Endpoints

#### GET `/api/assignment`
Returns the interview assignment details.

#### GET `/api/customer/welcome`
Returns a welcome message and list of available endpoints.

### TODO: Implement These Endpoints

The following endpoints need to be implemented as part of the interview:

1. **POST** `/api/customer` - Add a new customer
2. **GET** `/api/customer/{id}` - Get a customer by ID
3. **GET** `/api/customer/loyal?date=YYYY-MM-DD` - Find loyal customers at date
4. **POST** `/api/customer/register` - Register a customer at date

See `backend/InterviewApi/Controllers/CustomerController.cs` for detailed comments and instructions.

## Project Structure

### Backend
```
InterviewApi/
├── Controllers/
│   ├── AssignmentController.cs    # Assignment details endpoint
│   └── CustomerController.cs      # Customer APIs (to be implemented)
├── Data/
│   ├── customers.json             # Sample customer data (2 customers)
│   ├── hotels.json                # Sample hotel data (5 hotels)
│   └── visitations.json           # Sample visitation data (12 visitations)
├── Models/
│   └── InterviewAssignment.cs     # Data models
└── Program.cs                     # Application configuration
```

**Your Task**: Build a complete Hotel Visitation Management System:
- **Frontend**: Customer profile page, visitations grid, register visit modal
- **Backend**: Customer creation, visit registration, loyal customers API
- **Data**: Use provided JSON files as data sources
- **Focus**: Business logic, validation, proper HTTP responses, clean architecture

## Features

- ✅ .NET Core 8 Web API with Controllers
- ✅ Swagger/OpenAPI documentation
- ✅ CORS enabled for frontend communication
- ✅ React frontend with routing
- ✅ Basic structure ready for extension
- 🔨 Customer management APIs (to be implemented)
- 🔨 Services and Interfaces (to be created)
- 🔨 Data persistence (to be added)

## Adding New Pages

1. Create a new component file in `frontend/src/pages/` (e.g., `About.js`)
2. Add the route to the `routes` array in `App.js`:

```javascript
const routes = [
  { path: '/', name: 'Home', component: Welcome },
  { path: '/about', name: 'About', component: About }
];
```

The navigation will automatically update to include your new page!

## Technologies Used

- **Backend**: .NET Core 8, ASP.NET Core Web API
- **Frontend**: React 18, React Router
- **Styling**: CSS3
- **API Documentation**: Swagger/OpenAPI

