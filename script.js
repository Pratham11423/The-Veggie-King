// JAI SHREE RAM


// Always load from the top
window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

window.addEventListener("load", () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});


// 1. Smooth Scroll for nav links
document.querySelectorAll('.nav-bar a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    document.querySelector(targetId).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// 2. Active link highlighting on scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-bar a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80; // adjust for navbar height
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// 3. Hero button scroll to Menu
const menuBtn = document.querySelector(".hero1 button");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
  });
}

// 4. Intersection Observer for fade-in animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".sec2, .sec3, .sec4, .sec5, .sec6").forEach(section => {
  observer.observe(section);
});

// 5. Make contact section functional
const phone = document.querySelector(".sec5-div3 h4");
const address = document.querySelector(".sec5-div2 h4");

if (phone) {
  phone.addEventListener("click", () => {
    window.location.href = "tel:01234567890";
  });
}

if (address) {
  address.addEventListener("click", () => {
    window.open("https://www.google.com/maps/search/112,Sharda-Nagar,Saharanpur", "_blank");
  });
}

// 6. Mobile menu toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".show");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu on link click (mobile UX)
  document.querySelectorAll(".nav-bar a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// 7. Back to Top button
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


