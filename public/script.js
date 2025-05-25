// Add a new task
function addTask() {
  const title = document.getElementById('taskadd').value.trim();
  const dueDate = document.getElementById('duedate').value;

  if (!title) return;

  fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, dueDate })  // Include dueDate
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to add task');
    return response.json();
  })
  .then(() => {
    document.getElementById('taskadd').value = '';
    document.getElementById('duedate').value = '';
    loadTasks();
  })
  .catch(error => {
    console.error('Error adding task:', error);
    alert('Failed to add task. Please try again.');
  });
}


// Delete a task
function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  fetch(`/tasks/${id}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to delete task');
    loadTasks(); // Refresh list after deletion
  })
  .catch(error => {
    console.error('Error deleting task:', error);
    alert(error.message || 'Failed to delete task.');
  });
}

// Load all tasks
function loadTasks() {
  fetch('/tasks')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    })
    .then(tasks => {
      const list = document.getElementById('tasklist');
      list.innerHTML = ''; // Clear current list

      tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
const taskText = document.createElement('span');
taskText.className = 'task-text';

const titleSpan = document.createElement('span');
titleSpan.className = 'task-title';
titleSpan.innerText = task.title;

taskText.appendChild(titleSpan);

// Add due date if it exists
if (task.dueDate) {
  const dueDateSpan = document.createElement('span');
  dueDateSpan.className = 'due-date';
  const formatted = new Date(task.dueDate).toLocaleDateString();
  dueDateSpan.innerText = ` (Due: ${formatted})`;
  taskText.appendChild(dueDateSpan);
}

        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '&times;';
        deleteButton.onclick = () => deleteTask(task._id);

        li.appendChild(taskText);
        li.appendChild(deleteButton);
        list.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error loading tasks:', error);
      alert('Failed to load tasks. Please refresh.');
    });
}

// Initial load when the page is ready
document.addEventListener('DOMContentLoaded', loadTasks);
