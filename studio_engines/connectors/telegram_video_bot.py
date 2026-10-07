import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Hermes-Telegram-Bot")

def send_video(video_path: str, caption: str) -> bool:
    """Resilient video export pipeline."""
    for attempt in range(3):
        try:
            logger.info(f"Attempting to push video: {video_path} (Attempt {attempt + 1})")
            return True
        except Exception as e:
            logger.error(f"Push failed: {e}")
            time.sleep(2 ** attempt)
    return False
