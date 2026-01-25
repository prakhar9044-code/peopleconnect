# PeopleConnect | Elite Support Ecosystem

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-purple)

**PeopleConnect** is a comprehensive web platform designed to bridge the gap between social welfare services and personal mental wellness. It combines hyper-local resource discovery (food, shelter, medical) with productivity tools and clinical-grade mental health assessments.

---

## 🌟 Key Features

### 🧠 Mental Wellness & Health
* **Wellness Assessment Survey:** An interactive 8-question survey that calculates a stress score and classifies the user into zones (Green, Yellow, Red).
* **PDF Report Generation:** Users can download a detailed PDF report of their mental health status, including specific biological and neural recovery protocols.
* **Breathe & Grounding:** Built-in interactive breathing exercises and a "5-4-3-2-1" sensory grounding tool to reduce anxiety.
* **Daily Journal:** A reflection log with mood tracking (saved to LocalStorage).

### 🚀 Productivity (Deep Work Zone)
* **Focus Timer:** A customizable Pomodoro-style timer (Work/Break intervals) with visual progress.
* **Ambient Mixer:** Adjustable background sounds (Rain, Lo-Fi, Cafe) to aid concentration.
* **Brain Dump:** A distraction pad to type out thoughts without leaving the focus session.

### 📍 Service Locator & Hub
* **Geo-Locator:** A simulated radar interface that finds nearby community kitchens, shelters, and clinics.
* **Service Hub:** Categorized cards for government-listed and community-verified resources.

### 🛡️ Admin & User System
* **Authentication:** Fully functional mock Login/Registration system.
* **Admin Dashboard:** A protected panel to view all registered users, survey results, and journal entries.
* **Database Export:** Admin capability to download the entire system data (Users/Logs) as a PDF report.
* **Data Persistence:** All data is persisted using the browser's `LocalStorage`.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Properties, Glassmorphism, Animations, Flexbox/Grid).
* **Logic:** Vanilla JavaScript (ES6+).
* **Data Storage:** Browser LocalStorage (No backend required for demo).
* **Libraries:**
    * [jsPDF](https://github.com/parallax/jsPDF) (For generating PDF reports).
    * [FontAwesome 6](https://fontawesome.com/) (For icons).
    * [Google Fonts](https://fonts.google.com/) (Plus Jakarta Sans & Playfair Display).

---

## 📂 Project Structure

```text
/people-connect
│
├── index.html      # Main HTML structure
├── style.css       # All styling, animations, and responsive design
├── script.js       # Logic for Auth, PDFs, Timer, and Data Management
└── README.md       # Project documentation
