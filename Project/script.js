/*
  Vanilla JS habit tracker
  - No libraries required
  - Saves data in browser localStorage
*/

document.addEventListener('DOMContentLoaded', function () {
  const daysCount = 7; // change this to 30 for monthly grid
  const habitInput = document.getElementById('habitInput');
  const addHabitBtn = document.getElementById('addHabitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const habitList = document.getElementById('habitList');

  let habits = JSON.parse(localStorage.getItem('habits')) || [];

  function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
  }

  function calculateCurrentStreak(days) {
    let count = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i]) count++;
      else break;
    }
    return count;
  }

  function calculateBestStreak(days) {
    let best = 0, cur = 0;
    for (let i = 0; i < days.length; i++) {
      if (days[i]) { cur++; if (cur > best) best = cur; }
      else cur = 0;
    }
    return best;
  }

  function renderHabits() {
    habitList.innerHTML = '';
    if (habits.length === 0) {
      habitList.innerHTML = '<p class="small">No habits yet — add one above ✨</p>';
      return;
    }

    habits.forEach((habit, hIndex) => {
      const card = document.createElement('div');
      card.className = 'habit-card';

      const header = document.createElement('div');
      header.className = 'habit-header';

      const title = document.createElement('div');
      title.className = 'habit-title';
      title.textContent = habit.name;

      const controls = document.createElement('div');
      controls.className = 'controls';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit habit name';
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', function () {
        const newName = prompt('Rename habit:', habit.name);
        if (newName !== null) {
          habit.name = newName.trim() || habit.name;
          saveHabits();
          renderHabits();
        }
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete habit';
      delBtn.textContent = '❌';
      delBtn.addEventListener('click', function () {
        if (confirm('Delete this habit?')) {
          habits.splice(hIndex, 1);
          saveHabits();
          renderHabits();
        }
      });

      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      header.appendChild(title);
      header.appendChild(controls);

      const grid = document.createElement('div');
      grid.className = 'grid';

      habit.days = habit.days || Array(daysCount).fill(false);
      if (habit.days.length !== daysCount) {
        const newArr = Array(daysCount).fill(false);
        for (let i = 0; i < Math.min(daysCount, habit.days.length); i++) {
          newArr[i] = habit.days[i];
        }
        habit.days = newArr;
      }

      for (let i = 0; i < daysCount; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!habit.days[i];
        cb.addEventListener('change', function () {
          habit.days[i] = cb.checked;
          const best = calculateBestStreak(habit.days);
          if (!habit.bestStreak || best > habit.bestStreak) habit.bestStreak = best;
          saveHabits();
          renderHabits();
        });
        grid.appendChild(cb);
      }

      const progressWrap = document.createElement('div');
      progressWrap.className = 'progress';
      const bar = document.createElement('div');
      bar.className = 'bar';
      const done = habit.days.filter(Boolean).length;
      const percent = Math.round((done / daysCount) * 100);
      bar.style.width = percent + '%';
      bar.textContent = percent + '%';
      progressWrap.appendChild(bar);

      const streakText = document.createElement('div');
      streakText.className = 'streak';
      const current = calculateCurrentStreak(habit.days);
      const best = habit.bestStreak || calculateBestStreak(habit.days);
      streakText.textContent = '🔥 Current: ' + current + '  |  🌟 Best: ' + best;

      card.appendChild(header);
      card.appendChild(grid);
      card.appendChild(progressWrap);
      card.appendChild(streakText);

      habitList.appendChild(card);
    });
  }

  addHabitBtn.addEventListener('click', function () {
    const name = habitInput.value.trim();
    if (!name) {
      alert('Please type a habit name first.');
      return;
    }
    habits.push({ name: name, days: Array(daysCount).fill(false), bestStreak: 0 });
    habitInput.value = '';
    saveHabits();
    renderHabits();
  });

  habitInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addHabitBtn.click();
  });

  resetBtn.addEventListener('click', function () {
    if (confirm('Reset all saved habits? This will clear everything.')) {
      habits = [];
      saveHabits();
      renderHabits();
    }
  });

  renderHabits();
});
