const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userExists = users.find(user => user.username === username);

  if(!userExists) {
    return response.status(401).json({error: "user does'nt exists"})
  }

  request.user = userExists

  return next();
}

function checkTodoExists(request, response, next) {
  const { username } = request.headers
  const { id } = request.params
  const user = users.find(user => user.username === username);

  const findedTodo = user.todos.find(todo => todo.id === id);

  if(!findedTodo) {
    return response.status(404).json({error: "todos not found"})
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.find(user => user.username === username)

  if(userExists) {
    return response.status(400).json({error: 'user already exisits'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.json(user)
});

app.get('/todos', checksExistsUserAccount,(request, response) => {
  const { todos } = request.user

  return response.json(todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  todos.push(todo);

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todos } = request.user
  const { id } = request.params
  const { title, deadline } = request.body

  let todo = todos.find(todoItem => todoItem.id === id);

  todo.title = title
  todo.deadline = deadline

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todos } = request.user
  const { id } = request.params

  let todo = todos.find(todoItem => todoItem.id === id);

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  let { todos } = request.user
  const { id } = request.params

  todos.pop(todo => todo.id === id);

  return response.status(204).send()
});

module.exports = app;