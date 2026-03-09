async function loadComponent(id, file) {
  const res = await fetch(file);
  const data = await res.text();
  document.getElementById(id).innerHTML = data;
}

loadComponent("navbar", "/components/navbar.html");
loadComponent("mobileNav", "/components/mobile-menu.html");