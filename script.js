document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const todoDescription = document.getElementById("todoDescription");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");
  const tabs = document.querySelectorAll(".tab");

  // Current filter
  let currentFilter = "all";

  // Load todos from localStorage
  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem("todos")) || [];

    // Add empty description to existing todos if they don't have one
    todos = todos.map((todo) => {
      if (!todo.hasOwnProperty("description")) {
        return { ...todo, description: "" };
      }
      return todo;
    });

    saveTodos(); // Save back with the new property
  } catch (e) {
    console.error("Error loading from localStorage", e);
  }

  // Tab event listeners
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update current filter
      currentFilter = tab.dataset.filter;

      // Re-render todos with the new filter
      renderTodos();
    });
  });

  // Render todos initially
  renderTodos();

  // Add todo event
  addBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });

  // Add Shift+Enter support for description field
  todoDescription.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault(); // Prevent default behavior of textarea
      addTodo();
    }
  });

  // Function to add a new todo
  function addTodo() {
    const todoText = todoInput.value.trim();
    const description = todoDescription.value.trim();

    if (todoText === "") {
      alert("Please enter a task.");
      return;
    }

    const todo = {
      id: Date.now(),
      text: todoText,
      description: description,
      completed: false,
    };

    todos.push(todo);
    saveTodos();
    renderTodos();

    todoInput.value = "";
    todoDescription.value = "";
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
    const todoContent = todoItem.querySelector(".todo-content");
    const todoText = todoContent.querySelector(".todo-text");
    const todoDescription = todoItem.querySelector(".todo-description");
    const actionsDiv = todoContent.querySelector(".actions");

    const currentText = todoText.textContent;
    const currentDescription = todoDescription
      ? todoDescription.textContent
      : "";

    // Create edit container
    const editContainer = document.createElement("div");
    editContainer.className = "edit-container";

    // Create edit input for text
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.className = "edit-input";
    editInput.setAttribute("aria-label", "Edit todo title");

    // Create edit textarea for description
    const editDescTextarea = document.createElement("textarea");
    editDescTextarea.value = currentDescription;
    editDescTextarea.className = "edit-textarea";
    editDescTextarea.setAttribute("aria-label", "Edit todo description");
    editDescTextarea.placeholder = "Description (optional)";
    editDescTextarea.rows = 4;

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

    // Add a helper note for keyboard shortcuts
    const shortcutNote = document.createElement("div");
    shortcutNote.className = "shortcut-note";
    shortcutNote.textContent =
      "Tip: Press Enter on title or Shift+Enter on description to save";

    // Clear existing content
    todoItem.innerHTML = "";

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "actions";
    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(cancelBtn);

    // Append new elements
    editContainer.appendChild(editInput);
    editContainer.appendChild(editDescTextarea);
    editContainer.appendChild(shortcutNote);
    editContainer.appendChild(buttonsContainer);
    todoItem.appendChild(editContainer);

    // Focus input
    editInput.focus();

    // Save event
    saveBtn.addEventListener("click", () => {
      saveTodoEdit(id, editInput.value.trim(), editDescTextarea.value.trim());
    });

    // Cancel event
    cancelBtn.addEventListener("click", () => {
      cancelEdit();
    });

    // Save on Enter key for the main input
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveTodoEdit(id, editInput.value.trim(), editDescTextarea.value.trim());
      }
    });

    // Save on Shift+Enter for textarea
    editDescTextarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault(); // Prevent default behavior of textarea
        saveTodoEdit(id, editInput.value.trim(), editDescTextarea.value.trim());
      }
      // Keep existing Ctrl+Enter functionality as an alternative
      else if (e.ctrlKey && e.key === "Enter") {
        saveTodoEdit(id, editInput.value.trim(), editDescTextarea.value.trim());
      }
    });
  }

  // Function to save edited todo
  function saveTodoEdit(id, newText, newDescription) {
    if (newText === "") {
      alert("Task cannot be empty.");
      return;
    }

    todos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, text: newText, description: newDescription };
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

    // Filter todos based on current tab
    let filteredTodos = todos;
    if (currentFilter === "active") {
      filteredTodos = todos.filter((todo) => !todo.completed);
    } else if (currentFilter === "completed") {
      filteredTodos = todos.filter((todo) => todo.completed);
    }

    // Show empty state if no todos match the filter
    if (filteredTodos.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";

      // Different messages based on current filter
      let emptyMessage = "No tasks yet. Add your first todo!";
      let emptySvg = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="M8 12h8"></path>
        <path d="M12 8v8"></path>
      </svg>`;

      if (currentFilter === "active") {
        emptyMessage = "No active tasks. Great job!";
        emptySvg = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>`;
      } else if (currentFilter === "completed") {
        emptyMessage = "No completed tasks yet. Check off some todos!";
        emptySvg = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <path d="M22 4 12 14.01l-3-3"></path>
        </svg>`;
      }

      emptyState.innerHTML = `
        <div class="empty-icon">${emptySvg}</div>
        <p>${emptyMessage}</p>
      `;

      todoList.appendChild(emptyState);
      return;
    }

    filteredTodos.forEach((todo) => {
      const todoItem = document.createElement("li");
      todoItem.className = "todo-item";
      todoItem.dataset.id = todo.id;

      // Create todo content container
      const todoContent = document.createElement("div");
      todoContent.className = "todo-content";

      // Create checkbox for completion
      const todoCheckbox = document.createElement("div");
      todoCheckbox.className =
        "todo-checkbox" + (todo.completed ? " checked" : "");
      todoCheckbox.setAttribute("role", "checkbox");
      todoCheckbox.setAttribute(
        "aria-checked",
        todo.completed ? "true" : "false"
      );
      todoCheckbox.setAttribute("tabindex", "0");
      todoCheckbox.setAttribute(
        "aria-label",
        "Mark as " + (todo.completed ? "incomplete" : "complete")
      );

      todoCheckbox.addEventListener("click", () => {
        toggleCompleted(todo.id);
      });

      // Keyboard support for checkbox
      todoCheckbox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleCompleted(todo.id);
        }
      });

      const todoText = document.createElement("span");
      todoText.className = "todo-text" + (todo.completed ? " completed" : "");
      todoText.textContent = todo.text;
      todoText.setAttribute("title", "Click to edit");
      todoText.addEventListener("click", () => {
        editTodo(todo.id);
      });

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", "Delete " + todo.text);
      deleteBtn.addEventListener("click", () => {
        deleteTodo(todo.id);
      });

      actionsDiv.appendChild(deleteBtn);

      // Add elements to todo content
      todoContent.appendChild(todoCheckbox);
      todoContent.appendChild(todoText);
      todoContent.appendChild(actionsDiv);
      todoItem.appendChild(todoContent);

      // Always add description container, even if empty
      const todoDesc = document.createElement("div");
      todoDesc.className = "todo-description";
      todoDesc.textContent = todo.description || "No description provided";
      if (!todo.description) {
        todoDesc.classList.add("todo-description-empty");
      }
      todoDesc.setAttribute("title", "Click to edit");
      todoDesc.addEventListener("click", () => {
        editTodo(todo.id);
      });
      todoItem.appendChild(todoDesc);

      todoList.appendChild(todoItem);
    });
  }
});
