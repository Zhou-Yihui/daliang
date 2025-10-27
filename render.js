// render.js

function renderChars(data) {
  const container = document.getElementById("keyboard");
  container.innerHTML = "";

  data.chars.forEach(char => {
    const btn = document.createElement("button");
    btn.className = "char-btn";
    btn.textContent = char.name;
    btn.onclick = () => insertChar(char.name);
    container.appendChild(btn);
  });
}

function insertChar(name) {
  const input = document.getElementById("inputBox");
  if (!input) return;
  input.value += `[${name}]`;
}