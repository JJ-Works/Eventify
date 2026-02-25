document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  function showMessage(type, text) {
    if (!authMessage) return;
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = ""; // Clear inline style to let CSS take over
    // Auto-hide after 5 seconds if it's an error
    if (type === "error") {
      setTimeout(() => {
        authMessage.style.display = "none";
      }, 5000);
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const btn = e.target.querySelector("button");
      const originalText = btn.textContent;

      try {
        btn.textContent = "Loading...";
        btn.disabled = true;
        if (authMessage) authMessage.style.display = "none"; // Clear previous

        const user = await API.login(email, password);
        Auth.setUser(user);
        window.location.href = "../index.html";
      } catch (error) {
        showMessage("error", error.message);
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const interests = document.getElementById("interests").value;
      const btn = e.target.querySelector("button");
      const originalText = btn.textContent; // Store original text

      // Validate name is not purely numeric
      if (/^\d+$/.test(name.trim())) {
        showMessage("error", "Name cannot be only numbers");
        return;
      }

      // Validate email doesn't start with a number
      if (/^\d/.test(email.trim())) {
        showMessage("error", "Email cannot start with a number");
        return;
      }

      try {
        btn.textContent = "Creating Account...";
        btn.disabled = true;
        if (authMessage) authMessage.style.display = "none"; // Clear previous

        const user = await API.register(name, email, password, interests);

        showMessage(
          "success",
          "Account created successfully! Redirecting to login...",
        );

        // Delay redirect so user can see the message
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        showMessage("error", error.message);
        btn.textContent = originalText; // Restore button text on error
        btn.disabled = false;
      }
      // Note: We don't restore button in finally block for success case
      // because we want to keep it disabled while redirecting.
      // But we must restore it if error.
    });
  }
});
