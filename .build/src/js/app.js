const _root = document.getElementById("_root");
const socket = io();
const server = {
  addData(key, value) {
    socket.emit(`add-${key}`, value);
  }
};
window.onerror = (err) => alert(err);
function insertHTML(html, dest, append = false) {
  if (!append)
    dest.innerHTML = "";
  let container = document.createElement("div");
  container.innerHTML = html;
  let scripts = container.querySelectorAll("script");
  let nodes = container.childNodes;
  for (let i = 0; i < nodes.length; i++)
    dest.appendChild(nodes[i].cloneNode(true));
  for (let i = 0; i < scripts.length; i++) {
    let script = document.createElement("script");
    script.type = scripts[i].type || "text/javascript";
    if (scripts[i].hasAttribute("src"))
      script.src = scripts[i].src;
    script.innerHTML = scripts[i].innerHTML;
    document.head.appendChild(script);
    document.head.removeChild(script);
  }
  return true;
}
function getHashPage(loader = true) {
  if (loader)
    _root.innerHTML = `<div class="flex items-center justify-center w-full h-full"> <div class="spinner w-10 h-10" role="status"> <span class="sr-only">Loading...</span> </div> </div>`;
  let page;
  const pages = {
    "/overview": "/pages/overview",
    "/menu": "/pages/menu",
    "/attendees": "/pages/attendees",
    "/lists": "/pages/lists",
    "/items": "/pages/items",
    "/outline": "/pages/outline",
    "/invitations": "/pages/invitations",
    "/ticket-designer": "/pages/ticket-designer",
    "/event-website": "/pages/event-website",
    "/floor-plan": "/pages/floor-plan",
    "/check-in": "/pages/check-in"
  };
  page = pages[window.location.hash.replace("#", "")] ?? "/pages/overview";
  fetch(page).then((res) => res.text()).then((res) => insertHTML(res, _root));
}
getHashPage(false);
window.addEventListener("hashchange", getHashPage);
document.getElementById("chatTrigger").addEventListener("click", () => {
  document.getElementById("chatSidenav").classList.toggle("active");
  document.getElementById("nav").classList.toggle("active");
  document.getElementById("chatInput").focus();
  document.body.classList.toggle("pr-[270px]");
  if (window.innerWidth < 640)
    document.body.classList.toggle("pr-[270px]");
});
window.chatCooldown = false;
document.getElementById("chatInput").addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    document.getElementById("chatTriggerIcon").innerHTML = "chat_bubble_outline";
    let msg = document.getElementById("chatInput").value;
    if (msg.trim() == "")
      return;
    if (window.chatCooldown)
      return;
    window.chatCooldown = true;
    setTimeout(() => window.chatCooldown = false, 400);
    socket.emit("chat-message", {
      user: ACCOUNT_INFO,
      event: EVENT_ID,
      msg
    });
    document.getElementById("chatInput").value = "";
  }
});
socket.on("chat-message", (e) => {
  document.getElementById("chatTriggerIcon").innerHTML = "mark_chat_unread";
  let container = document.getElementById("chatContainer");
  let message = document.createElement("SECTION");
  let audio = document.createElement("AUDIO");
  audio.src = "https://padlet-uploads.storage.googleapis.com/446844750/5fda30d0eed3d079e360e9cd64f44852/among_us_chat_sound.mp3";
  audio.addEventListener("ended", () => audio.remove());
  audio.play();
  message.classList.add("msg");
  message.innerHTML = `${e.short ? "" : `<span>${e.user.name}</span><br />`}${e.short ? `<i>${e.msg}</i>` : e.msg}`;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
});
window.addEventListener("load", () => {
  socket.emit("chat-message", {
    user: ACCOUNT_INFO,
    event: EVENT_ID,
    msg: ACCOUNT_INFO.name + " has joined the event",
    short: true
  });
});
//# sourceMappingURL=app.js.map
