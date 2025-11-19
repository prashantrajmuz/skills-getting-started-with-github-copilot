document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "activity-participants";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants";
        participantsSection.appendChild(participantsTitle);

        if (details.participants && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.style.listStyleType = "none";
          ul.style.paddingLeft = "0";
          details.participants.forEach((participant) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";

            const span = document.createElement("span");
            span.textContent = participant;
            span.style.flex = "1";

            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "&#128465;"; // Trash can emoji
            deleteBtn.title = "Remove participant";
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.style.marginLeft = "8px";
            deleteBtn.style.background = "none";
            deleteBtn.style.border = "none";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.color = "#c62828";
            deleteBtn.style.fontSize = "1.1em";

            deleteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (!confirm(`Remove ${participant} from ${name}?`)) return;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(participant)}`, {
                  method: "POST",
                });
                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message || "Participant removed.";
                  messageDiv.className = "success";
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "Failed to remove participant.";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
              } catch (error) {
                messageDiv.textContent = "Error removing participant.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
                console.error("Error unregistering participant:", error);
              }
            });

            li.appendChild(span);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          const noParticipants = document.createElement("div");
          noParticipants.textContent = "No participants yet.";
          noParticipants.style.color = "#888";
          participantsSection.appendChild(noParticipants);
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so UI updates immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
