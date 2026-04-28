import urllib.request
from apscheduler.schedulers.background import BackgroundScheduler
import threading

def trigger_cloud_scheduler_mock():
    """
    Mocks Google Cloud Scheduler triggering the webhook.
    """
    import os
    port = os.getenv("PORT", "8000")
    try:
        req = urllib.request.Request(
            f"http://127.0.0.1:{port}/api/v1/monitoring/run-scheduled-audit",
            method="POST",
            headers={"Content-Length": "0"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            pass # Fired successfully
    except Exception as e:
        print(f"[Scheduler] Failed to trigger: {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    # Trigger every 1 hour in prod, but for demo let's trigger every 60 seconds
    # so the judges can see the chart updating live during the pitch!
    scheduler.add_job(trigger_cloud_scheduler_mock, 'interval', seconds=60)
    scheduler.start()
    return scheduler

# We'll call this in main.py startup events
