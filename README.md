# CabMate 🚖

CabMate is a web-based ride-sharing application designed to connect commuters—specifically students or employees within an organization—enabling them to share cabs, reduce travel costs, and foster a community-driven approach to transportation.

## Features ✨

*   **User Authentication**: Secure signup and login functionality.
*   **Create a Ride**: offer a ride by specifying origin, destination, date, time, and available seats.
*   **Find & Join Rides**: Browse available rides and request to join existing ones.
*   **Ride Management**:
    *   Approve or reject join requests.
    *   Leave a ride if plans change.
    *   Delete rides (for ride owners).
*   **In-Ride Chat**: Communicate with other passengers within a specific ride to coordinate pickup details.
*   **User Profiles**: View user details including name, batch, and registration number.

## Tech Stack 💻

*   **Frontend**:
    *   HTML5
    *   CSS3 (Custom styling with responsive design)
    *   Vanilla JavaScript (ES6+)
*   **Backend**:
    *   Node.js
    *   Express.js
    *   Mongoose (MongoDB ODM)
    *   Firebase Admin (for user verification/auth integration)
*   **Database**:
    *    MongoDB

## Prerequisites 📋

Before running the application, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/) (running locally or a cloud instance like MongoDB Atlas)

## Setup Instructions 🚀

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CabMate
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/cabshare  # Or your MongoDB Atlas URI
```

Start the backend server:

```bash
npm start
# or for development with auto-restart
npm run dev
```

The server should now be running on `http://localhost:4000`.

### 3. Frontend Setup

The frontend is built with static HTML/JS files. You can serve them using a simple HTTP server.

If you have Python installed:

```bash
cd ../frontend
python -m http.server 5500
```
Or using Node.js `http-server`:

```bash
npx http-server ./frontend
```

Open your browser and navigate to `http://localhost:5500` (or whatever port your server is running on).

## Usage 📱

1.  **Register**: Create a new account with your details (Name, Batch, RegNo, Email).
2.  **Login**: Use your credentials to access the dashboard.
3.  **Dashboard**:
    *   **Offer a Ride**: Click "Offer a Ride" to create a new carpool.
    *   **Find Rides**: Browse the list of available rides.
4.  **Join**: Click "Join" on a ride you're interested in. The owner will receive a request.
5.  **Chat**: Once joined, use the chat feature to discuss details.

## Project Structure 📂

```
CabMate/
├── backend/            # Express.js server and database models
│   ├── server.js       # Main server file
│   ├── package.json    # Backend dependencies
│   └── ...
├── frontend/           # Static frontend files
│   ├── index.html      # Landing page
│   ├── dashboard.html  # Main user interface
│   ├── script.js       # Frontend logic
│   ├── style.css       # Global styles
│   └── ...
└── README.md           # Project documentation
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is open-source and available under the [MIT License](LICENSE).
