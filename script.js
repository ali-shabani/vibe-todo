document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const todoDescription = document.getElementById("todoDescription");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");

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

    // Save on Enter key with Ctrl for the main input
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        saveTodoEdit(id, editInput.value.trim(), editDescTextarea.value.trim());
      }
    });

    // Save on Enter key with Ctrl for textarea
    editDescTextarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
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

    todos.forEach((todo) => {
      const todoItem = document.createElement("li");
      todoItem.className = "todo-item";
      todoItem.dataset.id = todo.id;

      // Create todo content container
      const todoContent = document.createElement("div");
      todoContent.className = "todo-content";

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

      // Add elements to todo content
      todoContent.appendChild(todoText);
      todoContent.appendChild(actionsDiv);
      todoItem.appendChild(todoContent);

      // Always add description container, even if empty
      const todoDesc = document.createElement("div");
      todoDesc.className = "todo-description";
      todoDesc.textContent = todo.description || "No description provided";
      if (!todo.description) {
        todoDesc.style.fontStyle = "italic";
        todoDesc.style.color = "#aaa";
      }
      todoItem.appendChild(todoDesc);

      todoList.appendChild(todoItem);
    });
  }
});
