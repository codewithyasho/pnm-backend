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
     8. Form Submission & Toast Notification (POST /admin/sse/user/submit)
     ========================================================================== */
  const inquiryForm = document.getElementById("pnmInquiryForm");
  const submitInquiryBtn = document.getElementById("submitInquiryBtn");
  const toastMsg = document.getElementById("toastMsg");
  const toastText = document.getElementById("toastText");

  // Configurable API base URL: defaults to local backend when on localhost/127.0.0.1/file, or Hugging Face Spaces production
  const API_BASE_URL =
    window.PNM_API_BASE ||
    localStorage.getItem("pnm_api_base") ||
    (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
      ? "http://127.0.0.1:8000"
      : "https://yashodeep2006-finewavetech-api.hf.space");

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
      const response = await fetch(`${API_BASE_URL}/admin/sse/user/submit`, {
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

  /* ==========================================================================
     10. Real-Time Visitor Live Support Chat Widget (WebSocket & SQLite History)
     ========================================================================== */
  const chatWidget = document.getElementById("pnmChatWidget");
  const chatLauncher = document.getElementById("pnmChatLauncher");
  const chatWindow = document.getElementById("pnmChatWindow");
  const chatMinimizeBtn = document.getElementById("pnmChatMinimizeBtn");
  const chatBadge = document.getElementById("pnmChatBadge");
  const chatStatus = document.getElementById("pnmChatStatus");
  const statusText = document.getElementById("pnmStatusText");
  const chatModeBadge = document.getElementById("pnmChatModeBadge");

  // Views
  const chatPreForm = document.getElementById("pnmChatPreForm");
  const preChatFormEl = document.getElementById("pnmPreChatForm");
  const chatNameInput = document.getElementById("pnmChatNameInput");
  const chatEmailInput = document.getElementById("pnmChatEmailInput");

  const chatThreadView = document.getElementById("pnmChatThreadView");
  const chatCurrentUserName = document.getElementById("pnmChatCurrentUserName");
  const chatResetBtn = document.getElementById("pnmChatResetBtn");
  const chatMessagesList = document.getElementById("pnmChatMessages");
  const chatInputForm = document.getElementById("pnmChatInputForm");
  const chatMessageInput = document.getElementById("pnmChatMessageInput");

  let chatSocket = null;
  let chatReconnectTimer = null;
  let isIntentionallyClosed = false;
  let unreadChatCount = 0;
  let currentIsEscalated = false;
  let aiTypingElement = null;
  const renderedMessageIds = new Set();

  // Helper: Persistent UUID Session Token
  function getOrCreateChatToken() {
    let token = localStorage.getItem("pnm_chat_token");
    if (!token) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        token = crypto.randomUUID();
      } else {
        token = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem("pnm_chat_token", token);
    }
    return token;
  }

  function getWsBaseUrl(httpUrl) {
    return httpUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  }

  function formatTime(isoString) {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function setStatusIndicator(isOnline, customText) {
    if (!chatStatus || !statusText) return;
    if (isOnline) {
      chatStatus.classList.remove("disconnected");
      statusText.textContent = customText || "Online • Ready to help";
    } else {
      chatStatus.classList.add("disconnected");
      statusText.textContent = customText || "Connecting...";
    }
  }

  function updateUnreadBadge(count) {
    unreadChatCount = count;
    if (!chatBadge) return;
    if (unreadChatCount > 0) {
      chatBadge.textContent = unreadChatCount > 9 ? "9+" : unreadChatCount.toString();
      chatBadge.style.display = "flex";
    } else {
      chatBadge.style.display = "none";
    }
  }

  function scrollMessagesToBottom(smooth = true) {
    if (!chatMessagesList) return;
    chatMessagesList.scrollTo({
      top: chatMessagesList.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  // Update Header Mode Badge (AI vs Human Support)
  function updateHeaderModeBadge(isEscalated) {
    currentIsEscalated = Boolean(isEscalated);
    if (!chatModeBadge) return;
    if (currentIsEscalated) {
      chatModeBadge.className = "chat-mode-badge mode-admin";
      chatModeBadge.textContent = "👨‍💼 Live Admin Support";
    } else {
      chatModeBadge.className = "chat-mode-badge mode-ai";
      chatModeBadge.textContent = "🤖 PNM AI Assistant";
    }
  }

  // Toggle AI Typing Indicator Bubble
  function setAiTyping(isTyping) {
    if (!chatMessagesList) return;
    if (isTyping) {
      if (aiTypingElement) return;
      aiTypingElement = document.createElement("div");
      aiTypingElement.className = "chat-msg chat-typing-indicator";
      aiTypingElement.id = "pnmAiTypingBubble";
      aiTypingElement.innerHTML = `
        <span>🤖 AI Assistant is thinking</span>
        <div class="typing-dots"><span></span><span></span><span></span></div>
      `;
      chatMessagesList.appendChild(aiTypingElement);
      scrollMessagesToBottom(true);
    } else {
      if (aiTypingElement) {
        aiTypingElement.remove();
        aiTypingElement = null;
      }
      const leftover = document.getElementById("pnmAiTypingBubble");
      if (leftover) leftover.remove();
    }
  }

  // Render Human-in-the-Loop (HITL) Escalation Confirmation Card
  function renderHitlInterruptCard(promptText) {
    if (!chatMessagesList) return;
    setAiTyping(false);

    const card = document.createElement("div");
    card.className = "chat-msg chat-hitl-card";
    const safePrompt = escapeHtml(promptText || "Would you like me to connect you directly with a live PNM Support Admin?");

    card.innerHTML = `
      <div class="hitl-header">
        <span>🤝 Live Support Request</span>
      </div>
      <div class="hitl-prompt">${safePrompt}</div>
      <div class="hitl-actions">
        <button type="button" class="hitl-btn hitl-btn-yes" data-decision="yes">
          ✅ Yes, Connect to Admin
        </button>
        <button type="button" class="hitl-btn hitl-btn-no" data-decision="no">
          ❌ No, Continue with AI
        </button>
      </div>
      <div class="hitl-answered-msg" style="display: none;"></div>
    `;

    const actionsContainer = card.querySelector(".hitl-actions");
    const answeredMsg = card.querySelector(".hitl-answered-msg");
    const yesBtn = card.querySelector(".hitl-btn-yes");
    const noBtn = card.querySelector(".hitl-btn-no");

    const handleDecision = (decision) => {
      if (actionsContainer) actionsContainer.style.display = "none";
      if (answeredMsg) {
        answeredMsg.style.display = "block";
        answeredMsg.innerHTML = decision === "yes"
          ? `<span class="hitl-badge-yes">✅ Connecting you to Human Admin...</span>`
          : `<span class="hitl-badge-no">❌ Continuing with AI Assistant</span>`;
      }
      if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify({ hitl_decision: decision }));
      }
    };

    yesBtn?.addEventListener("click", () => handleDecision("yes"));
    noBtn?.addEventListener("click", () => handleDecision("no"));

    chatMessagesList.appendChild(card);
    scrollMessagesToBottom(true);
  }

  // Render a chat message bubble
  function renderMessageItem(msg, scroll = true) {
    if (!chatMessagesList) return;
    if (msg.id && renderedMessageIds.has(msg.id)) return;
    if (msg.id) renderedMessageIds.add(msg.id);

    // Dismiss AI typing indicator whenever a message arrives
    setAiTyping(false);

    const msgEl = document.createElement("div");
    const timeStr = formatTime(msg.created_at);

    if (msg.is_broadcast) {
      // Broadcast Announcement
      msgEl.className = "chat-msg chat-msg-broadcast";
      msgEl.innerHTML = `
        <div class="msg-bubble">
          <div class="broadcast-tag">📢 Official Announcement</div>
          <div>${escapeHtml(msg.message)}</div>
          <div class="msg-meta">${timeStr}</div>
        </div>
      `;
    } else if (msg.sender_role === "user") {
      // User Message (Right)
      msgEl.className = "chat-msg chat-msg-user";
      msgEl.innerHTML = `
        <div class="msg-bubble">${escapeHtml(msg.message)}</div>
        <div class="msg-meta">${timeStr}</div>
      `;
    } else if (msg.sender_role === "ai") {
      // AI Assistant Message (Left)
      msgEl.className = "chat-msg chat-msg-ai";
      msgEl.innerHTML = `
        <div class="msg-author">
          🤖 AI Assistant
        </div>
        <div class="msg-bubble">${escapeHtml(msg.message)}</div>
        <div class="msg-meta">${timeStr}</div>
      `;
    } else {
      // Human Admin / Support Message (Left)
      msgEl.className = "chat-msg chat-msg-admin";
      msgEl.innerHTML = `
        <div class="msg-author">
          👨‍💼 Human Admin
        </div>
        <div class="msg-bubble">${escapeHtml(msg.message)}</div>
        <div class="msg-meta">${timeStr}</div>
      `;
    }

    chatMessagesList.appendChild(msgEl);
    if (scroll) scrollMessagesToBottom(true);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Fetch past message history from SQLite via REST endpoint
  async function loadChatHistory(email, name, token) {
    try {
      const url = `${API_BASE_URL}/admin/chat/user/history?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&session_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("This email is already registered in an active chat session on another device.");
        }
        throw new Error(`Failed to load history (${res.status})`);
      }
      const data = await res.json();
      if (data) {
        if (typeof data.is_escalated !== "undefined") {
          updateHeaderModeBadge(data.is_escalated);
        }
        if (Array.isArray(data.messages)) {
          if (data.messages.length > 0 && chatMessagesList) {
            chatMessagesList.innerHTML = "";
            renderedMessageIds.clear();
          }
          data.messages.forEach((m) => renderMessageItem(m, false));
          scrollMessagesToBottom(false);
        }
        if (data.has_pending_interrupt && data.interrupt_prompt) {
          renderHitlInterruptCard(data.interrupt_prompt);
        }
      }
    } catch (err) {
      console.warn("Could not load past chat history:", err);
    }
  }

  // Connect Visitor WebSocket
  function connectChatWebSocket(email, name, token) {
    if (chatReconnectTimer) {
      clearTimeout(chatReconnectTimer);
      chatReconnectTimer = null;
    }

    if (chatSocket && (chatSocket.readyState === WebSocket.OPEN || chatSocket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    isIntentionallyClosed = false;
    setStatusIndicator(false, "Connecting to live support...");

    const wsBase = getWsBaseUrl(API_BASE_URL);
    const wsUrl = `${wsBase}/admin/ws/user?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&session_token=${encodeURIComponent(token)}`;

    try {
      chatSocket = new WebSocket(wsUrl);

      chatSocket.onopen = () => {
        setStatusIndicator(true, "Online • Ready to help");
      };

      chatSocket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.event === "chat_message" && packet.data) {
            setAiTyping(false);
            renderMessageItem(packet.data, true);

            // If chat window is closed, increment unread badge for admin/ai/broadcast messages
            const isWidgetOpen = chatWidget && chatWidget.classList.contains("open");
            if (!isWidgetOpen && packet.data.sender_role !== "user") {
              updateUnreadBadge(unreadChatCount + 1);
            }
          } else if (packet.event === "ai_typing") {
            setAiTyping(Boolean(packet.is_typing));
          } else if (packet.event === "hitl_interrupt") {
            renderHitlInterruptCard(packet.prompt);
          } else if (packet.event === "session_mode_changed") {
            updateHeaderModeBadge(packet.is_escalated);
          }
        } catch (err) {
          console.error("Error processing incoming chat packet:", err);
        }
      };

      chatSocket.onerror = (err) => {
        console.warn("Visitor chat WebSocket error:", err);
        setStatusIndicator(false, "Reconnecting...");
      };

      chatSocket.onclose = () => {
        setStatusIndicator(false, "Disconnected");
        if (!isIntentionallyClosed) {
          chatReconnectTimer = setTimeout(() => {
            const curEmail = localStorage.getItem("pnm_chat_email");
            const curName = localStorage.getItem("pnm_chat_name");
            const curToken = localStorage.getItem("pnm_chat_token");
            if (curEmail && curName && curToken) {
              connectChatWebSocket(curEmail, curName, curToken);
            }
          }, 3000);
        }
      };
    } catch (err) {
      console.error("Failed to establish chat WebSocket:", err);
      setStatusIndicator(false, "Connection error");
    }
  }

  // Send a message via WebSocket
  function sendChatMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
      showToast("Chat connection is reconnecting, please try again in a moment.", "error");
      return;
    }

    try {
      chatSocket.send(JSON.stringify({ message: trimmed }));
      if (chatMessageInput) chatMessageInput.value = "";
    } catch (err) {
      console.error("Failed to send message:", err);
      showToast("Failed to send message. Please check your internet connection.", "error");
    }
  }

  // Initialize or check stored user session
  function initChatSession() {
    const token = getOrCreateChatToken();
    const storedEmail = localStorage.getItem("pnm_chat_email");
    const storedName = localStorage.getItem("pnm_chat_name");

    if (storedEmail && storedName) {
      if (chatPreForm) chatPreForm.style.display = "none";
      if (chatThreadView) chatThreadView.style.display = "flex";
      if (chatCurrentUserName) chatCurrentUserName.textContent = storedName;

      loadChatHistory(storedEmail, storedName, token);
      connectChatWebSocket(storedEmail, storedName, token);
    } else {
      if (chatPreForm) chatPreForm.style.display = "flex";
      if (chatThreadView) chatThreadView.style.display = "none";
    }
  }

  // Pre-chat identification form submission
  if (preChatFormEl) {
    preChatFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (chatNameInput?.value || "").trim();
      const email = (chatEmailInput?.value || "").trim().toLowerCase();

      if (name.length < 2) {
        showToast("Please enter your full name (at least 2 letters).", "error");
        chatNameInput?.focus();
        return;
      }

      if (!email || !email.includes("@") || !email.includes(".")) {
        showToast("Please enter a valid corporate email address.", "error");
        chatEmailInput?.focus();
        return;
      }

      const token = getOrCreateChatToken();
      localStorage.setItem("pnm_chat_name", name);
      localStorage.setItem("pnm_chat_email", email);

      if (chatCurrentUserName) chatCurrentUserName.textContent = name;
      if (chatPreForm) chatPreForm.style.display = "none";
      if (chatThreadView) chatThreadView.style.display = "flex";

      loadChatHistory(email, name, token);
      connectChatWebSocket(email, name, token);

      setTimeout(() => {
        if (chatMessageInput) chatMessageInput.focus();
      }, 100);
    });
  }

  // Message composer submission
  if (chatInputForm) {
    chatInputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (chatMessageInput) {
        sendChatMessage(chatMessageInput.value);
      }
    });
  }

  // Reset/Switch Identity
  if (chatResetBtn) {
    chatResetBtn.addEventListener("click", () => {
      if (confirm("Would you like to switch to a different name/email for this chat?")) {
        isIntentionallyClosed = true;
        if (chatSocket) chatSocket.close();
        localStorage.removeItem("pnm_chat_name");
        localStorage.removeItem("pnm_chat_email");
        renderedMessageIds.clear();
        setAiTyping(false);
        updateHeaderModeBadge(false);
        if (chatMessagesList) {
          chatMessagesList.innerHTML = `
            <div class="chat-msg chat-msg-system">
              <p>Welcome! Our team is online and ready to assist you. Send a message below to start.</p>
            </div>
          `;
        }
        if (chatPreForm) chatPreForm.style.display = "flex";
        if (chatThreadView) chatThreadView.style.display = "none";
        setStatusIndicator(true, "Online • Ready to help");
      }
    });
  }

  // Toggle Chat Window
  function toggleChatWidget() {
    if (!chatWidget) return;
    const isOpen = chatWidget.classList.contains("open");
    if (isOpen) {
      chatWidget.classList.remove("open");
      chatWindow?.setAttribute("aria-hidden", "true");
    } else {
      chatWidget.classList.add("open");
      chatWindow?.setAttribute("aria-hidden", "false");
      updateUnreadBadge(0);
      scrollMessagesToBottom(false);

      const storedEmail = localStorage.getItem("pnm_chat_email");
      if (storedEmail) {
        setTimeout(() => chatMessageInput?.focus(), 150);
      } else {
        setTimeout(() => chatNameInput?.focus(), 150);
      }
    }
  }

  if (chatLauncher) {
    chatLauncher.addEventListener("click", toggleChatWidget);
  }

  if (chatMinimizeBtn) {
    chatMinimizeBtn.addEventListener("click", toggleChatWidget);
  }

  // Kick off initial chat check on page load
  initChatSession();
});
