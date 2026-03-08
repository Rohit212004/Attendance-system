# 📚 Class Attendance & Task Scheduling System

A modern, responsive **Single-Page Application (SPA)** built with **React.js**, **Firebase**, and **Tailwind CSS**, designed for managing student attendance and assignments. Fully configured for deployment on **GitHub Pages**.

![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.8.0-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg)

---

## ✨ Features

### 👨‍🏫 Teacher Features (Protected Routes)
- **Secure Authentication**: Local authentication with credentials stored in .env file
- **Excel Upload**: Create class roster by uploading .xlsx or .csv files
- **Attendance Management**: Mark students present/absent for any date
- **Task Scheduling**: Create, edit, and delete assignments with due dates
- **Real-time Dashboard**: View statistics and manage your class
- **Single Teacher Access**: Only authorized teacher credentials can access the portal

### 👨‍🎓 Student/Public Features (No Login Required)
- **View Attendance**: See daily attendance records for all students
- **View Tasks**: Browse all assignments with due dates and status
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Live Statistics**: View attendance counts and task statuses

---

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 (via Vite)
- **Routing**: React Router v6 with HashRouter (GitHub Pages compatible)
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Excel Parsing**: xlsx library
- **Deployment**: GitHub Pages via gh-pages

---

## 📁 Project Structure

```
attendance-system/
├── src/
│   ├── components/
│   │   └── Layout.jsx              # Navigation and footer
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── firebase/
│   │   └── config.js               # Firebase configuration
│   ├── pages/
│   │   ├── Home.jsx                # Landing page
│   │   ├── Login.jsx               # Teacher login
│   │   ├── TeacherDashboard.jsx    # Teacher dashboard
│   │   ├── AttendanceManagement.jsx # Mark attendance
│   │   ├── TaskManagement.jsx      # Manage tasks
│   │   ├── PublicAttendance.jsx    # View attendance (public)
│   │   └── PublicTasks.jsx         # View tasks (public)
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Tailwind styles
├── public/
├── index.html
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── package.json                    # Dependencies and scripts
├── firestore.rules                 # Firestore security rules
└── README.md
```

---

## 🚀 Setup Instructions

### Step 1: Clone and Install Dependencies

```powershell
cd "c:\Users\vishw\Documents\attendance system"
npm install
```

### Step 2: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Firebase Services**
   
   **Authentication:**
   - Go to Authentication → Get Started
   - Enable "Email/Password" sign-in method
   - Go to Users tab → Add User
   - Create a teacher account (e.g., teacher@school.com)

   **Firestore Database:**
   - Go to Firestore Database → Create Database
   - Start in **Production Mode**
   - Choose your region
   - After creation, go to Rules tab and paste the rules from `firestore.rules`

   **Storage (Optional):**
   - Go to Storage → Get Started
   - Start in Production Mode
   - Apply the rules from `storage.rules`

3. **Get Firebase Configuration**
   - Go to Project Settings (⚙️ icon)
   - Scroll to "Your apps" → Click Web icon (`</>`)
   - Register your app (name: "Attendance System")
   - Copy the firebaseConfig object

4. **Update Firebase Config**
   - Open `src/firebase/config.js`
   - Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### Step 3: Configure for GitHub Pages

1. **Update package.json**
   - Open `package.json`
   - Replace `YOUR_GITHUB_USERNAME` in the homepage field:
   ```json
   "homepage": "https://yourusername.github.io/attendance-system"
   ```

2. **Update vite.config.js**
   - Ensure the `base` field matches your repository name:
   ```javascript
   base: '/attendance-system/'
   ```

### Step 4: Test Locally

```powershell
npm run dev
```

Visit `http://localhost:5173` to test the application.

**Test Credentials:**
- Use the teacher account you created in Firebase Authentication

---

## 📤 Deployment to GitHub Pages

### Step 1: Create GitHub Repository

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Attendance System"

# Create repository on GitHub (via website), then:
git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy to GitHub Pages

```powershell
npm run deploy
```

This command will:
1. Build your React app (`npm run build`)
2. Create a `dist` folder with optimized production files
3. Push the `dist` folder to a `gh-pages` branch
4. GitHub Pages will automatically serve from this branch

### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select `gh-pages` branch
4. Click **Save**
5. Wait 2-3 minutes for deployment

Your app will be live at:
```
https://YOUR_USERNAME.github.io/attendance-system/
```

---

## 🔄 Making Updates

After making changes to your code:

```powershell
# Test locally first
npm run dev

# When ready to deploy
git add .
git commit -m "Description of changes"
git push origin main

# Deploy to GitHub Pages
npm run deploy
```

---

## 📊 Firebase Database Structure

### Collections

**students**
```json
{
  "id": "auto-generated",
  "name": "John Doe",
  "rollNo": "101",
  "createdAt": "2026-03-06T10:30:00Z"
}
```

**attendance**
```json
{
  "id": "auto-generated",
  "studentId": "student_doc_id",
  "date": "2026-03-06",
  "status": "present",
  "markedAt": "2026-03-06T09:00:00Z"
}
```

**tasks**
```json
{
  "id": "auto-generated",
  "title": "Math Assignment",
  "description": "Complete exercises 1-10",
  "dueDate": "2026-03-15",
  "createdAt": "2026-03-06T10:00:00Z"
}
```

---

## 📝 Excel File Format

When uploading student rosters, use this format:

| Name        | Roll No |
|-------------|---------|
| John Doe    | 101     |
| Jane Smith  | 102     |
| Bob Johnson | 103     |

**Supported column names:**
- Name, name, StudentName, Student Name
- RollNo, Roll No, Roll, roll_no

---

## 🔒 Security Rules

The application uses the following Firebase security model:

- **Public Read**: Anyone can read attendance and tasks
- **Authenticated Write**: Only authenticated teachers can create/modify data
- **Authentication**: Required for all teacher routes

To update security rules:
1. Modify `firestore.rules` or `storage.rules`
2. Deploy rules via Firebase Console or Firebase CLI

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YOUR_COLOR',
        600: '#YOUR_COLOR',
        // ... more shades
      }
    }
  }
}
```

### Change App Name

1. Update `index.html` title tag
2. Update [src/components/Layout.jsx](src/components/Layout.jsx) brand text
3. Update [README.md](README.md)

---

## 🐛 Troubleshooting

### Issue: 404 Error on Page Refresh
**Solution**: Ensure you're using HashRouter (already configured)

### Issue: Firebase Not Connecting
**Solution**: 
- Verify Firebase config in [src/firebase/config.js](src/firebase/config.js)
- Check Firebase project settings
- Ensure Firestore and Authentication are enabled

### Issue: Deployment Fails
**Solution**:
- Verify `homepage` in `package.json` matches your repo
- Ensure `gh-pages` package is installed
- Check GitHub repository settings

### Issue: Excel Upload Not Working
**Solution**:
- Ensure Excel file has correct column names
- Check browser console for errors
- Verify Firestore rules allow writes

---

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

This is a complete, production-ready application. To extend functionality:

1. Add new pages in `src/pages/`
2. Register routes in `src/App.jsx`
3. Update navigation in `src/components/Layout.jsx`
4. Deploy changes with `npm run deploy`

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Developer

Built with ❤️ as a complete attendance management solution.

---

## 🆘 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Firebase Console for errors
3. Check browser console for JavaScript errors
4. Ensure all environment variables are set correctly

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Set up Firebase project
3. ✅ Update Firebase configuration
4. ✅ Test locally
5. ✅ Create GitHub repository
6. ✅ Deploy to GitHub Pages
7. 🎉 Share your live URL!

**Live URL Format:**
```
https://YOUR_USERNAME.github.io/attendance-system/
```

---

**Happy Coding! 🚀**
