// timebrush.js — Full source version

window.TimeBrush = (function () {
    function TimeBrush(config) {
      this.container = document.querySelector(config.selector);
      if (!this.container) return;
  
      this.fetchUrl = config.fetchUrl;
      this.saveUrl = config.saveUrl;
      this.days = config.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      this.timeStep = config.timeStep || 10;
      this.locale = config.locale || 'en-US';
      this.timeFormat = config.timeFormat || 'HH:mm';
      this.labels = config.labels || {
        draw: "✍️ Draw",
        erase: "❌ Erase",
        save: "💾 Save"
      };
  
      this.mode = 'draw';
      this.selectedCells = new Set();
      this.gridElement = null;
  
      this.init();
    }
  
    TimeBrush.prototype.init = function () {
      this.createToolbar();
      this.buildGrid();
      this.load();
    };
  
    TimeBrush.prototype.createToolbar = function () {
      const toolbar = document.createElement('div');
      const uid = this._uid();
      toolbar.innerHTML = `
        <label><input type="radio" name="mode-${uid}" value="draw" checked> ${this.labels.draw}</label>
        <label style="margin-left: 15px;"><input type="radio" name="mode-${uid}" value="erase"> ${this.labels.erase}</label>
        <button style="margin-left: 15px;" onclick="window['${uid}'].save()">${this.labels.save}</button>
      `;
      this.container.appendChild(toolbar);
  
      toolbar.addEventListener('change', (e) => {
        if (e.target.name.startsWith('mode-')) {
          this.setMode(e.target.value);
        }
      });
    };
  
    TimeBrush.prototype._uid = function () {
      if (!this.uid) {
        this.uid = this.container.id || ('timebrush_' + Math.random().toString(36).substr(2, 9));
      }
      return this.uid;
    };
  
    TimeBrush.prototype.setMode = function (mode) {
      this.mode = mode;
    };
  
    TimeBrush.prototype.buildGrid = function () {
      const grid = document.createElement('div');
      grid.className = 'timebrush';
      this.container.appendChild(grid);
      this.gridElement = grid;
  
      grid.appendChild(this._cell('', 'header time-col'));
      this.days.forEach(day => grid.appendChild(this._cell(day, 'header cell')));
  
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += this.timeStep) {
          const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          const label = this._rangeLabel(time);
          grid.appendChild(this._cell(label, 'time-col'));
  
          this.days.forEach(day => {
            const cell = this._cell('', 'cell');
            cell.dataset.day = day;
            cell.dataset.time = time;
            this._attachListeners(cell);
            grid.appendChild(cell);
          });
        }
      }
    };
  
    TimeBrush.prototype._formatTime = function (h, m) {
      const date = new Date();
      date.setHours(h);
      date.setMinutes(m);
      return date.toLocaleTimeString(this.locale, { hour: '2-digit', minute: '2-digit', hour12: this.timeFormat.includes('a') });
    };
  
    TimeBrush.prototype._rangeLabel = function (start) {
      const [h, m] = start.split(':').map(Number);
      let endMin = m + this.timeStep - 1;
      let endHour = h;
      if (endMin >= 60) {
        endHour += Math.floor(endMin / 60);
        endMin %= 60;
      }
      return `${this._formatTime(h, m)}–${this._formatTime(endHour, endMin)}`;
    };
  
    TimeBrush.prototype._cell = function (text, className) {
      const div = document.createElement('div');
      div.className = className;
      div.textContent = text;
      return div;
    };
  
    TimeBrush.prototype._attachListeners = function (cell) {
      cell.addEventListener('mousedown', (e) => {
        this.isMouseDown = true;
        this.selectionStart = { day: cell.dataset.day, time: cell.dataset.time };
        this._clearTemp();
        e.preventDefault();
      });
      cell.addEventListener('mouseover', () => {
        if (this.isMouseDown && this.selectionStart) {
          this._clearTemp();
          this._markRange(this.selectionStart, { day: cell.dataset.day, time: cell.dataset.time }, true);
        }
      });
      cell.addEventListener('mouseup', () => {
        if (this.selectionStart) {
          this._markRange(this.selectionStart, { day: cell.dataset.day, time: cell.dataset.time }, false);
          this.selectionStart = null;
        }
        this.isMouseDown = false;
      });
      document.body.addEventListener('mouseup', () => {
        this.isMouseDown = false;
        this.selectionStart = null;
        this._clearTemp();
      });
    };
  
    TimeBrush.prototype._markRange = function (start, end, temporary = false) {
      const sd = this.days.indexOf(start.day);
      const ed = this.days.indexOf(end.day);
      const st = this._toMinutes(start.time);
      const et = this._toMinutes(end.time);
  
      const [minDay, maxDay] = [Math.min(sd, ed), Math.max(sd, ed)];
      const [minTime, maxTime] = [Math.min(st, et), Math.max(st, et)];
  
      for (let d = minDay; d <= maxDay; d++) {
        for (let t = minTime; t <= maxTime; t += this.timeStep) {
          const timeStr = this._toTime(t);
          const dayName = this.days[d];
          const key = `${dayName}_${timeStr}`;
          const cell = this.gridElement.querySelector(`.cell[data-day="${dayName}"][data-time="${timeStr}"]`);
          if (!cell) continue;
          if (temporary) {
            cell.classList.add('temp-selected');
          } else {
            if (this.mode === 'draw') {
              this.selectedCells.add(key);
              cell.classList.add('selected');
            } else {
              this.selectedCells.delete(key);
              cell.classList.remove('selected');
            }
          }
        }
      }
    };
  
    TimeBrush.prototype._clearTemp = function () {
      this.gridElement.querySelectorAll('.temp-selected').forEach(cell => cell.classList.remove('temp-selected'));
    };
  
    TimeBrush.prototype._toMinutes = function (t) {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
  
    TimeBrush.prototype._toTime = function (min) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
  
    TimeBrush.prototype.save = function () {
      const grouped = {};
      this.selectedCells.forEach(key => {
        const [day, time] = key.split('_');
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(time);
      });
  
      const payload = {};
      Object.keys(grouped).forEach(day => {
        const times = grouped[day].sort();
        const ranges = [];
        let start = null;
  
        for (let i = 0; i < times.length; i++) {
          const curr = times[i];
          const next = times[i + 1];
          if (!start) start = curr;
  
          const [ch, cm] = curr.split(':').map(Number);
          const [nh, nm] = next ? next.split(':').map(Number) : [null, null];
          const diff = next ? (nh - ch) * 60 + (nm - cm) : null;
  
          if (diff !== this.timeStep) {
            const [eh, em] = curr.split(':').map(Number);
            let endMin = em + this.timeStep - 1;
            let endHour = eh;
            if (endMin >= 60) {
              endHour += Math.floor(endMin / 60);
              endMin = endMin % 60;
            }
  
            const startTime = `${start}:00`;
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:59`;
            ranges.push([startTime, endTime]);
            start = null;
          }
        }
  
        const dayIndex = this.days.indexOf(day);
        payload[dayIndex] = ranges;
      });
  
      fetch(this.saveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        if (res.ok) alert('Saved!');
        else alert('Failed to save.');
      });
    };
  
    TimeBrush.prototype.load = function () {
      fetch(this.fetchUrl)
        .then(res => res.json())
        .then(data => {
          Object.entries(data).forEach(([dayIndex, ranges]) => {
            const dayName = this.days[+dayIndex];
            ranges.forEach(([start, end]) => {
              const startMin = this._toMinutes(start);
              const endMin = this._toMinutes(end);
              for (let t = startMin; t <= endMin; t += this.timeStep) {
                const time = this._toTime(t);
                const key = `${dayName}_${time}`;
                this.selectedCells.add(key);
                const cell = this.gridElement.querySelector(`.cell[data-day="${dayName}"][data-time="${time}"]`);
                if (cell) cell.classList.add('selected');
              }
            });
          });
        });
    };
  
    return {
      init: function (config) {
        const instance = new TimeBrush(config);
        window[instance._uid()] = instance;
        return instance;
      }
    };
  })();