# AI Usage & Prompting Log

**Project:** Campus Event Hub  
**Developer:** Kelv08  
**AI Assistant:** Gemini  

---

## 1. How I Used AI on This Project

Building this Campus Event Hub app was a smooth process overall, but I ran into a few tricky hurdles along the way with JavaScript scope, Git merge conflicts, and cloud settings. I used Gemini as a real-time coding buddy and troubleshooter to help me break down confusing error messages, organize my git workflow, and walk me through setting up hosting on Vercel step-by-step.

---

## 2. Key Challenges & Key Prompts

### Prompt 1: Fixing Inline `onclick` Button Errors
* **The Situation:** When I clicked buttons like "Register" or "Manage" on the screen, the browser kept saying the function didn't exist even though I had written it in my `app.js`.
* **What I Asked:** *"Why is my inline onclick handler not recognizing the function defined in my JavaScript file?"*
* **How We Solved It:** We realized my HTML buttons couldn't find the functions inside module scopes. Attaching them cleanly to `window` (or using clean top-level function declarations like `function toggleManageAuth(eventId)`) made sure the browser's DOM could see the functions immediately when a user clicks a button.

### Prompt 2: Clearing Up the Git Merge Freeze
* **The Situation:** Right when I was finishing up the project, Git gave me a headache by throwing a merge conflict on line 106 (`renderEventsList`) when I tried amending a commit.
* **What I Asked:** *"When I tried committing, it said you are in the middle of merge, it cannot amend."*
* **How We Solved It:** We ran `git merge --abort` to step away from the stuck merge door, amended the commit message cleanly, and then ran `git push origin main --force`. This wiped out the weird remote conflict on GitHub and pushed my clean, working laptop code as the true `main` branch.

### Prompt 3: Setting Up Vercel Hosting
* **The Situation:** I needed to take my app from my local laptop screen and put it live on the internet so anyone can access it on their phone.
* **What I Asked:** *"Walk me through the entire process as if you are explaining to a toddler... should I click all or select repositories?"*
* **How We Solved It:** We connected my GitHub directly to Vercel, selected "All repositories" so Vercel could safely read my project code without making private repos public, and deployed it directly using standard HTML/CSS/JS defaults.

### Prompt 4: Connecting Supabase to the Live Vercel Link
* **The Situation:** Once the site went live on Vercel, my database calls needed authorization to send and fetch event registrations.
* **What I Asked:** *"Walk me through the processes I need to follow when I want to authenticate this on Supabase in my Vercel."*
* **How We Solved It:** We copied my live Vercel link (`.vercel.app`) and added it directly inside my Supabase dashboard under `Authentication -> URL Configuration` (Site URL and Redirect URLs) and `API -> CORS Origins`. This allowed my live frontend to talk directly to my Supabase backend without security locks blocking it.

---

## 3. My Main Takeaway

Having an AI pair programmer made it super easy to learn *why* things were breaking instead of just blindly fixing them. It really helped me understand how Git branches talk to each other, how browsers handle DOM window objects, and how modern web deployment works from end to end.