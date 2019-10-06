console.log("123");
let page = document.getElementById("buttonDiv");
let Button = document.createElement("button");

page.appendChild(Button);

function showSomething() {
  let popupProp = "color";
  for (let i = 0; i < 5; i++) {
    console.log(popupProp);
  }
}

showSomething();
