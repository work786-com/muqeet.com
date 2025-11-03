document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- Mobile Menu (full-screen overlay) ---------------- */
  const menuToggle = document.getElementById("menuToggle");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenu = document.getElementById("closeMenu");
  if (menuToggle && menuOverlay && closeMenu) {
    menuToggle.addEventListener("click", () => {
      menuOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    });
    closeMenu.addEventListener("click", () => {
      menuOverlay.classList.remove("open");
      document.body.style.overflow = "auto";
    });
    menuOverlay.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        menuOverlay.classList.remove("open");
        document.body.style.overflow = "auto";
      });
    });
  }

  /* ---------------- Tabs (projects / certificates / techstack) ---------------- */
  const tabButtons = document.querySelectorAll(".filter-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.dataset.target;
      if (id) {
        const el = document.getElementById(id);
        el && el.classList.add("active");
      }
    });
  });

  /* ---------------- Popup logic (single popup for projects & certificates) ---------------- */
  const popup = document.getElementById("popup");
  const popupImg = document.getElementById("popup-img");
  const popupTitle = document.getElementById("popup-title");
  const popupDesc = document.getElementById("popup-desc");
  const popupClose = popup ? popup.querySelector(".close-btn") : null;

  function openPopup({ img = "", title = "", desc = "" } = {}) {
    if (!popup) return;
    popupImg.src = img || "";
    popupTitle.textContent = title || "";
    popupDesc.textContent = desc || "";
    popup.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closePopup() {
    if (!popup) return;
    popup.classList.remove("active");
    document.body.style.overflow = "auto";
    setTimeout(() => { if (popupImg) popupImg.src = ""; }, 300);
  }

  if (popupClose) popupClose.addEventListener("click", closePopup);
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });

  /* ---------------- Projects: detail + certificates click popup ---------------- */
  const allGrids = document.querySelectorAll(".card-grid");
  allGrids.forEach(grid => {
    grid.addEventListener("click", (evt) => {
      const detailBtn = evt.target.closest(".detail");
      if (detailBtn) {
        evt.preventDefault();
        evt.stopPropagation(); // ✅ stop default scroll-to-top completely
        const scrollY = window.scrollY; // remember position
        const card = detailBtn.closest(".card");
        if (!card) return;
        const imgEl = card.querySelector("img");
        const titleEl = card.querySelector("h3");
        const pEl = card.querySelector("p");
        openPopup({
          img: imgEl ? imgEl.src : "",
          title: titleEl ? titleEl.textContent.trim() : "",
          desc: pEl ? pEl.textContent.trim() : ""
        });
        window.scrollTo(0, scrollY); // ✅ keep same position (no slide)
        return;
      }

      const clickedImg = evt.target.closest("img");
      if (clickedImg) {
        const isInCertificates = clickedImg.closest("#certificates");
        if (isInCertificates) {
          evt.preventDefault();
          evt.stopPropagation();
          const alt = clickedImg.alt || "";
          openPopup({
            img: clickedImg.src,
            title: alt || "Certificate",
            desc: ""
          });
          window.scrollTo(0, window.scrollY);
          return;
        }
      }
    }, { passive: false });
  });

  /* ---------------- Contact form UX ---------------- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector(".send-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span class='send-wave'></span> Sending...";
      }

      try {
        const res = await fetch(contactForm.action, { method: "POST", body: formData });
        const data = await res.json();
        if (data && data.success) showFloatingMessage("Message Sent!", true);
        else showFloatingMessage("Failed to send.", false);
      } catch (err) {
        showFloatingMessage("Failed to send.", false);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send";
        }
        contactForm.reset();
      }
    });
  }

  /* ---------------- Navbar highlight on scroll ---------------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a, .menu-links a");
  function highlightNav() {
    let current = "";
    sections.forEach(section => {
      const top = section.offsetTop - 200;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(a => {
      a.classList.remove("active");
      const href = a.getAttribute("href");
      if (href === `#${current}`) a.classList.add("active");
    });
  }
  window.addEventListener("scroll", highlightNav);

  /* ---------------- Helper: floating message ---------------- */
  function showFloatingMessage(text, success = true) {
    const div = document.createElement("div");
    div.className = `popup-message ${success ? "success" : "error"}`;
    div.innerHTML = `<div class="icon"><i class="${success ? "fa fa-check" : "fa fa-times"}"></i></div><p>${text}</p>`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add("show"), 20);
    setTimeout(() => { div.classList.remove("show"); setTimeout(() => div.remove(), 600); }, 3000);
  }
  window.showSuccessPopup = () => showFloatingMessage("Message Sent!", true);
  window.showErrorPopup = () => showFloatingMessage("Failed to send!", false);

  /* ---------------- Mobile Hover Effect Fallback ---------------- */
  // when icon is tapped on touch device, simulate hover animation briefly
  const techIcons = document.querySelectorAll(".tech img");
  techIcons.forEach(icon => {
    icon.addEventListener("touchstart", () => {
      icon.classList.add("touch-glow");
      setTimeout(() => icon.classList.remove("touch-glow"), 600);
    }, { passive: true });
  });
});
