const calendar = document.getElementById("calendar");
const updated = document.getElementById("calendar-updated");
const calendarStatus = document.getElementById("calendar-status");
const previousEvent = document.getElementById("events-prev");
const nextEvent = document.getElementById("events-next");
const controls = previousEvent.parentElement;
const format = options => new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", ...options });
const dayLabel = format({ month: "long", day: "numeric", weekday: "short" });
const archiveDayLabel = format({ year: "numeric", month: "long", day: "numeric", weekday: "short" });
const clock = format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const tokyoDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });
const amount = new Intl.NumberFormat("ja-JP");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function eventCover(event) {
  const cover = element("div", "event-cover");
  cover.setAttribute("aria-hidden", "true");
  const mark = element("img", "cover-mark");
  mark.src = "assets/fish-print.png";
  mark.alt = "";
  cover.append(mark, element("span", "cover-name", event.name));
  if (event.poster) {
    const image = element("img", "event-poster");
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    image.src = event.poster;
    cover.append(image);
  }
  return cover;
}

function metric(label, value) {
  const node = element("span");
  node.append(element("span", "metric-label", label), element("strong", "", value));
  return node;
}

function eventCard(event, now, period) {
  const start = new Date(event.start);
  const cutoff = event.cutoff ? new Date(event.cutoff) : null;
  const card = element("a", "event-card");
  card.href = "https://pokerfans.jp/events/" + event.id + "?_lang=ja";
  const date = element("p", "calendar-date");
  const isArchive = period === "過去の開催例";
  const label = isArchive ? archiveDayLabel : dayLabel;
  const when = element("time", "", label.format(start) + " " + clock.format(start) + " 開始");
  when.dateTime = event.start;
  const badge = element("strong", "event-period", period);
  if (isArchive) badge.classList.add("is-archive");
  date.append(badge, when);
  let deadline = "公式案内へ";
  if (cutoff) {
    const nextDay = tokyoDay.format(cutoff) !== tokyoDay.format(start);
    deadline = (nextDay ? "翌" : "") + clock.format(cutoff);
    if (!isArchive && cutoff <= now) deadline += "（終了）";
  }
  const metrics = element("p", "event-metrics");
  metrics.append(metric("通常参加費", Number.isFinite(event.fee) ? amount.format(event.fee) + "円" : "公式案内へ"),
    metric("初回受付締切", deadline));
  card.append(eventCover(event), date, element("h3", "calendar-event-name", event.name), metrics);
  return card;
}

function updateControls() {
  const maximum = calendar.scrollWidth - calendar.clientWidth;
  controls.hidden = calendar.childElementCount < 2 || maximum <= parseFloat(getComputedStyle(calendar).paddingRight);
  previousEvent.disabled = calendar.scrollLeft <= 2;
  nextEvent.disabled = calendar.scrollLeft >= maximum - 2;
}

function moveCard(direction) {
  const first = calendar.firstElementChild;
  if (!first) return;
  const positions = Array.from(calendar.children, card => card.offsetLeft - first.offsetLeft);
  const target = direction > 0
    ? positions.find(position => position > calendar.scrollLeft + 2)
    : positions.reverse().find(position => position < calendar.scrollLeft - 2);
  calendar.scrollTo({
    left: target ?? (direction > 0 ? calendar.scrollWidth : 0),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

let displayedPeriod;

function archiveCards(data, scheduled, today, now) {
  const slots = Math.max(0, 4 - scheduled.length);
  const displayedNames = new Set(scheduled.map(event => event.name.toLowerCase()));
  const past = [...data.events, ...(data.referenceEvents ?? [])]
    .filter(event => tokyoDay.format(new Date(event.start)) < today)
    .sort((a, b) => new Date(b.start) - new Date(a.start));
  const examples = [];
  for (const event of past) {
    if (examples.length === slots) break;
    const name = event.name.toLowerCase();
    if (displayedNames.has(name)) continue;
    displayedNames.add(name);
    examples.push(eventCard(event, now, "過去の開催例"));
  }
  return examples;
}

function render(data) {
  const now = new Date();
  const today = tokyoDay.format(now);
  const period = [today, ...data.events.map(event => event.cutoff && new Date(event.cutoff) <= now)].join("|");
  if (period === displayedPeriod) return;
  displayedPeriod = period;
  const current = data.events.filter(event => {
    const date = event.start.slice(0, 10);
    return date === today || (date < today && event.cutoff && new Date(event.cutoff) > now);
  });
  const upcoming = data.events.filter(event => event.start.slice(0, 10) > today);
  const focused = calendar.contains(document.activeElement) ? document.activeElement.href : null;
  const examples = archiveCards(data, [...current, ...upcoming], today, now);
  calendar.replaceChildren(
    ...current.map(event => eventCard(event, now, event.start.slice(0, 10) === today ? "本日" : "前日から開催")),
    ...upcoming.map(event => eventCard(event, now, "近日")),
    ...examples,
  );
  calendar.hidden = !calendar.childElementCount;
  if (focused) Array.from(calendar.children).find(card => card.href === focused)?.focus({ preventScroll: true });
  calendarStatus.textContent = examples.length ? "「過去の開催例」は参考情報です。最新の開催予定は店舗カレンダーをご確認ください。"
    : !current.length && !upcoming.length ? "掲載を確認できた大会はまだありません。追加開催は店舗カレンダーをご確認ください。"
    : !current.length ? "本日の掲載はありません。近日の開催予定をご案内します。" : "";
  const checked = new Date(data.checkedAt);
  updated.textContent = "店舗カレンダー確認　" + dayLabel.format(checked) + " " + clock.format(checked)
    + " ｜ 時刻は日本時間。追加・変更・割引は各大会の詳細をご確認ください。";
  updateControls();
}

async function loadSchedule() {
  try {
    const response = await fetch("schedule.json", { cache: "no-cache" });
    if (!response.ok) return;
    const data = await response.json();
    render(data);
    calendar.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    previousEvent.addEventListener("click", () => moveCard(-1));
    nextEvent.addEventListener("click", () => moveCard(1));
    calendar.addEventListener("keydown", event => {
      if (event.target === calendar && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        moveCard(event.key === "ArrowRight" ? 1 : -1);
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) render(data);
    });
    window.setInterval(() => { if (!document.hidden) render(data); }, 60000);
  } catch {
    // The HTML link to the shop's calendar remains available when data cannot load.
  }
}
loadSchedule();
