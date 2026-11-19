"""Build a small schedule from the calendar published by the shop on PokerFans."""
import json
import re
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

JST = ZoneInfo("Asia/Tokyo")
OUTPUT = Path(__file__).resolve().parents[1] / "schedule.json"


def tournament(item):
    title = item["title"].strip()
    body = item.get("description") or ""
    if re.search(r"RING\s*GAME|リングゲーム|中止|非開催", title, re.I):
        return None
    if not re.search(r"トーナメント|TOURNAMENT|サテライト|トナメ", title + "\n" + body, re.I):
        return None
    start = datetime.strptime(item["start"], "%Y-%m-%d %H:%M").replace(tzinfo=JST)
    late = re.search(r"レイト\s*[〈《≪【（(]?\s*エントリー\s*[〉》≫】）)]?\s*[:：]\s*(\d{1,2})[:：](\d{2})", body)
    cutoff = None
    if late:
        hour, minute = map(int, late.groups())
        if hour < 48 and minute < 60:
            cutoff = start.replace(hour=hour % 24, minute=minute)
            if hour >= 24 or cutoff < start:
                cutoff += timedelta(days=1)
    # The shop encloses its short event name between fish marks.
    name = re.match(r"^🐟\s*(.+?)\s*🐟", title)
    return {
        "id": int(item["id"]), "name": name[1] if name else title,
        "start": start.isoformat(timespec="minutes"),
        "fee": item.get("memberFee"),
        "cutoff": cutoff.isoformat(timespec="minutes") if cutoff else None,
    }


def main():
    now = datetime.now(JST)
    query = urlencode({
        "clubId": 6134, "start": (now - timedelta(days=1)).strftime("%Y/%m/%d"),
        "end": (now + timedelta(days=30)).strftime("%Y/%m/%d"),
    })
    response = subprocess.check_output([
        "curl", "-fsSL", "--retry", "2", "--max-time", "30",
        "https://pokerfans.jp/events?" + query,
    ])
    items = json.loads(response)
    if not isinstance(items, list):
        raise ValueError("Unexpected PokerFans response")
    events = [event for item in items if (event := tournament(item))]
    data = {"checkedAt": now.isoformat(timespec="minutes"),
            "events": sorted(events, key=lambda event: event["start"])}
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
