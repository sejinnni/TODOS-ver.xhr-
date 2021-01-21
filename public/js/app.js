let todos = [];
let navState = 'all';

const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $completeAll = document.querySelector('#ck-complete-all');
const $clearCompleted = document.querySelector('.clear-completed > .btn');
const $completeTodos = document.querySelector('.completed-todos');
const $active = document.querySelector('.active-todos');
const $nav = document.querySelector('.nav');

const render = () => {
  const _todos = todos.filter(({ completed }) =>
    navState === 'all' ? true : navState === 'active' ? !completed : completed
  );

  $todos.innerHTML = _todos
    .map(({ id, content, completed }) => {
      return `<li id="${id}" class="todo-item">
  <input id="ck-${id}" class="checkbox" type="checkbox" ${
        completed ? 'checked' : ''
      }/>
  <label for="ck-${id}" ${
        completed ? 'style="text-decoration:line-through"' : ''
      }>${content}</label>
  <i class="remove-todo far fa-times-circle"></i>
</li> `;
    })
    .join('');

  $completeTodos.textContent = todos.filter((todo) => todo.completed).length;
  $active.textContent = todos.filter((todo) => !todo.completed).length;
};

const fetchTodos = () => {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://localhost:3000/todos');
  xhr.send();
  xhr.onload = () => {
    if (xhr.status === 200) {
      todos = JSON.parse(xhr.response);
      todos = todos.sort((todo1, todo2) => todo2.id - todo1.id);

      render();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
};

const generateId = () => {
  return todos.length ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;
};

const addTodo = (content) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/todos');
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.send(JSON.stringify({ id: generateId(), content, completed: false }));
  xhr.onload = () => {
    if (xhr.status === 200 || xhr.status === 201) {
      fetchTodos();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
};

const PatchTodo = (id, currentCompleted) => {
  const xhr = new XMLHttpRequest();
  xhr.open('PATCH', `http://localhost:3000/todos/${id}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ completed: currentCompleted }));
  xhr.onload = () => {
    if (xhr.status === 200) {
      fetchTodos();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
};

const removeTodo = (id) => {
  const xhr = new XMLHttpRequest();

  xhr.open('DELETE', `http://localhost:3000/todos/${id}`);
  xhr.send();
  xhr.onload = () => {
    if (xhr.status === 200) {
      fetchTodos();
    } else {
      console.error('Error', xhr.status, xhr.statusText);
    }
  };
};

const toggleTodo = (currentCompleted) => {
  const xhr = new XMLHttpRequest();

  todos.map((todo) => {
    xhr.open('PATCH', `http://localhost:3000/todos/${todo.id}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ completed: currentCompleted }));
    xhr.onload = () => {
      if (xhr.status === 200) {
        fetchTodos();
      } else {
        console.error('Error', xhr.status, xhr.statusText);
      }
    };
  });
};

const clearTodo = () => {
  //체크된 애들을 걸러서 체크된 아이들을 찾기
  //컴플리트 값이 true인것을 걸러서
  const completeTrue = todos.filter((todo) => todo.completed === true);

  const xhr = new XMLHttpRequest();

  completeTrue.map((todo) => {
    xhr.open('DELETE', `http://localhost:3000/todos/${todo.id}`);
    xhr.send();
    xhr.onload = () => {
      if (xhr.status === 200) {
        // $completeTodos.textContent = JSON.parse(xhr.response).length;
        fetchTodos();
      } else {
        console.error('Error', xhr.status, xhr.statusText);
      }
    };
  });
};

const changeNav = (id) => {
  // $navItem의 id가 e.target의 id와 같으면 active 클래스를 추가하고 아니면 active 클래스를 제거
  [...$nav.children].forEach(($navItem) => {
    $navItem.classList.toggle('active', $navItem.id === id);
  });

  navState = id;
  // console.log('[navState]', navState);
};

// const stateNav = () => {
//   const xhr = new XMLHttpRequest();

//   todos.filter(({ currentCompleted }) => {
//     xhr.open('PATCH', `http://localhost:3000/todos/${id}`);
//     xhr.setRequestHeader('content-type', 'application/json');
//     xhr.send(JSON.stringify({ completed: !currentCompleted }));
//     xhr.onload = () => {
//       if (xhr.status === 200) {
//         fetchTodos();
//       } else {
//         console.error('Error', xhr.status, xhr.statusText);
//       }
//     };
//   });
// };

document.addEventListener('DOMContentLoaded', fetchTodos);

$inputTodo.onkeyup = (e) => {
  const content = $inputTodo.value;
  if (e.key !== 'Enter' || !content) return;
  $inputTodo.value = '';
  addTodo(content);
};

$todos.onchange = (e) => {
  if (!e.target.matches('input')) return;
  PatchTodo(e.target.parentNode.id, e.target.checked);
};

$todos.onclick = (e) => {
  if (!e.target.matches('.remove-todo')) return;
  removeTodo(e.target.parentNode.id);
};

$completeAll.onchange = (e) => {
  toggleTodo(e.target.checked);
};

$clearCompleted.onclick = (e) => {
  clearTodo(e.target.checked);
};

$nav.onclick = (e) => {
  if (e.target.classList.contains('nav')) return;
  changeNav(e.target.id);
  render();
};
