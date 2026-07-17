const STORAGE_KEY = "todo-app-items";

let todos = [];
let currentFilter = "all";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    todos = data ? JSON.parse(data) : [];
  } catch {
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

function updateCount() {
  const activeCount = todos.filter((t) => !t.completed).length;
  todoCount.textContent = `${activeCount} 项待办`;

  const hasCompleted = todos.some((t) => t.completed);
  clearCompletedBtn.hidden = !hasCompleted;
}

function render() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = "";

  const showEmpty = filtered.length === 0;
  emptyState.classList.toggle("hidden", !showEmpty);

  if (showEmpty) {
    const messages = {
      all: "还没有任务，添加一个开始吧",
      active: "没有进行中的任务",
      completed: "还没有已完成的任务",
    };
    emptyState.querySelector("p").textContent = messages[currentFilter];
  }

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" aria-label="删除任务">×</button>
    `;

    const checkbox = li.querySelector(".checkbox");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.addEventListener("click", () => toggleTodo(todo.id));
    checkbox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTodo(todo.id);
      }
    });

    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    todoList.appendChild(li);
  });

  updateCount();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  render();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener("click", clearCompleted);

loadTodos();
render();
