const API_URL = '/api/tasks';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const addButton = form.querySelector('button[type="submit"]');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const errorMessage = document.getElementById('error-message');
const refreshButton = document.getElementById('refresh-button');

// Small helper for all API calls.
// It throws an Error with the server's message when the request fails.
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // The response had no JSON body; keep the generic message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  errorMessage.hidden = true;
  errorMessage.textContent = '';
}

function updateSummary(tasks) {
  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent =
    tasks.length === 0
      ? '0 tasks'
      : `${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${remaining} left`;
  emptyState.hidden = tasks.length !== 0;
}

function renderTasks(tasks) {
  list.replaceChildren();

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = 'task' + (task.completed ? ' task--completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task__checkbox';
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute(
      'aria-label',
      task.completed ? `Mark "${task.title}" as not completed` : `Mark "${task.title}" as completed`
    );

    const title = document.createElement('span');
    title.className = 'task__title';
    title.textContent = task.title;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'task__delete';
    deleteButton.textContent = 'Delete';

    checkbox.addEventListener('change', async () => {
      checkbox.disabled = true;
      hideError();
      try {
        await request(`${API_URL}/${task.id}`, {
          method: 'PUT',
          body: JSON.stringify({ completed: checkbox.checked }),
        });
        await loadTasks();
      } catch (error) {
        checkbox.checked = !checkbox.checked; // Put the checkbox back.
        showError(error.message);
        checkbox.disabled = false;
      }
    });

    deleteButton.addEventListener('click', async () => {
      if (!window.confirm(`Delete "${task.title}"?`)) return;

      deleteButton.disabled = true;
      hideError();
      try {
        await request(`${API_URL}/${task.id}`, { method: 'DELETE' });
        await loadTasks();
      } catch (error) {
        showError(error.message);
        deleteButton.disabled = false;
      }
    });

    item.append(checkbox, title, deleteButton);
    list.appendChild(item);
  }

  updateSummary(tasks);
}

async function loadTasks() {
  hideError();
  try {
    const tasks = await request(API_URL);
    renderTasks(tasks);
  } catch (error) {
    showError(`Could not load tasks. ${error.message}`);
    list.replaceChildren();
    updateSummary([]);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  addButton.disabled = true;
  input.disabled = true;
  hideError();

  try {
    await request(API_URL, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    input.value = '';
    await loadTasks();
  } catch (error) {
    showError(error.message);
  } finally {
    addButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
});

refreshButton.addEventListener('click', loadTasks);

loadTasks();
