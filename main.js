document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");

  // Simple toggle
  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");

    if (nav.style.display === "block") {
      nav.style.display = "none";
    } else {
      nav.style.display = "block";
    }
  });

  // Close when clicking links
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function () {
      hamburger.classList.remove("active");
      nav.style.display = "none";
    });
  });
});

document.querySelectorAll(".coppy").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();

    const link = element.getAttribute("href");
    navigator.clipboard.writeText(link).then(() => {
      element.classList.add("active");

      setTimeout(() => {
        element.classList.remove("active");
      }, 800);
    });
  });
});

// Add event listener when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const detailsElement = document.querySelector(".liveClassesFilter details");
  const summaryElement = document.querySelector(".liveClassesFilter summary");
  const formElement = document.querySelector(".liveClassesFilter form");

  // Position the form absolutely for pop-up effect
  formElement.style.position = "absolute";
  formElement.style.top = "100%";
  formElement.style.left = "0";
  formElement.style.width = "18rem";
  formElement.style.zIndex = "1000";
  formElement.style.display = "none";
  formElement.style.border = "1px solid #ffffff";
  formElement.style.borderTop = "none";

  // Track if details is open
  let isOpen = false;

  // Toggle the dropdown
  summaryElement.addEventListener("click", function (e) {
    e.preventDefault();
    isOpen = !isOpen;

    if (isOpen) {
      formElement.style.display = "block";
      detailsElement.setAttribute("open", "");
    } else {
      formElement.style.display = "none";
      detailsElement.removeAttribute("open");
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!detailsElement.contains(e.target) && isOpen) {
      formElement.style.display = "none";
      detailsElement.removeAttribute("open");
      isOpen = false;
    }
  });

  // Prevent closing when clicking inside the form
  formElement.addEventListener("click", function (e) {
    e.stopPropagation();
  });
});

// Mobile Carousel functionality
function initMobileCarousel() {
  // Check if we're on mobile
  const isMobile = window.innerWidth <= 1023;

  if (!isMobile) {
    // If not mobile, ensure desktop view is shown
    if (document.querySelector(".carousel-container")) {
      document.querySelector(".carousel-container").remove();
    }
    document.querySelector(".liveClassesSchedule").style.display = "flex";
    document.querySelector(".weekDays").style.display = "flex";

    // Restore original arrow functionality (month navigation)
    restoreMonthNavigation();
    return;
  }

  // If already initialized, don't create again
  if (document.querySelector(".carousel-container")) {
    return;
  }

  // Hide desktop schedule
  document.querySelector(".liveClassesSchedule").style.display = "none";
  document.querySelector(".weekDays").style.display = "none";

  // Extract day information from weekDays
  const dayElements = document.querySelectorAll(".weekDays .day");
  const days = Array.from(dayElements).map((day) => {
    return {
      name: day.querySelector("p:first-child").textContent,
      date: day.querySelector("p:last-child").textContent,
      isGray: day.querySelector(".gray") !== null,
      isGreen: day.querySelector(".green") !== null,
    };
  });

  // Extract class data from schedule
  const classSections = document.querySelectorAll(".liveClassesSchedule > div");
  const classesByDay = [[], [], [], [], [], [], []];

  classSections.forEach((section, sectionIndex) => {
    const cards = section.querySelectorAll(".liveClassesCard");
    cards.forEach((card, cardIndex) => {
      // Calculate day index based on section type
      let dayIndex = 0;

      if (section.classList.contains("liveClassesSectionOne")) {
        dayIndex = cardIndex;
      } else if (section.classList.contains("liveClassesSectionTwo")) {
        dayIndex = cardIndex + 1; // Skip first empty cell
      } else if (section.classList.contains("liveClassesSectionThree")) {
        dayIndex = cardIndex + 2; // Skip first two empty cells
      } else if (section.classList.contains("liveClassesSectionFour")) {
        dayIndex = cardIndex + 2; // Skip first two empty cells
      }

      // Only add if dayIndex is valid (0-6)
      if (dayIndex >= 0 && dayIndex <= 6) {
        const classData = {
          time: card.querySelector(".up p:first-child")?.textContent || "",
          className: card.querySelector(".up p:last-child")?.textContent || "",
          staff: card.querySelector(".middle p:first-child")?.textContent || "",
          duration:
            card.querySelector(".middle p:last-child")?.textContent || "",
          spots: card.querySelector(".down p")?.textContent || "",
          isAvailable: !card.querySelector(".down button").disabled,
          buttonClass: card.querySelector(".down button").className,
          buttonText: card.querySelector(".down button").textContent,
          originalCard: card.cloneNode(true),
        };

        classesByDay[dayIndex].push(classData);
      }
    });
  });

  // Create carousel container
  const carouselContainer = document.createElement("div");
  carouselContainer.className = "carousel-container";

  // Create mobile day header
  const dayHeader = document.createElement("div");
  dayHeader.className = "mobile-day-header";
  dayHeader.innerHTML = `
        <span class="day-name">${days[3].name}</span>
        <span class="date ${days[3].isGray ? "gray" : ""} ${
    days[3].isGreen ? "green" : ""
  }">${days[3].date}</span>
    `;

  // Create cards container
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "carousel-cards";

  // Create day indicator dots
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-day-indicator";

  days.forEach((day, index) => {
    const dot = document.createElement("span");
    dot.className = `carousel-day-dot ${index === 3 ? "active" : ""}`;
    dot.dataset.dayIndex = index;
    dot.title = `${day.name} ${day.date}`; // Tooltip
    dotsContainer.appendChild(dot);
  });

  // Assemble carousel
  carouselContainer.appendChild(dayHeader);
  carouselContainer.appendChild(cardsContainer);
  carouselContainer.appendChild(dotsContainer);

  // Insert after calendar section
  document
    .querySelector(".calendar")
    .insertAdjacentElement("afterend", carouselContainer);

  // Store data for reuse
  carouselContainer._data = {
    days: days,
    classesByDay: classesByDay,
    currentDayIndex: 3, // Start with December 31st (index 3)
  };

  // Initial render
  renderDayCards(3);

  // Repurpose the calendar arrows for day navigation
  setupDayNavigation();

  // Add click handlers for dots
  dotsContainer.querySelectorAll(".carousel-day-dot").forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const dayIndex = parseInt(e.target.dataset.dayIndex);
      navigateToDay(dayIndex - carouselContainer._data.currentDayIndex);
    });
  });

  // Helper functions
  function renderDayCards(dayIndex) {
    const data = carouselContainer._data;
    const dayClasses = data.classesByDay[dayIndex];
    const dayInfo = data.days[dayIndex];

    // Update header
    dayHeader.innerHTML = `
            <span class="day-name">${dayInfo.name}</span>
            <span class="date ${dayInfo.isGray ? "gray" : ""} ${
      dayInfo.isGreen ? "green" : ""
    }">${dayInfo.date}</span>
            <span class="class-count">(${dayClasses.length} classes)</span>
        `;

    // Clear existing cards
    cardsContainer.innerHTML = "";

    // Add cards for this day
    dayClasses.forEach((classData) => {
      const card = document.createElement("div");
      card.className = "carousel-card";
      card.innerHTML = `
                <div class="up">
                    <p>${classData.time}</p>
                    <p>${classData.className}</p>
                </div>
                <div class="middle">
                    <p>${classData.staff}</p>
                    <p>${classData.duration}</p>
                </div>
                <div class="down">
                    <p>${classData.spots}</p>
                    <button class="${classData.buttonClass}" ${
        !classData.isAvailable ? "disabled" : ""
      }>
                        ${classData.buttonText}
                    </button>
                </div>
            `;
      cardsContainer.appendChild(card);
    });

    // Update active dot
    dotsContainer
      .querySelectorAll(".carousel-day-dot")
      .forEach((dot, index) => {
        dot.classList.toggle("active", index === dayIndex);
      });

    // Update current index
    data.currentDayIndex = dayIndex;

    // Show count for December 31st (date "31")
    if (dayInfo.date === "31") {
      console.log(`December 31st has ${dayClasses.length} classes`);
      // You could also display this somewhere on the page
      const countDisplay = document.createElement("div");

      countDisplay.style.textAlign = "center";
      countDisplay.style.color = "#05e00b";

      // Remove previous count display if exists
      const prevDisplay = dayHeader.querySelector(".day-count-display");
      if (prevDisplay) prevDisplay.remove();

      dayHeader.appendChild(countDisplay);
    }
  }

  function navigateToDay(direction) {
    const data = carouselContainer._data;
    let newIndex = data.currentDayIndex + direction;

    // Loop around if at edges
    if (newIndex < 0) newIndex = data.days.length - 1;
    if (newIndex >= data.days.length) newIndex = 0;

    renderDayCards(newIndex);
  }

  function setupDayNavigation() {
    // Get the calendar arrows
    const leftArrow = document.querySelector(".calendar .date img:first-child");
    const rightArrow = document.querySelector(".calendar .date img:last-child");

    // Store original click handlers to restore later
    leftArrow._originalOnClick = leftArrow.onclick;
    rightArrow._originalOnClick = rightArrow.onclick;

    // Update arrows to navigate days in carousel
    leftArrow.style.cursor = "pointer";
    rightArrow.style.cursor = "pointer";

    // Clear any existing event listeners
    leftArrow.replaceWith(leftArrow.cloneNode(true));
    rightArrow.replaceWith(rightArrow.cloneNode(true));

    // Get fresh references
    const newLeftArrow = document.querySelector(
      ".calendar .date img:first-child"
    );
    const newRightArrow = document.querySelector(
      ".calendar .date img:last-child"
    );

    // Add day navigation event listeners
    newLeftArrow.addEventListener("click", () => {
      navigateToDay(-1); // Previous day
    });

    newRightArrow.addEventListener("click", () => {
      navigateToDay(1); // Next day
    });
  }
}

function restoreMonthNavigation() {
  const leftArrow = document.querySelector(".calendar .date img:first-child");
  const rightArrow = document.querySelector(".calendar .date img:last-child");

  // Restore original functionality if it exists
  if (leftArrow._originalOnClick) {
    leftArrow.onclick = leftArrow._originalOnClick;
  }

  if (rightArrow._originalOnClick) {
    rightArrow.onclick = rightArrow._originalOnClick;
  }

  // Reset cursor style
  if (leftArrow) leftArrow.style.cursor = "pointer";
  if (rightArrow) rightArrow.style.cursor = "pointer";
}

// Filter functionality
function initFilters() {
  const filterCheckboxes = document.querySelectorAll(
    '.liveClassesFilter input[type="checkbox"]'
  );
  const summaryElement = document.querySelector(".liveClassesFilter summary");

  // Update summary text when checkboxes change
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateFilterSummary);
  });

  // Toggle dropdown functionality
  const detailsElement = document.querySelector(".liveClassesFilter details");
  detailsElement.addEventListener("click", (e) => {
    e.preventDefault();
    const form = detailsElement.querySelector("form");
    form.style.display = form.style.display === "block" ? "none" : "block";
  });

  function updateFilterSummary() {
    const checked = Array.from(filterCheckboxes).filter((cb) => cb.checked);

    if (checked.length === 0) {
      summaryElement.textContent = "Service (All)";
    } else if (checked.length === 1) {
      summaryElement.textContent = checked[0].parentElement.textContent.trim();
    } else {
      summaryElement.textContent = `Service (${checked.length} selected)`;
    }
  }

  // Initial update
  updateFilterSummary();
}

// Navigation arrows for calendar (desktop version)
function initCalendarNavigation() {
  const leftArrow = document.querySelector(".calendar .date img:first-child");
  const rightArrow = document.querySelector(".calendar .date img:last-child");
  const dateText = document.querySelector(".calendar .date p");

  // Store original handlers
  leftArrow._originalOnClick = () => {
    console.log("Navigate to previous month");
    // Implement actual month navigation here
    // Example: update dateText.textContent based on current month
  };

  rightArrow._originalOnClick = () => {
    console.log("Navigate to next month");
    // Implement actual month navigation here
  };

  // Set original handlers (will be overridden on mobile)
  leftArrow.onclick = leftArrow._originalOnClick;
  rightArrow.onclick = rightArrow._originalOnClick;
}

// Responsive handling
function handleResponsive() {
  initMobileCarousel();

  // Listen for window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initMobileCarousel, 250);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initCalendarNavigation();
  handleResponsive();
});

// Export for manual control if needed
window.LiveClassesManager = {
  refreshCarousel: initMobileCarousel,
  showDay: function (dayIndex) {
    const carousel = document.querySelector(".carousel-container");
    if (carousel && carousel._data) {
      const data = carousel._data;
      if (dayIndex >= 0 && dayIndex < data.days.length) {
        // Find and trigger navigation to this day
        const dots = document.querySelectorAll(".carousel-day-dot");
        if (dots[dayIndex]) {
          dots[dayIndex].click();
        }
      }
    }
  },
  getDecember31Count: function () {
    const carousel = document.querySelector(".carousel-container");
    if (carousel && carousel._data) {
      const dec31Index = 3; // Based on your HTML structure
      const dec31Classes = carousel._data.classesByDay[dec31Index];
      return dec31Classes ? dec31Classes.length : 0;
    }
    return 0;
  },
  navigateToPreviousDay: function () {
    const carousel = document.querySelector(".carousel-container");
    if (carousel && carousel._data) {
      const leftArrow = document.querySelector(
        ".calendar .date img:first-child"
      );
      if (leftArrow) leftArrow.click();
    }
  },
  navigateToNextDay: function () {
    const carousel = document.querySelector(".carousel-container");
    if (carousel && carousel._data) {
      const rightArrow = document.querySelector(
        ".calendar .date img:last-child"
      );
      if (rightArrow) rightArrow.click();
    }
  },
};

// Mobile Carousel functionality
function initMobileCarousel() {
  // Check if we're on mobile
  const isMobile = window.innerWidth <= 1023;

  if (!isMobile) {
    // If not mobile, ensure desktop view is shown
    if (document.querySelector(".carousel-container")) {
      document.querySelector(".carousel-container").remove();
    }
    document.querySelector(".liveClassesSchedule").style.display = "flex";
    document.querySelector(".weekDays").style.display = "flex";
    return;
  }

  // If already initialized, don't create again
  if (document.querySelector(".carousel-container")) {
    return;
  }

  // Hide desktop schedule
  document.querySelector(".liveClassesSchedule").style.display = "none";
  document.querySelector(".weekDays").style.display = "none";

  // Extract day information from weekDays
  const dayElements = document.querySelectorAll(".weekDays .day");
  const days = Array.from(dayElements).map((day) => {
    return {
      name: day.querySelector("p:first-child").textContent,
      date: day.querySelector("p:last-child").textContent,
      isGray: day.querySelector(".gray") !== null,
      isGreen: day.querySelector(".green") !== null,
    };
  });

  // Extract class data from schedule
  const classSections = document.querySelectorAll(".liveClassesSchedule > div");
  const classesByDay = [[], [], [], [], [], [], []];

  classSections.forEach((section, sectionIndex) => {
    const cards = section.querySelectorAll(".liveClassesCard");
    cards.forEach((card, cardIndex) => {
      // Calculate day index based on section type
      let dayIndex = 0;

      if (section.classList.contains("liveClassesSectionOne")) {
        dayIndex = cardIndex;
      } else if (section.classList.contains("liveClassesSectionTwo")) {
        dayIndex = cardIndex + 1;
      } else if (section.classList.contains("liveClassesSectionThree")) {
        dayIndex = cardIndex + 2;
      } else if (section.classList.contains("liveClassesSectionFour")) {
        dayIndex = cardIndex + 2;
      }

      // Only add if dayIndex is valid (0-6)
      if (dayIndex >= 0 && dayIndex <= 6) {
        const className =
          card.querySelector(".up p:last-child")?.textContent || "";
        const classData = {
          time: card.querySelector(".up p:first-child")?.textContent || "",
          className: className,
          serviceType: className, // Store for filtering
          staff: card.querySelector(".middle p:first-child")?.textContent || "",
          duration:
            card.querySelector(".middle p:last-child")?.textContent || "",
          spots: card.querySelector(".down p")?.textContent || "",
          isAvailable: !card.querySelector(".down button").disabled,
          buttonClass: card.querySelector(".down button").className,
          buttonText: card.querySelector(".down button").textContent,
          originalCard: card.cloneNode(true),
          dayIndex: dayIndex,
        };

        classesByDay[dayIndex].push(classData);
      }
    });
  });

  // Store original data globally for filtering
  window.originalClassesByDay = classesByDay;
  window.originalDaysData = days;

  // Create carousel container
  const carouselContainer = document.createElement("div");
  carouselContainer.className = "carousel-container";

  // Create mobile day header
  const dayHeader = document.createElement("div");
  dayHeader.className = "mobile-day-header";

  // Create cards container
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "carousel-cards";

  // Create day indicator dots
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-day-indicator";

  days.forEach((day, index) => {
    const dot = document.createElement("span");
    dot.className = `carousel-day-dot ${index === 3 ? "active" : ""}`;
    dot.dataset.dayIndex = index;
    dot.title = `${day.name} ${day.date}`;
    dotsContainer.appendChild(dot);
  });

  // Assemble carousel
  carouselContainer.appendChild(dayHeader);
  carouselContainer.appendChild(cardsContainer);
  carouselContainer.appendChild(dotsContainer);

  // Insert after calendar section
  document
    .querySelector(".calendar")
    .insertAdjacentElement("afterend", carouselContainer);

  // Store data for reuse
  carouselContainer._data = {
    days: days,
    classesByDay: classesByDay,
    currentDayIndex: 3,
    filteredClassesByDay: [...classesByDay],
  };

  // Initial render
  renderDayCards(3);

  // Setup day navigation
  setupDayNavigation();

  // Add click handlers for dots
  dotsContainer.querySelectorAll(".carousel-day-dot").forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const dayIndex = parseInt(e.target.dataset.dayIndex);
      if (carouselContainer._data) {
        navigateToDay(dayIndex - carouselContainer._data.currentDayIndex);
      }
    });
  });

  // Helper functions
  function renderDayCards(dayIndex) {
    const data = carouselContainer._data;
    const dayClasses = data.filteredClassesByDay[dayIndex] || [];
    const dayInfo = data.days[dayIndex];

    // Update header
    dayHeader.innerHTML = `
      <span class="day-name">${dayInfo.name}</span>
      <span class="date ${dayInfo.isGray ? "gray" : ""} ${
      dayInfo.isGreen ? "green" : ""
    }">
        ${dayInfo.date}
      </span>
      <span class="class-count">(${dayClasses.length} classes)</span>
    `;

    // Clear existing cards
    cardsContainer.innerHTML = "";

    // Add cards for this day
    if (dayClasses.length === 0) {
      const noClassesMsg = document.createElement("div");
      noClassesMsg.className = "no-classes-message";
      noClassesMsg.textContent = "No classes available for this day";
      cardsContainer.appendChild(noClassesMsg);
    } else {
      dayClasses.forEach((classData) => {
        const card = document.createElement("div");
        card.className = "carousel-card";
        card.innerHTML = `
          <div class="up">
            <p>${classData.time}</p>
            <p>${classData.className}</p>
          </div>
          <div class="middle">
            <p>${classData.staff}</p>
            <p>${classData.duration}</p>
          </div>
          <div class="down">
            <p>${classData.spots}</p>
            <button class="${classData.buttonClass}" ${
          !classData.isAvailable ? "disabled" : ""
        }>
              ${classData.buttonText}
            </button>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }

    // Update active dot
    dotsContainer
      .querySelectorAll(".carousel-day-dot")
      .forEach((dot, index) => {
        dot.classList.toggle("active", index === dayIndex);
      });

    // Update current index
    data.currentDayIndex = dayIndex;
  }

  function navigateToDay(direction) {
    const data = carouselContainer._data;
    let newIndex = data.currentDayIndex + direction;

    // Loop around if at edges
    if (newIndex < 0) newIndex = data.days.length - 1;
    if (newIndex >= data.days.length) newIndex = 0;

    renderDayCards(newIndex);
  }

  function setupDayNavigation() {
    const leftArrow = document.querySelector(".calendar .date img:first-child");
    const rightArrow = document.querySelector(".calendar .date img:last-child");

    if (!leftArrow || !rightArrow) return;

    // Clear existing event listeners
    const newLeftArrow = leftArrow.cloneNode(true);
    const newRightArrow = rightArrow.cloneNode(true);
    leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
    rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);

    // Add day navigation event listeners
    newLeftArrow.addEventListener("click", () => navigateToDay(-1));
    newRightArrow.addEventListener("click", () => navigateToDay(1));
  }
}

// Filter functionality
function applyFilters() {
  const filterCheckboxes = document.querySelectorAll(
    '.liveClassesFilter input[type="checkbox"]'
  );
  const modalCheckboxes = document.querySelectorAll(
    '.filter-modal-content input[type="checkbox"]'
  );

  // Get checked service types from either desktop or modal
  let selectedServices = [];

  // Try desktop checkboxes first
  if (filterCheckboxes.length > 0) {
    selectedServices = Array.from(filterCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
  }

  // If no desktop checkboxes found, try modal checkboxes
  if (selectedServices.length === 0 && modalCheckboxes.length > 0) {
    selectedServices = Array.from(modalCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
  }

  // Check if we're on mobile (carousel exists)
  const carouselContainer = document.querySelector(".carousel-container");
  const isMobile = carouselContainer !== null;

  if (isMobile) {
    // Mobile filtering
    if (carouselContainer._data) {
      const data = carouselContainer._data;

      if (selectedServices.length === 0) {
        // Show all classes if no filters selected
        data.filteredClassesByDay = [...data.classesByDay];
      } else {
        // Filter classes by selected services
        data.filteredClassesByDay = data.classesByDay.map((dayClasses) =>
          dayClasses.filter((classData) =>
            selectedServices.includes(classData.serviceType)
          )
        );
      }

      // Re-render current day
      renderDayCards(data.currentDayIndex);

      // Update day indicator dots
      updateDayIndicators(data.filteredClassesByDay);
    }
  } else {
    // Desktop filtering
    const allClassCards = document.querySelectorAll(".liveClassesCard");
    const weekDays = document.querySelectorAll(".weekDays .day");

    // First, show all cards
    allClassCards.forEach((card) => {
      card.style.display = "flex";
    });

    if (selectedServices.length > 0) {
      // Hide cards that don't match selected services
      allClassCards.forEach((card) => {
        const className = card.querySelector(".up p:last-child").textContent;
        if (!selectedServices.includes(className)) {
          card.style.display = "none";
        }
      });
    }

    // Update day indicators on desktop
    updateDesktopDayIndicators(selectedServices);
  }

  // Update filter summary text
  updateFilterSummary(selectedServices);
}

function clearFilters() {
  // Uncheck all filter checkboxes
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Apply filters (which will show all classes since nothing is checked)
  applyFilters();
}

function updateFilterSummary(selectedServices) {
  const summaryElement = document.querySelector(".liveClassesFilter summary");
  const filterCheckboxes = document.querySelectorAll(
    '.liveClassesFilter input[type="checkbox"]'
  );

  if (!summaryElement) return;

  if (selectedServices.length === 0) {
    summaryElement.textContent = "Service (All)";
  } else if (selectedServices.length === filterCheckboxes.length) {
    summaryElement.textContent = "Service (All)";
  } else if (selectedServices.length === 1) {
    summaryElement.textContent = selectedServices[0];
  } else {
    summaryElement.textContent = `Service (${selectedServices.length} selected)`;
  }
}

function updateDayIndicators(filteredClassesByDay) {
  const dots = document.querySelectorAll(".carousel-day-dot");
  dots.forEach((dot, index) => {
    const hasClasses =
      filteredClassesByDay[index] && filteredClassesByDay[index].length > 0;

    if (hasClasses) {
      dot.classList.add("has-classes");
    } else {
      dot.classList.remove("has-classes");
    }
  });
}

function updateDesktopDayIndicators(selectedServices) {
  const days = document.querySelectorAll(".weekDays .day");

  if (selectedServices.length === 0) {
    // Reset all days
    days.forEach((day) => {
      day.classList.remove("has-filtered-classes");
      day.classList.remove("no-classes");
    });
    return;
  }

  // For each day, check if there are matching classes
  days.forEach((day, dayIndex) => {
    // Get all class cards for this day
    const allCards = document.querySelectorAll(".liveClassesCard");
    let hasMatchingClass = false;

    // Check each card to see if it belongs to this day and matches filter
    allCards.forEach((card) => {
      // We need to determine which day this card belongs to
      // This is complex in desktop view, so we'll use a simpler approach
      // Let's just check if the card is visible and matches filter
      if (card.style.display !== "none") {
        const cardRect = card.getBoundingClientRect();
        const dayRect = day.getBoundingClientRect();

        // Simple check: if card is roughly under this day column
        if (Math.abs(cardRect.left - dayRect.left) < 50) {
          hasMatchingClass = true;
        }
      }
    });

    if (hasMatchingClass) {
      day.classList.add("has-filtered-classes");
      day.classList.remove("no-classes");
    } else {
      day.classList.remove("has-filtered-classes");
      day.classList.add("no-classes");
    }
  });
}

// Initialize filter system
function initFilterSystem() {
  // Add event listeners to filter buttons
  const applyBtn = document.querySelector(".apply-filter-btn");
  const clearBtn = document.querySelector(".clear-filter-btn");

  if (applyBtn) {
    applyBtn.addEventListener("click", applyFilters);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearFilters);
  }

  // Update filter dropdown behavior
  const detailsElement = document.querySelector(".liveClassesFilter details");
  if (detailsElement) {
    const summaryElement = detailsElement.querySelector("summary");
    const formElement = detailsElement.querySelector("form");

    // Toggle the dropdown
    summaryElement.addEventListener("click", function (e) {
      e.preventDefault();
      detailsElement.toggleAttribute("open");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!detailsElement.contains(e.target)) {
        detailsElement.removeAttribute("open");
      }
    });

    // Prevent closing when clicking inside the form
    formElement.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Hamburger menu functionality
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("header nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      this.classList.toggle("active");
      nav.classList.toggle("active");
    });

    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        nav.classList.remove("active");
      });
    });

    document.addEventListener("click", function (event) {
      const isClickInside =
        hamburger.contains(event.target) || nav.contains(event.target);
      if (!isClickInside && window.innerWidth <= 767) {
        hamburger.classList.remove("active");
        nav.classList.remove("active");
      }
    });
  }

  // Copy link functionality
  document.querySelectorAll(".coppy").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const link = element.getAttribute("href");
      navigator.clipboard.writeText(link).then(() => {
        element.classList.add("active");
        setTimeout(() => {
          element.classList.remove("active");
        }, 800);
      });
    });
  });

  // Initialize systems
  initFilterSystem();
  initMobileCarousel();

  // Listen for window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initMobileCarousel, 250);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const currentLocation = window.location.pathname;
  const currentPage = currentLocation.split("/").pop();

  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href");

    // Skip anchor links
    if (linkHref && linkHref.startsWith("#")) {
      return;
    }

    // Skip the "Get Started" link - it should always remain active
    if (linkHref && linkHref.includes("getStarted.html")) {
      link.classList.add("active");
      link.style.color = "#05e00b";
      return; // Skip further processing for this link
    }

    const linkPage = linkHref.split("/").pop();

    // Remove active class and reset color
    link.classList.remove("active");
    link.style.color = "";

    // If this link's page matches the current page, set it as active and green
    if (linkPage === currentPage) {
      link.classList.add("active");
      link.style.color = "#05e00b";
      link.style.fontWeight = "300";
    }
  });
});
