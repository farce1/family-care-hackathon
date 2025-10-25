# Family Care

## 📋 Table of Contents

- [🔍 About](#-about-the-project)
- [🏗️ Architecture](#arch)
- [🚀 Getting Started](#-getting-started)
  - [🐳 Docker Compose](#docker)
  - [💻 Local Environment](#local)
- [📄 License](#-license)

## 🔍 About The Project

**Family Care** is the perfect comprehensive health management solution designed to keep track of your and your family's complete wellness journey. You no longer will have to search through countless drawers filled with scattered medical papers, remember which specialist you saw last year, or figure out what appointments you need to book next. With Family Care, you can seamlessly manage all of your family's health information, medical history, appointments, medications, and wellness goals in one secure, organized, and easily accessible digital platform. From tracking your toddler's vaccination schedule to managing grandparents' medication routines, Family Care brings clarity and peace of mind to family health management.

### 🎥 Product Presentation
**Trusted by Industry Leaders:**
[Momentum.ai](https://www.linkedin.com/posts/the-momentum-ai_hackathon-momentum-healthcareinnovation-activity-7382384274559193088-vaNH?utm_source=share&utm_medium=member_desktop&rcm=ACoAACjFEB0BJ5pt0LFZiBV_tbahZY06xQsza8g) recognized and trusted the idea behind Family Care.

## Why use Family Care?
- Keep all of your medical records in one place
- Remind yourself of previous and upcoming appointments
- Check what appointments you should book without having to keep each previous visit in mind

## **✨ Key Features**

- Securely store your health information in one place
- Keep the details of you and your family's past appointments by uploading PDFs of your medical records
- Be reminded of outdated medical statistics
- Book next appointments through the NFZ API

## **🏗️ Architecture** <a name="arch"></a>

- Frontend build in Next.js
- FastAPI-based backend
- PostgreSQL database storing fragile information


## **🚀 Getting Started**

Follow these steps to set up Family Care in your environment.

### 🐳 Running with Docker Compose (Recommended) <a name="docker"></a>

**Prerequisites:**
- Docker and Docker Compose installed

**Setup:**
1. Clone the repository:
   ```bash
   git clone https://github.com/farce1/family-care-hackathon.git
   cd family-care-hackathon
   ```

2. Add your OpenAI API key to the backend:
   ```bash
   echo "API_KEY=<your key here>" > backend/.env
   ```

3. Start all services:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - **Frontend** (Next.js) - http://localhost:3000
   - **Backend** (FastAPI) - http://localhost:8000
   - **PostgreSQL Database** - localhost:5434

4. Create a test user:
   ```bash
   curl -X POST "http://localhost:8000/auth/create-test-user?email=test@example.com&first_name=Test&last_name=User"
   ```

5. Open the application:
   ```
   http://localhost:3000
   ```

### 💻 Running Individually (Development) <a name="local"></a>

### Frontend (Next.js)

**Prerequisites:**
- Node.js 20+
- npm

**Setup:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

**Other commands:**
```bash
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend (FastAPI)

**Prerequisites:**
- Python 3.12+
- PostgreSQL running locally

**Setup:**
```bash
cd backend
pip install -r requirements.txt

# Set environment variables
echo "API_KEY=<your OpenAI key>" > .env
export DATABASE_URL=postgresql://familycare:familycare@localhost:5434/familycare

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
API documentation: http://localhost:8000/docs

## 📄 License

Distributed under the MIT License. See [MIT License](LICENSE) for more information.
