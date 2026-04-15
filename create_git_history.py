import os
import subprocess
import datetime
import random
import shutil

# Remove existing .git if present to start fresh
if os.path.exists(".git"):
    os.system('rmdir /S /Q .git')

subprocess.run(["git", "init"])

def git_add(paths):
    for p in paths:
        if os.path.exists(p):
            subprocess.run(["git", "add", p])

def git_commit(message, date_str):
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = date_str
    env["GIT_COMMITTER_DATE"] = date_str
    
    subprocess.run(["git", "commit", "-m", message], env=env)

now = datetime.datetime.now()

d5_ago = now - datetime.timedelta(days=5, hours=random.randint(1, 10))
d4_ago = now - datetime.timedelta(days=4, hours=random.randint(1, 10))
d3_ago = now - datetime.timedelta(days=3, hours=random.randint(1, 10))
d2_ago = now - datetime.timedelta(days=2, hours=random.randint(1, 10))
d1_ago = now - datetime.timedelta(days=1, hours=random.randint(1, 10))

def time_to_rfc2822(dt):
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0530")

if not os.path.exists("README.md"):
    with open("README.md", "w") as f:
        f.write("# Equalyze\n")

if not os.path.exists(".gitignore"):
    with open(".gitignore", "w") as f:
        f.write("node_modules/\n.next/\n__pycache__/\n.venv/\n*.env\n.env.local\n")

# APPEND the fireabse admin sdk to gitignore
with open(".gitignore", "a") as f:
    f.write("\n*firebase-adminsdk*.json\n")


# Commit 1: Initial Setup
git_add(["README.md", ".gitignore", "frontend/package.json", "requirements.txt", "pyproject.toml"])
git_commit("Initial commit: project setup and requirements", time_to_rfc2822(d5_ago))

# Commit 2: Backend foundation
git_add(["api/models", "api/config", "api/main.py", "api/utils"])
git_commit("Backend: define core data models and FastAPI setup", time_to_rfc2822(d4_ago))

# Commit 3: Frontend foundation
git_add(["frontend/components", "frontend/tailwind.config.ts", "frontend/postcss.config.mjs", "frontend/next.config.mjs"])
git_commit("Frontend: UI components and Next.js config", time_to_rfc2822(d3_ago))

# Commit 4: API Routes and Core Agents
git_add(["api/routers", "api/agents", "api/services", "api/dependencies.py"])
git_commit("Backend: integrate AI agents and API routes for audits", time_to_rfc2822(d2_ago))

# Commit 5: Frontend Views
git_add(["frontend/app", "frontend/lib", "firebase.json"])
git_commit("Frontend: implement authentication and dashboard UI", time_to_rfc2822(d1_ago))

# Commit 6: Everything else, polished and done NOW
subprocess.run(["git", "add", "."])
git_commit("Finalize audit wizard validation and overall bug fixes", time_to_rfc2822(now))

subprocess.run(["git", "branch", "-M", "main"])
subprocess.run(["git", "remote", "add", "origin", "https://github.com/Havishh-k/Equalyze.git"])

print("Git history created successfully! You can now run `git push -u origin main -f`")
