const calendar = document.getElementById("calendar");
const updated = document.getElementById("calendar-updated");
const format = options => new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", ...options });
const dayLabel = format({ month: "long", day: "numeric", weekday: "short" });
const clock = format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const tokyoDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });
const amount = new Intl.NumberFormat("ja-JP");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function metric(label, value) {
  const node = element("span", "event-metric");
  node.append(element("small", "", label), element("span", "", value));
  return node;
}

function eventRow(event, now, isToday) {
  const start = new Date(event.start);
  const cutoff = event.cutoff ? new Date(event.cutoff) : null;
  const row = element("a", "event-row");
  row.href = "https://pokerfans.jp/events/" + event.id + "?_lang=ja";
  const when = element("time", "event-time");
  when.dateTime = event.start;
  if (!isToday || tokyoDay.format(start) !== tokyoDay.format(now)) {
    when.append(element("small", "", dayLabel.format(start)));
  }
  when.append(clock.format(start));
  const title = element("strong", "event-title", event.name);
  let deadline = "公式案内へ";
  if (cutoff) {
    const nextDay = tokyoDay.format(cutoff) !== tokyoDay.format(start);
    deadline = (nextDay ? "翌" : "") + clock.format(cutoff);
    if (cutoff <= now) deadline += "（終了）";
  }
  row.append(when, title, metric("通常参加費", Number.isFinite(event.fee) ? amount.format(event.fee) + "円" : "公式案内へ"),
    metric("初回受付締切", deadline), element("span", "event-detail", "詳細 ↗"));
  return row;
}

function group(title, events, now, isToday) {
  const block = element("div", "event-group");
  block.append(element("h3", "group-title", title));
  for (const event of events) block.append(eventRow(event, now, isToday));
  if (!events.length) {
    block.append(element("p", "empty", "現在、掲載を確認できた大会はありません。追加開催は店舗カレンダーをご覧ください。"));
  }
  return block;
}

let displayedPeriod;

function render(data) {
  const now = new Date();
  const today = tokyoDay.format(now);
  // Keep focused links in the DOM until the local date or an entry deadline changes.
  const period = [today, ...data.events.map(event => event.cutoff && new Date(event.cutoff) <= now)].join("|");
  if (period === displayedPeriod) return;
  displayedPeriod = period;
  const current = data.events.filter(event => {
    const date = event.start.slice(0, 10);
    return date === today || (date < today && event.cutoff && new Date(event.cutoff) > now);
  });
  const upcoming = data.events.filter(event => event.start.slice(0, 10) > today);
  calendar.replaceChildren(group("本日 ｜ " + dayLabel.format(now), current, now, true),
    group("近日の大会", upcoming, now, false));
  const checked = new Date(data.checkedAt);
  updated.textContent = "店舗カレンダー確認　" + dayLabel.format(checked) + " " + clock.format(checked)
    + " ｜ 時刻は日本時間。追加・変更・割引は各大会の詳細をご確認ください。";
}

async function loadSchedule() {
  try {
    const response = await fetch("schedule.json", { cache: "no-cache" });
    if (!response.ok) return;
    const data = await response.json();
    render(data);
    // Re-evaluate overnight entries and deadlines when a visitor returns to this tab.
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) render(data);
    });
    window.setInterval(() => { if (!document.hidden) render(data); }, 60000);
  } catch {
    // The calendar link in the HTML stays usable offline or if the data is unavailable.
  }
}
loadSchedule();
