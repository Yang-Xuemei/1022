import "./index.css";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos.v1";
const FILTER_KEY = "todos.filter.v1";

const state = {
  todos: [] as Todo[],
  filter: "all" as Filter,
};

// ---------- DOM refs ----------
const form = requireElement<HTMLFormElement>("#todo-form");
const input = requireElement<HTMLInputElement>("#todo-input");
const list = requireElement<HTMLUListElement>("#todo-list");
const emptyState = requireElement<HTMLDivElement>("#empty-state");
const footer = requireElement<HTMLElement>("#todo-footer");
const counters = requireElement<HTMLDivElement>("#todo-counters");
const filterBar = requireElement<HTMLDivElement>("#todo-filters");

// ---------- Storage ----------
function load(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        state.todos = parsed.filter(isValidTodo).map((t) => ({ ...t }));
      }
    }
  } catch (error) {
    console.warn("读取本地存储失败，将从空列表开始", error);
    state.todos = [];
  }

  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter === "all" || savedFilter === "active" || savedFilter === "completed") {
    state.filter = savedFilter;
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
    localStorage.setItem(FILTER_KEY, state.filter);
  } catch (error) {
    console.warn("写入本地存储失败", error);
  }
}

function isValidTodo(value: unknown): value is Todo {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Todo).id === "string" &&
    typeof (value as Todo).text === "string" &&
    typeof (value as Todo).completed === "boolean"
  );
}

// ---------- Actions ----------
function addTodo(text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  state.todos.unshift({
    id: makeId(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  });
  save();
  render();
}

function removeTodo(id: string): void {
  const index = state.todos.findIndex((t) => t.id === id);
  if (index === -1) return;
  state.todos.splice(index, 1);
  save();
  render();
}

function toggleTodo(id: string): void {
  const todo = state.todos.find((t) => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  save();
  render();
}

function setFilter(filter: Filter): void {
  if (state.filter === filter) return;
  state.filter = filter;
  save();
  render();
}

// ---------- Rendering ----------
function render(): void {
  renderList();
  renderCounters();
  renderFilters();
  renderFooterVisibility();
}

function renderList(): void {
  const visible = filterTodos();

  list.innerHTML = "";

  if (visible.length === 0) {
    emptyState.hidden = false;
    if (state.todos.length === 0) {
      const title = emptyState.querySelector(".empty-title");
      const sub = emptyState.querySelector(".empty-sub");
      if (title) title.textContent = "卷 中 無 事";
      if (sub) sub.textContent = "— 提 筆 添 一 條 罷 —";
    } else if (state.filter === "active") {
      const title = emptyState.querySelector(".empty-title");
      const sub = emptyState.querySelector(".empty-sub");
      if (title) title.textContent = "無 進 行 中 事";
      if (sub) sub.textContent = "— 諸 務 皆 已 落 筆 成 墨 —";
    } else if (state.filter === "completed") {
      const title = emptyState.querySelector(".empty-title");
      const sub = emptyState.querySelector(".empty-sub");
      if (title) title.textContent = "無 已 成 之 事";
      if (sub) sub.textContent = "— 尚 待 落 筆 成 卷 —";
    }
    return;
  }

  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();
  for (const todo of visible) {
    fragment.appendChild(buildTodoItem(todo));
  }
  list.appendChild(fragment);
}

function buildTodoItem(todo: Todo): HTMLLIElement {
  const li = document.createElement("li");
  li.className =
    "group flex items-center gap-4 px-5 py-4 transition hover:bg-surface-alt";
  li.dataset.id = todo.id;

  // 墨色复选框
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.className = "todo-checkbox flex-none";
  checkbox.setAttribute("aria-label", todo.completed ? "标记为未完成" : "标记为已完成");
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  // 文字
  const textSpan = document.createElement("span");
  textSpan.className =
    "flex-1 break-words text-sm tracking-[0.04em] transition " +
    (todo.completed
      ? "text-muted line-through decoration-primary/50 decoration-1"
      : "text-ink");
  textSpan.textContent = todo.text;

  // 删除按钮
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className =
    "icon-btn flex-none opacity-0 transition group-hover:opacity-100 focus:opacity-100";
  deleteBtn.setAttribute("aria-label", `删除任务：${todo.text}`);
  deleteBtn.title = "刪";
  deleteBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M5 6l1 14h12l1-14"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>';
  deleteBtn.addEventListener("click", () => removeTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(deleteBtn);
  return li;
}

function renderCounters(): void {
  const total = state.todos.length;
  const completed = state.todos.filter((t) => t.completed).length;
  const active = total - completed;

  const items: Array<{ label: string; count: number; key: Filter | "total" }> = [
    { label: "全 部", count: total, key: "total" },
    { label: "進 行 中", count: active, key: "active" },
    { label: "已 完 成", count: completed, key: "completed" },
  ];

  counters.innerHTML = "";
  for (const item of items) {
    const span = document.createElement("span");
    const isActiveFilter = item.key === state.filter;
    span.className = "inline-flex items-center gap-1.5";

    const countEl = document.createElement("span");
    countEl.className = "counter-pill";
    countEl.dataset.active = isActiveFilter ? "true" : "false";
    countEl.textContent = String(item.count);

    const labelEl = document.createElement("span");
    labelEl.className =
      "text-[0.7rem] tracking-[0.15em] " +
      (isActiveFilter ? "text-ink" : "text-muted");
    labelEl.textContent = item.label;

    span.appendChild(countEl);
    span.appendChild(labelEl);
    counters.appendChild(span);
  }
}

function renderFilters(): void {
  const buttons = filterBar.querySelectorAll<HTMLButtonElement>(".filter-chip");
  buttons.forEach((btn) => {
    const filter = btn.dataset.filter as Filter | undefined;
    if (!filter) return;
    const isActive = filter === state.filter;
    btn.dataset.active = isActive ? "true" : "false";
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function renderFooterVisibility(): void {
  footer.hidden = state.todos.length === 0;
}

function filterTodos(): Todo[] {
  switch (state.filter) {
    case "active":
      return state.todos.filter((t) => !t.completed);
    case "completed":
      return state.todos.filter((t) => t.completed);
    default:
      return state.todos;
  }
}

// ---------- Helpers ----------
function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`页面缺少必要元素：${selector}`);
  }
  return element;
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- Events ----------
form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

filterBar.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const btn = target.closest<HTMLButtonElement>("button[data-filter]");
  if (!btn) return;
  const filter = btn.dataset.filter as Filter | undefined;
  if (filter) setFilter(filter);
});

// ---------- Bootstrap ----------
load();
render();
input.focus();
