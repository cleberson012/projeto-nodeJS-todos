const express = require("express");
const cors = require("cors");
const uuid = require("uuid");

const app = express();

const dados = [];

//medlewares
function getUserFromHeaders(request, response, next) {
  const { username } = request.headers;
  const findedUser = dados.find((user) => user.username === username);
  request.user = findedUser;
  next();
}

function getTodoFromId(request, response, next) {
  const { id } = request.params;
  const findedTodo = request.user.todos.find((todo) => todo.id === id);
  request.todo = findedTodo;
  next();
}

function todoShouldExists(request, response, next) {
  if (!request.todo) {
    return response.status(404).json({ error: "todo not exists" });
  }
  next();
}

function userShouldExists(request, response, next) {
  if (!request.user) {
    return response.status(404).json({ error: "user not exists" });
  }
  next();
}

app.use(cors());

app.use(express.json());

app.get("/users", (request, response) => {
  return response.json(dados);
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const findedUSer = dados.find((user) => user.username === username);
  if (findedUSer) {
    return response.status(400).json({ error: "user already exists" });
  }

  const user = {
    name,
    username,
    id: uuid.v4(),
    todos: [],
  };

  dados.push(user);
  return response.json(user);
});

app.get("/todos", getUserFromHeaders, userShouldExists, (request, response) => {
  response.json(request.user.todos);
});

app.post(
  "/todos",
  getUserFromHeaders,
  userShouldExists,
  (request, response) => {
    const { title, deadline } = request.body;

    const todo = {
      id: uuid.v4(),
      title: title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    };

    request.user.todos.push(todo);
    response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  getUserFromHeaders,
  userShouldExists,
  getTodoFromId,
  todoShouldExists,
  (request, response) => {
    request.todo.done = true;
    response.json(request.todo);
  }
);

app.put(
  "/todos/:id",
  getUserFromHeaders,
  userShouldExists,
  getTodoFromId,
  todoShouldExists,
  (request, response) => {
    const { title, deadline } = request.body;

    if (title) {
      request.todo.title = title;
    }
    if (deadline) {
      request.todo.deadline = new Date(deadline);
    }

    response.json(request.todo);
  }
);

app.delete(
  "/todos/:id",
  getUserFromHeaders,
  userShouldExists,
  getTodoFromId,
  todoShouldExists,
  (request, response) => {
    const index = request.user.todos.indexOf(request.todo);
    request.user.todos.splice(index, 1);

    response.status(204).end();
  }
);

module.exports = app;
