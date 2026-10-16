/**
 * People Network Management LLP (PNM) - Interactive Application Scripts
 * Pure Vanilla JavaScript (No Frameworks)
 * Mobile-First & Touch-Optimized
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. Mobile Drawer Navigation & Accordion
     ========================================================================== */
  const mobileToggle = document.getElementById("mobileToggle");
  const navDrawer = document.getElementById("navDrawer");
  const navOverlay = document.getElementById("navOverlay");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");
  const servicesToggle = document.getElementById("servicesToggle");

  function openMobileDrawer() {
    if (navDrawer && navOverlay && mobileToggle) {
      navDrawer.classList.add("open");
      navOverlay.classList.add("active");
      mobileToggle.classList.add("open");
      mobileToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    }
  }

  function closeMobileDrawer() {
    if (navDrawer && navOverlay && mobileToggle) {
      navDrawer.classList.remove("open");
      navOverlay.classList.remove("active");
      mobileToggle.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navDrawer.classList.contains("open");
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", closeMobileDrawer);
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeMobileDrawer);
  }

  // Handle Mobile Accordion for Services dropdown
  if (servicesToggle) {
    servicesToggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 920) {
        e.preventDefault();
        const parentItem = servicesToggle.closest(".dropdown-parent");
        if (parentItem) {
          parentItem.classList.toggle("dropdown-open");
        }
      }
    });
  }

  // Close mobile drawer when clicking regular navigation links
  const allNavLinks = document.querySelectorAll(".nav-link, .dropdown-link");
  allNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Don't close if it's the accordion toggle on mobile
      if (link.id === "servicesToggle" && window.innerWidth <= 920) return;
      closeMobileDrawer();
    });
  });

  /* ==========================================================================
     2. Interactive Deep-Dive Tabs & Cross-Links
     ========================================================================== */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  function activateTab(targetId) {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === targetId);
    });
    tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === targetId);
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      activateTab(targetId);
    });
  });

  // Support elements with data-tab-switch attributes
  document.querySelectorAll("[data-tab-switch]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      const targetTab = trigger.getAttribute("data-tab-switch");
      if (targetTab) {
        activateTab(targetTab);
        const deepDiveSec = document.getElementById("deep-dive");
        if (deepDiveSec) {
          deepDiveSec.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // Support elements with data-tab-target (from dropdown)
  document.querySelectorAll("[data-tab-target]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      const targetTab = trigger.getAttribute("data-tab-target");
      if (targetTab) {
        activateTab(targetTab);
      }
    });
  });

  /* ==========================================================================
     3. 9-Step Implementation Stepper Interactive Highlighting
     ========================================================================== */
  const stepCards = document.querySelectorAll(".step-card");
  stepCards.forEach((card) => {
    card.addEventListener("click", () => {
      stepCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  /* ==========================================================================
     4. Interactive HR Readiness & Savings Calculator
     ========================================================================== */
  const employeeRange = document.getElementById("employeeRange");
  const employeeBadge = document.getElementById("employeeBadge");
  const hoursSavedVal = document.getElementById("hoursSavedVal");
  const riskReductionVal = document.getElementById("riskReductionVal");
  const solutionTier = document.getElementById("solutionTier");

  const checkPayroll = document.getElementById("checkPayroll");
  const checkCompliance = document.getElementById("checkCompliance");
  const checkHiring = document.getElementById("checkHiring");
  const checkAttendance = document.getElementById("checkAttendance");

  function updateCalculator() {
    if (!employeeRange) return;
    const count = parseInt(employeeRange.value, 10);
    employeeBadge.textContent = `${count} Team`;

    // Dynamic factor based on checkboxes
    let factor = 0.25;
    if (checkPayroll && checkPayroll.checked) factor += 0.2;
    if (checkCompliance && checkCompliance.checked) factor += 0.15;
    if (checkHiring && checkHiring.checked) factor += 0.12;
    if (checkAttendance && checkAttendance.checked) factor += 0.15;

    const savedHours = Math.round(count * factor);
    hoursSavedVal.textContent = `${savedHours}+ Hours / mo`;

    // Compliance Risk Calculation
    if (checkCompliance && checkCompliance.checked) {
      riskReductionVal.textContent = "99.8% Assured";
    } else {
      riskReductionVal.textContent = "96.5% Assured";
    }

    // Solution Recommendation
    if (count < 50) {
      solutionTier.textContent = "Payroll Outsourcing + Statutory Desk";
    } else if (count <= 250) {
      solutionTier.textContent = "Integrated Payroll & HRMS Cloud";
    } else {
      solutionTier.textContent = "Enterprise Payroll Cell + Dedicated SLA";
    }
  }

  if (employeeRange) {
    employeeRange.addEventListener("input", updateCalculator);
    [checkPayroll, checkCompliance, checkHiring, checkAttendance].forEach(
      (box) => {
        if (box) box.addEventListener("change", updateCalculator);
      },
    );
    updateCalculator();
  }

  /* ==========================================================================
     5. Testimonials Carousel / Touch Swipe & Slider
     ========================================================================== */
  const testimonialContainer = document.getElementById("testimonialContainer");
  const testimonialTrack = document.getElementById("testimonialTrack");
  const carouselDots = document.querySelectorAll(".carousel-dot");
  let currentSlide = 0;
  const totalSlides = 3;
  let autoSlideTimer = null;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    if (testimonialTrack) {
      testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    carouselDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  carouselDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-index"), 10);
      goToSlide(idx);
      resetAutoSlide();
    });
  });

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6000);
  }

  function resetAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  if (testimonialTrack) {
    startAutoSlide();
    if (testimonialContainer) {
      testimonialContainer.addEventListener("mouseenter", () =>
        clearInterval(autoSlideTimer),
      );
      testimonialContainer.addEventListener("mouseleave", () =>
        resetAutoSlide(),
      );

      // Touch Swipe Gestures for Mobile Phones
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartY = 0;
      let touchEndY = 0;

      testimonialContainer.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        },
        { passive: true },
      );

      testimonialContainer.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          touchEndY = e.changedTouches[0].screenY;

          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;

          // If predominantly horizontal swipe with at least 35px threshold
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
            if (diffX < 0) {
              // Swiped Left -> Next
              goToSlide(currentSlide + 1);
            } else {
              // Swiped Right -> Prev
              goToSlide(currentSlide - 1);
            }
            resetAutoSlide();
          }
        },
        { passive: true },
      );
    }
  }

  /* ==========================================================================
     6. Industry Items Interactive Filter / Selection
     ========================================================================== */
  const industryItems = document.querySelectorAll(".industry-item");
  industryItems.forEach((item) => {
    item.addEventListener("click", () => {
      industryItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  /* ==========================================================================
     7. Interactive Consultation & Booking Modal
     ========================================================================== */
  const modal = document.getElementById("inquiryModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const openModalBtns = document.querySelectorAll(".open-modal-btn");
  const modalTabs = document.querySelectorAll(".modal-tab-pill");
  const inquiryTypeInput = document.getElementById("inquiryType");
  const modalTitle = document.getElementById("modalTitle");
  const primaryInterestSelect = document.getElementById("primaryInterest");

  const tabTypeMap = {
    consultation: {
      title: "Book an HR Strategy Consultation",
      selectVal: "All 3 Integrated Pillars",
      label: "Book a Consultation",
    },
    payroll: {
      title: "Request a Comprehensive Payroll Review",
      selectVal: "End-to-End Payroll & Compliance",
      label: "Request a Payroll Review",
    },
    demo: {
      title: "Book a Live Payroll Cell HRMS Demo",
      selectVal: "Payroll Cell HRMS Implementation",
      label: "Book a Payroll Cell Demo",
    },
    recruitment: {
      title: "Discuss Your Hiring & Talent Requirements",
      selectVal: "Recruitment & Talent Sourcing",
      label: "Discuss Recruitment",
    },
  };

  function setModalMode(modeKey) {
    const config = tabTypeMap[modeKey] || tabTypeMap["consultation"];
    if (modalTitle) modalTitle.textContent = config.title;
    if (inquiryTypeInput) inquiryTypeInput.value = config.label;
    if (primaryInterestSelect) primaryInterestSelect.value = config.selectVal;

    modalTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-type") === modeKey);
    });
  }

  const modalSuccessView = document.getElementById("modalSuccessView");
  const successDoneBtn = document.getElementById("successDoneBtn");
  const successDetailMsg = document.getElementById("successDetailMsg");
  const summaryName = document.getElementById("summaryName");
  const summaryCompany = document.getElementById("summaryCompany");
  const summaryPillar = document.getElementById("summaryPillar");

  function openModal(modeKey = "consultation") {
    closeMobileDrawer(); // Close mobile drawer if it was open
    setModalMode(modeKey);

    // Reset views
    if (modalSuccessView) modalSuccessView.style.display = "none";
    if (inquiryForm) {
      inquiryForm.style.display = "block";
      inquiryForm.reset();
    }

    if (modal) {
      modal.classList.add("active");
      document.body.classList.add("modal-open");
      const firstInput = modal.querySelector('input:not([type="hidden"])');
      if (firstInput && window.innerWidth > 640) {
        setTimeout(() => firstInput.focus(), 150);
      }
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
      setTimeout(() => {
        if (modalSuccessView) modalSuccessView.style.display = "none";
        if (inquiryForm) {
          inquiryForm.style.display = "block";
          inquiryForm.reset();
        }
      }, 300);
    }
  }

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const mode = btn.getAttribute("data-modal-type") || "consultation";
      openModal(mode);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (successDoneBtn) {
    successDoneBtn.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });

  modalTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const modeKey = tab.getAttribute("data-type");
      setModalMode(modeKey);
    });
  });

  /* ==========================================================================
     8. Form Submission & Toast Notification (POST /admin/user/submit)
     ========================================================================== */
  const inquiryForm = document.getElementById("pnmInquiryForm");
  const submitInquiryBtn = document.getElementById("submitInquiryBtn");
  const toastMsg = document.getElementById("toastMsg");
  const toastText = document.getElementById("toastText");

  // Configurable API base URL: defaults to Hugging Face Spaces production backend
  const API_BASE_URL = window.PNM_API_BASE || "https://yashodeep2006-finewavetech-api.hf.space";

  let toastTimer = null;
  function showToast(message, type = "success") {
    if (!toastMsg) return;
    if (toastText) toastText.textContent = message;

    if (toastTimer) clearTimeout(toastTimer);

    toastMsg.classList.remove("success", "error");
    toastMsg.classList.add("show", type);

    const iconSpan = toastMsg.querySelector("span:first-child");
    if (iconSpan) {
      iconSpan.textContent = type === "error" ? "✕" : "✓";
    }

    toastTimer = setTimeout(() => {
      toastMsg.classList.remove("show");
    }, 5500);
  }

  let isSubmitting = false;

  async function handleInquirySubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSubmitting) return;

    const fullNameInput = document.getElementById("fullName");
    const workEmailInput = document.getElementById("workEmail");
    const phoneNumberInput = document.getElementById("phoneNumber");
    const companyNameInput = document.getElementById("companyName");
    const employeeCountInput = document.getElementById("employeeCount");
    const primaryInterestInput = document.getElementById("primaryInterest");
    const projectMessageInput = document.getElementById("projectMessage");

    const fullName = (fullNameInput?.value || "").trim();
    const workEmail = (workEmailInput?.value || "").trim();
    const phoneNumber = (phoneNumberInput?.value || "").trim();
    const companyName = (companyNameInput?.value || "").trim();
    const employeeCount = (employeeCountInput?.value || "").trim();
    const primaryInterest = (
      primaryInterestInput?.value ||
      inquiryTypeInput?.value ||
      "General Consultation"
    ).trim();
    const projectMessage = (projectMessageInput?.value || "").trim();

    // Client-side validation with instant visual feedback
    if (fullName.length < 2) {
      showToast("Please enter your full name (at least 2 letters).", "error");
      fullNameInput?.focus();
      return;
    }

    if (!workEmail || !workEmail.includes("@") || !workEmail.includes(".")) {
      showToast("Please enter a valid corporate email address.", "error");
      workEmailInput?.focus();
      return;
    }

    if (!phoneNumber || phoneNumber.length < 6) {
      showToast("Please enter a valid contact phone number.", "error");
      phoneNumberInput?.focus();
      return;
    }

    if (companyName.length < 2) {
      showToast("Please enter your company or organization name.", "error");
      companyNameInput?.focus();
      return;
    }

    isSubmitting = true;

    // Set loading state on button with tactile mobile response
    const btnSpan = submitInquiryBtn ? submitInquiryBtn.querySelector(".btn-text") : null;
    const originalBtnText = btnSpan ? btnSpan.textContent : "Submit Request to PNM Team →";

    if (submitInquiryBtn) {
      submitInquiryBtn.disabled = true;
      submitInquiryBtn.style.opacity = "0.75";
      submitInquiryBtn.style.cursor = "not-allowed";
      if (btnSpan) {
        btnSpan.textContent = "Submitting Request... ⏳";
      } else {
        submitInquiryBtn.textContent = "Submitting Request... ⏳";
      }
    }

    const payload = {
      id: null,
      full_name: fullName,
      corporate_email: workEmail,
      phone_number: phoneNumber,
      company_name: companyName,
      employee_count: employeeCount || null,
      primary_interest: primaryInterest || null,
      specific_requirements: projectMessage || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/user/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = `Submission failed (${response.status} ${response.statusText})`;
        if (data && data.detail) {
          if (typeof data.detail === "string") {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
          }
        }
        throw new Error(errorMsg);
      }

      // Success! Switch to in-modal confirmation view
      if (inquiryForm) inquiryForm.style.display = "none";
      if (modalSuccessView) {
        modalSuccessView.style.display = "block";
        if (successDetailMsg) {
          successDetailMsg.textContent =
            data.message ||
            `Thank you, ${fullName}! Your inquiry for "${primaryInterest}" has been successfully received. Our specialist will contact you shortly.`;
        }
        if (summaryName) summaryName.textContent = fullName;
        if (summaryCompany) summaryCompany.textContent = companyName;
        if (summaryPillar) summaryPillar.textContent = primaryInterest;

        // Scroll modal body smoothly to the top to display the confirmation card
        const modalBody = modal ? modal.querySelector(".modal-body") : null;
        if (modalBody) modalBody.scrollTop = 0;
      }

      showToast(`Thank you, ${fullName}! Your inquiry was received.`, "success");
      if (inquiryForm) inquiryForm.reset();
    } catch (err) {
      console.error("Form submission error:", err);
      showToast(
        err.message || "Failed to submit request. Please check your network connection.",
        "error"
      );
    } finally {
      isSubmitting = false;
      if (submitInquiryBtn) {
        submitInquiryBtn.disabled = false;
        submitInquiryBtn.style.opacity = "1";
        submitInquiryBtn.style.cursor = "pointer";
        if (btnSpan) {
          btnSpan.textContent = originalBtnText;
        } else {
          submitInquiryBtn.textContent = originalBtnText;
        }
      }
    }
  }

  if (inquiryForm) {
    inquiryForm.addEventListener("submit", handleInquirySubmit);
  }

  if (submitInquiryBtn) {
    // Listen to click and touchend to guarantee instant responsiveness on mobile devices
    submitInquiryBtn.addEventListener("click", handleInquirySubmit);
    submitInquiryBtn.addEventListener(
      "touchend",
      (e) => {
        if (!isSubmitting) {
          handleInquirySubmit(e);
        }
      },
      { passive: false }
    );
  }

  /* ==========================================================================
     9. Back to Top Button & Scrollspy
     ========================================================================== */
  const backToTopBtn = document.getElementById("backToTop");
  const mainHeader = document.getElementById("mainHeader");

  window.addEventListener(
    "scroll",
    () => {
      const scrollPos = window.scrollY;

      // Back to top visibility
      if (backToTopBtn) {
        if (scrollPos > 350) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      }

      // Header subtle shadow enhancement
      if (mainHeader) {
        if (scrollPos > 20) {
          mainHeader.style.boxShadow = "0 4px 20px rgba(18, 61, 125, 0.1)";
        } else {
          mainHeader.style.boxShadow = "0 2px 14px rgba(18, 61, 125, 0.06)";
        }
      }
    },
    { passive: true },
  );

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
