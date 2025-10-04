# Family Care

## 📋 Table of Contents

- [🔍 About](#-about-the-project)
- [🏗️ Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
- [📄 License](#-license)

## 🔍 About The Project

**Family Care** is the perfect way to keep track of your and your family's health. You no longer will have to search through your drawers, try to decode any details, and figure out what appointments you need to book. With Family Care, you can do all of that in one place!

### **✨ Key Features**

- Securely store your health information in one place
- Keep the details of your and your family's past appointments by uploading PDFs of your medical records
- Be reminded of outdated medical statistics
- Book next appointments through the NFZ API
- Talk to your data via our MCP server

### **🏗️ Architecture**

- Frontend build in React
- FastAPI-based backend
- PostgreSQL database storing fragile information
- MCP server for talking to your health data


### **🚀 Getting Started**

Follow these steps to set up Family Care in your environment.

Prerequisites
- **Docker**: For dependency management

Installation & Setup
1. Clone the repository
  ```
  https://github.com/farce1/family-care-hackathon.git
  ```
3. Add a .env with your OpenAI API key to your backend:
  ```bash
 echo "API_KEY=<your key here>" > backend/.env
  ```
4. Set up your environment with Docker:
  ```bash
  docker-compose up --build
  ```
6. Create an user to authenticate with:
  ```
   curl -X POST "http://localhost:8000/auth/create-test-user?email=test@example.com&first_name=Test&last_name=User"
  ```
8. Open the page in your browser:
  ```
   http://localhost:3000
  ```

## 📄 License

Distributed under the MIT License. See [MIT License](LICENSE) for more information.
