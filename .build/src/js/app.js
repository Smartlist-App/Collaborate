window.onerror = (err) => alert(err);
const socket = io();
const _root = document.getElementById("_root");
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
});
//# sourceMappingURL=app.js.map
