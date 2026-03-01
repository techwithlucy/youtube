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

~~~bash
AWS Cloud News Dashboard

Build a minimal static site for GitHub Pages that aggregates 
AWS cloud news from official RSS feeds.

The tech stack is simple (HTML + CSS + vanilla JS), but the UI 
should look professional, modern, and impressive.

### Tech Stack
- Frontend: Plain HTML + CSS + vanilla JavaScript (no frameworks)
- Data: Static news.json file
- Fetching: Node.js script

### RSS Feeds
1. AWS What's New: https://aws.amazon.com/about-aws/whats-new/recent/feed/
2. AWS News Blog: https://aws.amazon.com/blogs/aws/feed/
3. AWS Architecture Blog: https://aws.amazon.com/blogs/architecture/feed/
4. AWS Security Blog: https://aws.amazon.com/blogs/security/feed/

### Design Requirements (IMPORTANT: Must look professional and modern)

**Theme**: Dark mode with premium feel
- Background: Deep dark blue/charcoal (#0f1419)
- Cards: Slightly lighter dark (#1a1f2e)
- Accents: AWS orange (#ff9900) + electric blue (#147EFB)

**Header**: 
- Clean, minimal, professional
- AWS logo/icon + "AWS Cloud News" title
- Subtitle: "Real-time Updates from Official Sources"
- Subtle gradient or glow effect

**Filter Tabs**:
- Horizontal scrollable
- Smooth transitions when active
- Active tab: highlighted with underline or background color
- Counts next to each tab (e.g., "What's New (12)")
- Hover effects that feel smooth and responsive

**News Cards**:
- Clean, modern design with subtle shadows
- Source badge (color-coded: orange for What's New, blue for News Blog, etc.)
- Large, readable headline
- 2-3 line summary/snippet
- Publication date (relative: "2h ago", "3d ago")
- External link icon on hover
- Hover effect: slight lift, shadow enhancement, color change
- Click anywhere on card to open article in new tab

**Typography**:
- Headlines: Large, bold, readable
- Body text: Comfortable line-height and font size
- Dates: Smaller, muted color

**Overall Feel**:
- Modern SaaS dashboard vibe
- Professional but not corporate
- Smooth animations and transitions
- Responsive design (looks great on mobile, tablet, desktop)
- Loading state: skeleton screens or smooth fade-in
- Smooth scrolling
- Custom scrollbar (dark themed)

### Files to Create

**index.html**
- Load news.json from repo root (fetch './news.json')
- Render header, filter tabs, and news cards
- Implement filter functionality (show/hide based on selected source)
- Display "Last updated: [timestamp]" at bottom
- Include smooth animations and transitions
- Responsive meta tags for mobile

**style.css**
- Professional dark theme with AWS branding colors
- Modern card-based layout
- Smooth hover effects and transitions
- Responsive grid (adjusts for mobile, tablet, desktop)
- Custom CSS animations (fade-in, slide, hover effects)
- Beautiful typography with good line-height and spacing
- Subtle shadows and depth
- Custom scrollbar styling
- Media queries for responsive design

**scripts/fetch-news.js**
- Fetch all 4 RSS feeds in parallel
- Parse XML, extract: title, link, pubDate, source
- Deduplicate by URL
- Sort by date (newest first)
- Keep top 30 items
- Write to news.json at repo root with structure:
  { 
    lastUpdated: "ISO timestamp", 
    items: [{ 
      title, 
      link, 
      source (e.g., "AWS What's New"), 
      pubDate 
    }] 
  }

**package.json**
- Script: "update-news": "node scripts/fetch-news.js"
- Dependencies: rss-parser (or similar for RSS parsing)

**.github/workflows/deploy.yml**
- Deploy to GitHub Pages on push to main
- Trigger: every push to main branch
- Simple deployment (no build step needed)

### After Building
1. Run npm install
2. Run npm run update-news (generate initial news.json)
3. Verify news.json has 30 items with correct structure
4. Verify index.html renders the news and looks professional
5. Test filter tabs work smoothly
6. Test hover effects on cards
7. Test responsive design on mobile (use browser dev tools)
8. Verify "Last updated" timestamp displays correctly
~~~

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
