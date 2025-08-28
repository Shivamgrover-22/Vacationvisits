## VacationVisits - Backend Setup

1. Create a `.env` file in the project root:

```
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

2. Install dependencies (already added in package.json):

```
npm install
```

3. Start the server:

```
npm start
```

4. Open `http://localhost:3000` in your browser.

### API Endpoints
- POST `/api/enquiries` { name, email, phone, destination, message }
- POST `/api/searches` { query }
- GET `/api/deals/:id` (e.g., `hyatt-special`)
- POST `/api/itinerary` { prompt } (requires `GEMINI_API_KEY`)

Data is stored in `data/db.json`.


