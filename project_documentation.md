# 🎓 Campus Event Hub

Welcome to **Campus Event Hub**! This is a simple, responsive web app I built to make campus events super easy to explore, register for, and manage. Students can check out upcoming events and register in seconds, while event managers can toggle passcode-protected controls to manage attendee lists or delete old posts.

---

## ✨ Cool Features

* **Real-Time Event Display:** View all active events pulled dynamically straight from the database.
* **Smooth Toggle Forms:** Click "Register" or "Manage" to open forms right on the page without reloading.
* **Passcode Protection:** Keep management actions secure so only people with the right code can tamper with event details or view attendee info.
* **Cloud Database Sync:** Everything saves directly to Supabase so your data stays updated.
* **Live Web Access:** Fully hosted on Vercel so you can test it on your laptop or phone!

---

## 🛠️ Tech Stack I Used

* **HTML5:** Built the main structure of the web pages.
* **CSS3:** Styled the UI, handled responsive layouts, and controlled hidden/visible screen states.
* **JavaScript (Vanilla ES6+):** Handled dynamic DOM updates, button click events, and data fetching using `async/await`.
* **Supabase:** Cloud database handling data storage and client API connections.
* **Git & GitHub:** For version control, keeping my project history organized, and backing up my code.
* **Vercel:** Cloud hosting platform that automatically deploys my project directly from GitHub.

---

## 💡 How It Works (In Plain English!)

If you're new to coding, here is how the whole app comes together behind the scenes:

### 1. Showing and Hiding Things on the Screen (DOM Manipulation)
When you click a button on the site, JavaScript catches that click event (`onclick`). It finds the exact box on the page using its ID (`document.getElementById`) and flips a CSS class named `'hidden'` on or off. That’s how forms slide open and shut smoothly without forcing the entire web browser to reload!

### 2. Talking to the Database (Supabase Client)
Instead of building a giant backend server from scratch, I used Supabase. My JavaScript code sends requests over the internet using `supabase.from('events').select('*')` to ask for the latest event list. As soon as Supabase sends the data back, my JavaScript builds the HTML content and drops it onto your screen.

### 3. Letting the Live Web Talk to the Database (CORS Rules)
Databases are very protective about who gets to talk to them. When I put my site live on Vercel, Supabase would normally block it for security reasons. By adding my new live Vercel address into the Supabase URL Configuration and CORS settings, I gave my live website official permission to save registrations and retrieve data.

---

## 🚀 How to Run This Project Locally

Want to test this project out on your own computer? Just follow these simple steps:

1. **Clone this repository to your laptop:**
   ```bash
   git clone https://github.com/KELVO8/clbg-project.git
   ```

2. **Open the folder:**
   ```bash
   cd clbg-project
   ```

3. **Run the app:**
   * Simply double-click `index.html` to open it in your web browser, or open the project folder in VS Code and hit **Go Live** using the Live Server extension!

---

## 📌 Pushing New Updates to GitHub

To save and update these documentation files on your GitHub repo, open your VS Code terminal (`Ctrl + ~`) and run:

```bash
git add README.md AI_USAGE.md
git commit -m "Update README and AI usage logs"
git push origin main
```