document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const todoDescription = document.getElementById("todoDescription");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");
  const tabs = document.querySelectorAll(".tab");

  // Current filter
  let currentFilter = "all";

  // Current view (list or detail)
  let currentView = "list";

  // Selected todo for detail view
  let selectedTodoId = null;

  // Load todos from localStorage
  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem("todos")) || [];

    // Add empty description to existing todos if they don't have one
    todos = todos.map((todo) => {
      // Add action log if it doesn't exist
      if (!todo.hasOwnProperty("actionLog")) {
        return {
          ...todo,
          description: todo.description || "",
          isDeleted: false,
          actionLog: [
            {
              action: "created",
              timestamp: todo.id, // Use the todo ID as the creation timestamp
              details: "Todo was created",
            },
          ],
        };
      }
      return {
        ...todo,
        isDeleted: todo.hasOwnProperty("isDeleted") ? todo.isDeleted : false,
      };
    });

    saveTodos(); // Save back with the new properties
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

      // Switch back to list view when changing tabs
      if (currentView === "detail") {
        switchToListView();
      } else {
        // Re-render todos with the new filter
        renderTodos();
      }
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

    const timestamp = Date.now();
    const todo = {
      id: timestamp,
      text: todoText,
      description: description,
      completed: false,
      isDeleted: false,
      actionLog: [
        {
          action: "created",
          timestamp: timestamp,
          details: "Todo was created",
        },
      ],
    };

    todos.push(todo);
    saveTodos();
    renderTodos();

    todoInput.value = "";
    todoDescription.value = "";
    todoInput.focus();
  }

  // Function to soft delete a todo
  function softDeleteTodo(id) {
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      todo.isDeleted = true;

      // Log the deletion action
      logAction(id, "deleted", "Todo was moved to trash");

      saveTodos();
      renderTodos();
    }
  }

  // Function to permanently delete a todo
  function permanentlyDeleteTodo(id) {
    if (
      confirm(
        "Are you sure you want to permanently delete this todo? This action cannot be undone."
      )
    ) {
      todos = todos.filter((todo) => todo.id !== id);
      saveTodos();
      renderTodos();
    }
  }

  // Function to restore a deleted todo
  function restoreTodo(id) {
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      todo.isDeleted = false;

      // Log the restoration action
      logAction(id, "restored", "Todo was restored from trash");

      saveTodos();
      renderTodos();
    }
  }

  // Function to toggle todo completed status
  function toggleCompleted(id) {
    todos = todos.map((todo) => {
      if (todo.id === id) {
        const newCompletedState = !todo.completed;

        // Log the completion action
        logAction(
          id,
          newCompletedState ? "completed" : "uncompleted",
          newCompletedState
            ? "Todo was marked as complete"
            : "Todo was marked as incomplete"
        );

        return { ...todo, completed: newCompletedState };
      }
      return todo;
    });
    saveTodos();
    renderTodos();
  }

  // Function to log an action for a todo
  function logAction(todoId, action, details, oldData = null, newData = null) {
    const todo = todos.find((todo) => todo.id === todoId);
    if (todo) {
      const logEntry = {
        action: action,
        timestamp: Date.now(),
        details: details,
      };

      // Add old and new data if provided (for edits)
      if (oldData) logEntry.oldData = oldData;
      if (newData) logEntry.newData = newData;

      // Add the log entry
      todo.actionLog = todo.actionLog || [];
      todo.actionLog.push(logEntry);
    }
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
    shortcutNote.innerHTML = `
      <span>Save with:</span>
      <div class="key-combo">
        <span class="key">↵</span>
      </div>
      <span>or</span>
      <div class="key-combo">
        <span class="key">⇧</span>
        <span class="key">↵</span>
      </div>
    `;

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

    // Find the todo
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      // Get old data for logging
      const oldData = {
        text: todo.text,
        description: todo.description,
      };

      // Create new data object
      const newData = {
        text: newText,
        description: newDescription,
      };

      // Log the edit action with details of what changed
      let detailsText = "Todo was edited:";
      if (oldData.text !== newData.text) {
        detailsText += ` Title changed from "${oldData.text}" to "${newData.text}".`;
      }
      if (oldData.description !== newData.description) {
        detailsText += ` Description was updated.`;
      }

      logAction(id, "edited", detailsText, oldData, newData);

      // Update the todo
      todo.text = newText;
      todo.description = newDescription;

      saveTodos();
      renderTodos();
    }
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

  // Function to view todo details
  function viewTodoDetails(id) {
    selectedTodoId = id;
    currentView = "detail";
    renderTodoDetails(id);
  }

  // Function to switch back to list view
  function switchToListView() {
    currentView = "list";
    selectedTodoId = null;
    renderTodos();
  }

  // Function to render todo details
  function renderTodoDetails(id) {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) {
      switchToListView();
      return;
    }

    todoList.innerHTML = "";

    // Create back button
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
      <span>Back to list</span>
    `;
    backButton.addEventListener("click", switchToListView);

    // Create details container
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "todo-details";

    // Todo header with status
    const todoHeader = document.createElement("div");
    todoHeader.className = "todo-details-header";

    // Status badge
    const statusBadge = document.createElement("div");
    statusBadge.className = "status-badge";
    if (todo.isDeleted) {
      statusBadge.classList.add("deleted");
      statusBadge.textContent = "Deleted";
    } else if (todo.completed) {
      statusBadge.classList.add("completed");
      statusBadge.textContent = "Completed";
    } else {
      statusBadge.classList.add("active");
      statusBadge.textContent = "Active";
    }

    todoHeader.innerHTML = `
      <h2>${todo.text}</h2>
    `;
    todoHeader.appendChild(statusBadge);

    // Todo description
    const todoDescriptionEl = document.createElement("div");
    todoDescriptionEl.className = "todo-details-description";
    todoDescriptionEl.textContent =
      todo.description || "No description provided";

    // Action log heading
    const logHeading = document.createElement("h3");
    logHeading.textContent = "Activity Log";
    logHeading.className = "activity-log-heading";

    // Activity log
    const activityLog = document.createElement("div");
    activityLog.className = "activity-log";

    // Create log entries
    todo.actionLog
      .slice()
      .reverse()
      .forEach((entry) => {
        const logEntry = document.createElement("div");
        logEntry.className = "log-entry";

        // Format timestamp
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const formattedTime = date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Determine icon based on action
        let actionIcon = "";
        switch (entry.action) {
          case "created":
            actionIcon = `<svg class="log-icon created" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>`;
            break;
          case "completed":
            actionIcon = `<svg class="log-icon completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>`;
            break;
          case "uncompleted":
            actionIcon = `<svg class="log-icon uncompleted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4M12 16h.01"></path><circle cx="12" cy="12" r="10"></circle></svg>`;
            break;
          case "edited":
            actionIcon = `<svg class="log-icon edited" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            break;
          case "deleted":
            actionIcon = `<svg class="log-icon deleted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            break;
          case "restored":
            actionIcon = `<svg class="log-icon restored" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`;
            break;
          default:
            actionIcon = `<svg class="log-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
        }

        logEntry.innerHTML = `
        <div class="log-entry-header">
          ${actionIcon}
          <span class="log-action">${
            entry.action.charAt(0).toUpperCase() + entry.action.slice(1)
          }</span>
          <span class="log-time">${formattedDate} at ${formattedTime}</span>
        </div>
        <div class="log-details">${entry.details}</div>
      `;

        activityLog.appendChild(logEntry);
      });

    // Assemble the details view
    detailsContainer.appendChild(todoHeader);
    detailsContainer.appendChild(todoDescriptionEl);
    detailsContainer.appendChild(logHeading);
    detailsContainer.appendChild(activityLog);

    // Add back button and details to the DOM
    todoList.appendChild(backButton);
    todoList.appendChild(detailsContainer);
  }

  // Function to render todos
  function renderTodos() {
    if (currentView === "detail") {
      renderTodoDetails(selectedTodoId);
      return;
    }

    todoList.innerHTML = "";

    // Filter todos based on current tab
    let filteredTodos = todos;
    if (currentFilter === "active") {
      filteredTodos = todos.filter(
        (todo) => !todo.completed && !todo.isDeleted
      );
    } else if (currentFilter === "completed") {
      filteredTodos = todos.filter((todo) => todo.completed && !todo.isDeleted);
    } else if (currentFilter === "deleted") {
      filteredTodos = todos.filter((todo) => todo.isDeleted);
    } else {
      // "all" filter - show all except deleted
      filteredTodos = todos.filter((todo) => !todo.isDeleted);
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
      } else if (currentFilter === "deleted") {
        emptyMessage = "No deleted tasks. Your trash is empty.";
        emptySvg = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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

      // Actions div - different actions based on whether todo is in trash or not
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      // Create history button
      const historyBtn = document.createElement("button");
      historyBtn.className = "history-btn";
      historyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;
      historyBtn.setAttribute("aria-label", "View history");
      historyBtn.setAttribute("title", "View history");
      historyBtn.addEventListener("click", () => {
        viewTodoDetails(todo.id);
      });
      actionsDiv.appendChild(historyBtn);

      if (currentFilter === "deleted") {
        // Create restore button
        const restoreBtn = document.createElement("button");
        restoreBtn.className = "restore-btn";
        restoreBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        `;
        restoreBtn.setAttribute("aria-label", "Restore todo");
        restoreBtn.setAttribute("title", "Restore todo");
        restoreBtn.addEventListener("click", () => {
          restoreTodo(todo.id);
        });

        // Create permanent delete button
        const permDeleteBtn = document.createElement("button");
        permDeleteBtn.className = "perm-delete-btn";
        permDeleteBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        `;
        permDeleteBtn.setAttribute("aria-label", "Permanently delete todo");
        permDeleteBtn.setAttribute("title", "Permanently delete");
        permDeleteBtn.addEventListener("click", () => {
          permanentlyDeleteTodo(todo.id);
        });

        actionsDiv.appendChild(restoreBtn);
        actionsDiv.appendChild(permDeleteBtn);
      } else {
        // Create delete button (soft delete)
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        deleteBtn.setAttribute("aria-label", "Delete " + todo.text);
        deleteBtn.setAttribute("title", "Move to trash");
        deleteBtn.addEventListener("click", () => {
          softDeleteTodo(todo.id);
        });

        actionsDiv.appendChild(deleteBtn);
      }

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
