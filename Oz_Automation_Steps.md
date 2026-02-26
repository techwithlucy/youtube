# AI Automation Guide: AWS Cloud News Dashboard

This guide shows you how to build a professional, auto-updating website using **Warp AI** and **Oz**. You will create a site that fetches AWS news every day and updates itself automatically.

### Step 1: Login to the Tools

Before we start, we need to log in to the **Oz** system. This gives your terminal permission to run AI agents in the cloud.

* **Command:** `oz login`
* **What it does:** Opens a login window in your browser to verify your account.

---

### Step 2: Set Up Your Project

We need a place to store our code.

1. Go to GitHub and create a new repository named `cloud-news`.
2. Open your Warp terminal and run these commands:

```bash
# Downloads the empty folder from GitHub to your computer
git clone <your repo url>

# Moves your terminal into that folder
cd cloud-news

```

---

### Step 3: Use Warp AI to Build the Site

Now, open the **Warp Agent** (the AI side panel in your terminal). Paste the long prompt from the script. This single prompt tells the AI to create all the files:

* **index.html**: The layout of the site.
* **style.css**: The dark-mode, professional design.
* **fetch-news.js**: The "brain" that goes to AWS and grabs the news.

---

### Step 4: Add Special Features with Cloud Agents

We can use **Oz Agents** to add more features without writing the code ourselves.

**1. Add a News Ticker:**
This adds a moving bar at the top of your site showing the very latest headline.

```bash
oz agent run-cloud --name "ticker-feature" --prompt "Add a scrolling 'Breaking News' ticker to the top of index.html. Commit and push this change."

```

**2. Run a Security Scan:**
This checks your code to make sure it is safe from hackers.

```bash
oz agent run-cloud --name "security-audit" --prompt "Audit fetch-news.js for vulnerabilities. Create a SECURITY.md report."

```

---

### Step 5: Make Your Site Live

Now, send all the AI-generated code to GitHub.

```bash
# Prepares all new files
git add .

# Saves the files with a note
git commit -m "Initial Cloud News site"

# Sends the files to GitHub
git push origin main

```

**To see your site:** Go to your GitHub repo settings, click **Pages**, and select **GitHub Actions** as the source.

---

### Step 6: Create an "Oz Environment"

To automate the site, Oz needs to know which repository to watch.

* **Command:** `oz environment create --name "cloud-news" --repo "your-username/cloud-news"`
* **What it does:** Creates a "home" for your project in the Oz cloud.

---

### Step 7: Schedule Daily Updates

We want the news to refresh every day at midnight without us doing anything.

* **Command:**

```bash
oz schedule create \
  --name "aws-news-daily-updater" \
  --cron "0 0 * * *" \
  --environment <YOUR_ENVIRONMENT_ID> \
  --prompt "Run the update script. If there is new news, push it to GitHub."

```

* **Explanation of `--cron "0 0 * * *"`:** This is a timer code that means "Every night at 12:00 AM."

---

### Step 8: Ask the AI for a Summary

You can now ask your AI to read the news for you and give you a quick report.

* **Command:**

```bash
oz agent run-cloud --environment <YOUR_ENV_ID> --name "news-analyst" --prompt "Read the news. Which AWS service had the most updates today?" --open

```

---
