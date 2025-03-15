// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Navbar scroll effect
    const navbar = document.querySelector(".navbar")
  
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled")
      } else {
        navbar.classList.remove("scrolled")
      }
    })
  
    // Portfolio filter functionality
    const filterButtons = document.querySelectorAll(".portfolio-filters button")
    const portfolioItems = document.querySelectorAll(".portfolio-item")
  
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        // Add active class to clicked button
        this.classList.add("active")
  
        const filterValue = this.getAttribute("data-filter")
  
        portfolioItems.forEach((item) => {
          if (filterValue === "all" || item.classList.contains(filterValue)) {
            item.style.display = "block"
          } else {
            item.style.display = "none"
          }
        })
      })
    })
  
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
  
        const targetId = this.getAttribute("href")
        const targetElement = document.querySelector(targetId)
  
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: "smooth",
          })
  
          // Close mobile menu if open
          const navbarCollapse = document.querySelector(".navbar-collapse")
          if (navbarCollapse.classList.contains("show")) {
            navbarCollapse.classList.remove("show")
          }
        }
      })
    })
  
    // Form submission handling
    const contactForm = document.getElementById("contactForm")
    const formMessage = document.getElementById("form-message")
  
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Get form values
        const name = document.getElementById("name").value
        const email = document.getElementById("email").value
        const subject = document.getElementById("subject").value
        const message = document.getElementById("message").value
  
        // Simple form validation
        if (name && email && subject && message) {
          // In a real application, you would send this data to a server
          // For this demo, we'll just show a success message
          formMessage.innerHTML = '<div class="alert alert-success">Your message has been sent successfully!</div>'
          contactForm.reset()
  
          // Clear the success message after 5 seconds
          setTimeout(() => {
            formMessage.innerHTML = ""
          }, 5000)
        } else {
          formMessage.innerHTML = '<div class="alert alert-danger">Please fill in all fields.</div>'
        }
      })
    }
  
    // Animation on scroll (simple version)
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(".skill-card, .portfolio-card, .contact-info, .contact-form")
  
      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const windowHeight = window.innerHeight
  
        if (elementPosition < windowHeight - 100) {
          element.style.opacity = "1"
          element.style.transform = "translateY(0)"
        }
      })
    }
  
    // Set initial styles for animation
    document.querySelectorAll(".skill-card, .portfolio-card, .contact-info, .contact-form").forEach((element) => {
      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"
      element.style.transition = "all 0.5s ease"
    })
  
    // Run animation on load and scroll
    window.addEventListener("load", animateOnScroll)
    window.addEventListener("scroll", animateOnScroll)
  })
  
  