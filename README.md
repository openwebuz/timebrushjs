# 🖌️ TimeBrush

**TimeBrush** is a flexible, Excel-style timetable component for the browser.  
It lets users draw or erase time slots on a grid-based week view.

---

## 🌟 Features

- ✍️ Draw & ❌ Erase time blocks (Excel-style)
- 📅 Weekly layout (Mon–Sun)
- ⏱ 10-minute slot precision
- 🌐 Locale/time format support
- ♻️ Load/save from API
- 🧩 Plug-and-play with plain JavaScript
- 🔀 Multiple timetables on one page

---

## 🚀 Getting Started

### 1. Install / Include

```html
<link rel="stylesheet" href="dist/timetable.css">
<script src="dist/timetable.min.js"></script>
```

### 2. Add container

```html
<div id="my-timetable"></div>
```

### 3. Initialize TimeBrush

```js
Timetable.init({
  selector: "#my-timetable",
  fetchUrl: "/api/get-timetable",
  saveUrl: "/api/save-timetable",
  locale: "en-US",
  timeFormat: "HH:mm",
  labels: {
    draw: "Draw",
    erase: "Erase",
    save: "Save"
  }
});
```

---

## ⚙️ Config Options

| Option       | Description                           |
|--------------|---------------------------------------|
| `selector`   | Target container element              |
| `fetchUrl`   | GET URL to load time slots            |
| `saveUrl`    | POST URL to save time slots           |
| `days`       | Optional: custom day labels           |
| `timeStep`   | Minutes per block (default `10`)      |
| `locale`     | Format locale (e.g. `'en-US'`)        |
| `timeFormat` | `'HH:mm'` or `'hh:mm a'`              |
| `labels`     | `{ draw, erase, save }`               |
| `firstDay`   | Optional. Start week on a specific day (e.g., `"Monday"`) |


---

## 📤 Save Format

```json
{
  "1": [["08:00:00", "10:29:59"]],
  "3": [["14:00:00", "15:59:59"]]
}
```

---

## 📥 Load Format

Same as above — map of day indexes to time blocks.

---

## 🧪 Demo

Clone this repo and open `demo/index.html` in your browser.

Or deploy to GitHub Pages!

---

## 📄 License

MIT © 2025
