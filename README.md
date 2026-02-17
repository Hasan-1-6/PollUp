# PollUp

PollUp is a full-stack real-time polling application. It allows users to create polls, share them with a unique link, and see the results update live as people vote.

## Technologies Used

### Frontend
- React
- TailwindCSS
- React Router
- Socket.IO Client

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO

## Project Structure

The project is divided into two main parts:

- `backend/`: A Node.js and Express application that serves the API and handles the real-time communication via Socket.IO.
- `PollUp/`: A React single-page application built with Vite that provides the user interface for creating and voting on polls.

## Features

- **Create Polls**: Users can create polls with a question and multiple options.
- **Shareable Links**: Each poll has a unique, shareable URL.
- **Real-time Voting**: When a user votes, the poll results are updated instantly for all other users viewing the same poll, without needing to refresh the page.
- **Lifetime** : Each poll has a certain deadline after which it won't accept votes. Results are retained upto 30 days after creation
- **Vote Integrity**: The application prevents a user from voting more than once on the same poll.

## Real-time Voting with WebSockets

The real-time functionality is a core feature of PollUp, and it is achieved using WebSockets via the Socket.IO library. This provides a persistent, bidirectional communication channel between the client and the server.

### The Workflow

1.  **Client Joins a Poll Room**: When a user navigates to a specific poll's page, the React application establishes a WebSocket connection with the backend server. It then emits a `join-poll` event, sending the poll's unique ID to the server.

2.  **Server Manages Rooms**: The backend Socket.IO server receives the `join-poll` event and adds the client's socket to a "room" that is specific to that poll ID. This ensures that updates for a particular poll are only sent to the clients who are currently viewing it.

3.  **User Casts a Vote**: A user casts their vote by sending a standard HTTP POST request to the backend API.

4.  **Server Processes Vote and Broadcasts Update**: The backend controller handles the vote, updates the vote count in the MongoDB database, and then uses the Socket.IO instance to broadcast a `poll-update` event to all clients in that poll's room. The payload of this event contains the updated poll data.

5.  **Client Receives Update**: All clients in the room listen for the `poll-update` event. When they receive it, they update their component's state with the new poll data, which causes React to re-render the UI and display the new vote counts in real-time.

### Advantages of this Approach

-   **Instantaneous Updates**: This event-driven architecture ensures that users see the results of a vote immediately, providing a dynamic and engaging user experience.
-   **Efficiency**: Using WebSockets avoids the need for traditional HTTP polling, where the client would have to repeatedly send requests to the server to check for new data. This significantly reduces unnecessary network traffic and server load.
-   **Scalability**: By using Socket.IO's room feature, the server can efficiently manage many polls at once, as it only sends updates to the clients interested in a particular poll, rather than broadcasting every update to every connected client.

### Future scope 

- **Server Side Events / Webhooks** can be utilised for better scaling and performance compared to traditional web sockets
- **OAuth based voting** to ensure better protection against vote abuse with a tradeoff for lower engagement
- **Optional Sensitive Polls** to allow Polls to have the option to be less secure but more engagement oriented or more secure with lesser engagement
- **IP based Rate Limiting** to secure system against bot-abuse

## Getting Started

Frontend : /PollUp
Backend : /backend

### Backend Setup

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```

2.  Install the dependencies:
    ```sh
    npm install
    ```

3.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    MONGODB_URI=<your_mongodb_connection_string>
    ```

4.  Start the backend server:
    ```sh
    npm start
    ```
    The server will be running on port 3000.

### Frontend Setup

1.  In a separate terminal, navigate to the `PollUp` directory:
    ```sh
    cd ../PollUp
    ```

2.  Install the dependencies:
    ```sh
    npm install
    ```

3.  Start the frontend development server:
    ```sh
    npm run dev
    ```
    The React application will be running on `http://localhost:5173`.
