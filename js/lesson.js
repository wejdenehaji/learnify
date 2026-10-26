// Lesson page: shows the lesson chosen in the URL (?lesson=N, starting at 0)
// and switches lessons without reloading the page.
(function () {
  "use strict";

  // 1. Make sure the course data exists and is usable.
  if (
    typeof LEARNIFY_COURSE === "undefined" ||
    !Array.isArray(LEARNIFY_COURSE.lessons) ||
    LEARNIFY_COURSE.lessons.length === 0
  ) {
    console.error("Learnify: course data is missing or empty.");
    return;
  }
  var lessons = LEARNIFY_COURSE.lessons;
  var currentIndex = 0;

  // 2. Small helpers.
  function setText(id, text) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  // Turns a lesson number from a string into a valid index, or null.
  // Only whole numbers inside the lesson range are valid.
  function parseLessonNumber(raw) {
    if (raw === null || !/^\d+$/.test(raw) || Number(raw) >= lessons.length) {
      return null;
    }
    return Number(raw);
  }

  // Reads ?lesson=N from the address bar. Returns { index, valid }.
  function readLessonFromUrl() {
    var raw = new URLSearchParams(window.location.search).get("lesson");
    if (raw === null) {
      return { index: 0, valid: true };
    }
    var index = parseLessonNumber(raw);
    return index === null ? { index: 0, valid: false } : { index: index, valid: true };
  }

  // 3. Fill the page with one lesson.
  function renderLesson(index) {
    var lesson = lessons[index];
    var total = lessons.length;
    currentIndex = index;

    document.title = lesson.title + " — Learnify";
    setText("breadcrumb-lesson", "Leçon " + (index + 1));
    setText("lesson-title", lesson.title);
    setText("lesson-subtitle", "Leçon " + (index + 1) + " sur " + total + " · " + lesson.category);
    setText("article-heading", lesson.heading);
    setText("lesson-description", lesson.description);
    setText("lesson-tip", lesson.tip);
    setText("lesson-code", lesson.code);

    // Video: show the frame only when the lesson has a video.
    var iframe = document.getElementById("lesson-video");
    if (iframe && iframe.parentElement) {
      if (lesson.video) {
        if (iframe.getAttribute("src") !== lesson.video) {
          iframe.setAttribute("src", lesson.video);
        }
        iframe.parentElement.hidden = false;
      } else {
        iframe.removeAttribute("src");
        iframe.parentElement.hidden = true;
      }
    }

    // Previous / next links.
    var previous = document.getElementById("previous-lesson");
    if (previous) {
      if (index > 0) {
        previous.setAttribute("href", "lesson.html?lesson=" + (index - 1));
        previous.style.visibility = "visible";
      } else {
        previous.style.visibility = "hidden"; // also removes it from the Tab order
      }
    }
    var next = document.getElementById("next-lesson");
    if (next) {
      if (index < total - 1) {
        next.setAttribute("href", "lesson.html?lesson=" + (index + 1));
        next.textContent = "Leçon suivante →";
      } else {
        next.setAttribute("href", "course.html");
        next.textContent = "Retour au cours →";
      }
    }

    // Sidebar: mark the current lesson.
    var items = document.querySelectorAll("#lesson-list .sidebar-lesson");
    items.forEach(function (item) {
      var isCurrent = Number(item.getAttribute("data-lesson")) === index;
      item.classList.toggle("active", isCurrent);
      if (isCurrent) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  // 4. Switch lesson without reloading: update the page and the address bar.
  function goToLesson(index) {
    renderLesson(index);
    window.history.pushState(null, "", "lesson.html?lesson=" + index);

    // Move keyboard focus to the new title so screen readers announce the change.
    var heading = document.getElementById("lesson-title");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  }

  // Which lesson does this link point to? null = not a lesson link of this page.
  function lessonIndexOfLink(link) {
    var url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname) {
      return null;
    }
    return parseLessonNumber(url.searchParams.get("lesson"));
  }

  document.addEventListener("click", function (event) {
    // Let the browser handle new-tab / new-window clicks normally.
    if (event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    var link = event.target.closest ? event.target.closest("a") : null;
    if (!link) {
      return;
    }
    var isLessonNav = link.closest("#lesson-list") ||
      link.id === "previous-lesson" || link.id === "next-lesson";
    if (!isLessonNav) {
      return;
    }
    var index = lessonIndexOfLink(link);
    if (index === null) {
      return; // e.g. "Retour au cours": normal navigation
    }
    event.preventDefault();
    if (index !== currentIndex) {
      goToLesson(index);
    }
  });

  // Browser back / forward buttons: show the lesson in the address bar.
  window.addEventListener("popstate", function () {
    renderLesson(readLessonFromUrl().index);
  });

  // 5. Start.
  var fromUrl = readLessonFromUrl();
  if (!fromUrl.valid) {
    // Bad identifier: show lesson 1 and fix the address bar without adding history.
    window.history.replaceState(null, "", "lesson.html?lesson=0");
  }
  renderLesson(fromUrl.index);
})();