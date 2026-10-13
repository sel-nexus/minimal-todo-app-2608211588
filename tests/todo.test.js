const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

/** Create the minimal DOM surface needed to execute the inline application script. */
function createHarness() {
  const elements = new Map();
  const makeElement = (id) => {
    const element = {
      id,
      value: "",
      hidden: false,
      children: [],
      listeners: {},
      dataset: {},
      className: "",
      textContent: "",
      checked: false,
      replaceChildren() { this.children = []; },
      append(...children) { this.children.push(...children); },
      addEventListener(type, callback) { this.listeners[type] = callback; },
      setAttribute(name, value) { this[name] = value; },
      focus() { this.focused = true; }
    };
    elements.set(id, element);
    return element;
  };

  const document = {
    getElementById(id) { return elements.get(id) || makeElement(id); },
    createElement(tagName) {
      const element = makeElement(`created-${elements.size}`);
      element.tagName = tagName.toUpperCase();
      return element;
    }
  };
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const context = vm.createContext({ document });
  vm.runInContext(`${script}\n;globalThis.__todoTestApi = { todos, get nextId() { return nextId; }, addTodo, toggleTodo, deleteTodo };`, context);
  return { context: context.__todoTestApi, elements };
}

test("addTodo trims titles, assigns sequential IDs, and clears the input", () => {
  const { context, elements } = createHarness();
  const input = elements.get("todo-input");
  input.value = "  Write tests  ";
  context.addTodo();

  assert.deepEqual(Array.from(context.todos, (todo) => ({ ...todo })), [
    { id: 1, title: "Write tests", completed: false }
  ]);
  assert.equal(input.value, "");
  assert.equal(context.nextId, 2);
});

test("addTodo ignores empty and whitespace-only titles without consuming IDs", () => {
  const { context, elements } = createHarness();
  const input = elements.get("todo-input");

  input.value = "";
  context.addTodo();
  input.value = " \t\n ";
  context.addTodo();

  assert.equal(context.todos.length, 0);
  assert.equal(context.nextId, 1);
});

test("toggleTodo changes only the matching task and ignores unknown IDs", () => {
  const { context, elements } = createHarness();
  const input = elements.get("todo-input");
  input.value = "First";
  context.addTodo();
  input.value = "Second";
  context.addTodo();

  context.toggleTodo(1);
  assert.deepEqual(Array.from(context.todos, (todo) => todo.completed), [true, false]);
  context.toggleTodo(999);
  assert.deepEqual(Array.from(context.todos, (todo) => todo.completed), [true, false]);
});

test("deleteTodo removes only the matching task and ignores unknown IDs", () => {
  const { context, elements } = createHarness();
  const input = elements.get("todo-input");
  input.value = "First";
  context.addTodo();
  input.value = "Second";
  context.addTodo();

  context.deleteTodo(1);
  assert.deepEqual(Array.from(context.todos, (todo) => ({ ...todo })), [
    { id: 2, title: "Second", completed: false }
  ]);
  context.deleteTodo(999);
  assert.deepEqual(Array.from(context.todos, (todo) => ({ ...todo })), [
    { id: 2, title: "Second", completed: false }
  ]);
});
