document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");

  // Load todos from localStorage
  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
  } catch (e) {
    console.error("Error loading from localStorage", e);
  }

  // Render todos initially
  renderTodos();

  // Add todo event
  addBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });

  // Function to add a new todo
  function addTodo() {
    const todoText = todoInput.value.trim();

    if (todoText === "") {
      alert("Please enter a task.");
      return;
    }

    const todo = {
      id: Date.now(),
      text: todoText,
      completed: false,
    };

    todos.push(todo);
    saveTodos();
    renderTodos();

    todoInput.value = "";
    todoInput.focus();
  }

  // Function to delete a todo
  function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    renderTodos();
  }

  // Function to toggle todo completed status
  function toggleCompleted(id) {
    todos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    saveTodos();
    renderTodos();
  }

  // Function to edit a todo
  function editTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector(".todo-text");
    const actionsDiv = todoItem.querySelector(".actions");

    const currentText = todoText.textContent;

    // Create edit input
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.className = "edit-input";
    editInput.setAttribute("aria-label", "Edit todo item");

    // Create save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "save-btn";
    saveBtn.setAttribute("aria-label", "Save changes");

    // Create cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-btn";
    cancelBtn.setAttribute("aria-label", "Cancel editing");

    // Clear existing content
    todoText.textContent = "";
    actionsDiv.innerHTML = "";

    // Append new elements
    todoText.appendChild(editInput);
    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(cancelBtn);

    // Focus input
    editInput.focus();

    // Save event
    saveBtn.addEventListener("click", () => {
      saveTodoEdit(id, editInput.value.trim());
    });

    // Cancel event
    cancelBtn.addEventListener("click", () => {
      cancelEdit();
    });

    // Save on Enter key
    editInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveTodoEdit(id, editInput.value.trim());
      }

      // Cancel on Escape key
      if (e.key === "Escape") {
        cancelEdit();
      }
    });
  }

  // Function to save edited todo
  function saveTodoEdit(id, newText) {
    if (newText === "") {
      alert("Task cannot be empty.");
      return;
    }

    todos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, text: newText };
      }
      return todo;
    });

    saveTodos();
    renderTodos();
  }

  // Function to cancel edit
  function cancelEdit() {
    renderTodos();
  }

  // Function to save todos to localStorage
  function saveTodos() {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (e) {
      console.error("Error saving to localStorage", e);
      alert("Failed to save your tasks. Storage may be full or unavailable.");
    }
  }

  // Function to render todos
  function renderTodos() {
    todoList.innerHTML = "";

    todos.forEach((todo) => {
      const todoItem = document.createElement("li");
      todoItem.className = "todo-item";
      todoItem.dataset.id = todo.id;

      const todoText = document.createElement("span");
      todoText.className = "todo-text" + (todo.completed ? " completed" : "");
      todoText.textContent = todo.text;
      todoText.setAttribute(
        "aria-label",
        todo.text + ", mark as " + (todo.completed ? "incomplete" : "complete")
      );
      todoText.setAttribute("role", "checkbox");
      todoText.setAttribute("aria-checked", todo.completed ? "true" : "false");
      todoText.setAttribute("tabindex", "0");

      todoText.addEventListener("click", () => {
        toggleCompleted(todo.id);
      });

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";
      editBtn.setAttribute("aria-label", "Edit " + todo.text);
      editBtn.addEventListener("click", () => {
        editTodo(todo.id);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", "Delete " + todo.text);
      deleteBtn.addEventListener("click", () => {
        deleteTodo(todo.id);
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      todoItem.appendChild(todoText);
      todoItem.appendChild(actionsDiv);

      todoList.appendChild(todoItem);
    });
  }
});
