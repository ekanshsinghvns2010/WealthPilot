/* =========================================================
   WEALTHPILOT — SCRIPT.JS
   ========================================================= */

"use strict";

/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.max(0, value || 0));

const number = (id, fallback = 0) => {
  const el = $(id);
  const value = el ? parseFloat(el.value) : NaN;
  return Number.isFinite(value) ? value : fallback;
};


/* =========================================================
   CINEMATIC INTRO
   ========================================================= */

const intro = $("intro");
const app = $("app");

window.addEventListener("load", () => {

  /*
   * The cinematic intro gets enough time to breathe.
   * The real application appears after the animation.
   */

  setTimeout(() => {

    if (intro) {
      intro.classList.add("intro-finished");
    }

    if (app) {
      app.classList.add("app-visible");
    }

  }, 17500);

});


/* =========================================================
   PARTICLE SYSTEM
   ========================================================= */

const particleCanvas = $("particles");

if (particleCanvas) {

  const ctx = particleCanvas.getContext("2d");

  let particles = [];
  let width = 0;
  let height = 0;
  let animationFrame;


  function resizeParticles() {

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    particleCanvas.width = width * dpr;
    particleCanvas.height = height * dpr;

    particleCanvas.style.width = width + "px";
    particleCanvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
  }


  function createParticles() {

    const count =
      Math.min(
        140,
        Math.max(
          55,
          Math.floor((width * height) / 11000)
        )
      );

    particles = [];

    for (let i = 0; i < count; i++) {

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        a: Math.random() * 0.7 + 0.15,
        pulse: Math.random() * Math.PI * 2
      });

    }
  }


  function animateParticles(time) {

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {

      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.008;

      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;

      if (p.y < -5) p.y = height + 5;
      if (p.y > height + 5) p.y = -5;

      const alpha =
        p.a *
        (0.72 + Math.sin(p.pulse) * 0.28);

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(125,105,255,${alpha})`;

      ctx.fill();
    }

    animationFrame =
      requestAnimationFrame(animateParticles);
  }


  window.addEventListener(
    "resize",
    resizeParticles
  );

  resizeParticles();
  animateParticles();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navItems =
  document.querySelectorAll(".nav-item");

const mobileNavItems =
  document.querySelectorAll(".mobile-nav-item");

const sections =
  document.querySelectorAll(
    "[data-section-panel]"
  );


function showSection(sectionName) {

  sections.forEach(section => {

    section.classList.toggle(
      "active",
      section.dataset.sectionPanel === sectionName
    );

  });


  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.section === sectionName
    );

  });


  mobileNavItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.section === sectionName
    );

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


navItems.forEach(item => {

  item.addEventListener("click", () => {

    showSection(item.dataset.section);

  });

});


mobileNavItems.forEach(item => {

  item.addEventListener("click", () => {

    showSection(item.dataset.section);

    closeMobileMenu();

  });

});


document
  .querySelectorAll("[data-open-section]")
  .forEach(button => {

    button.addEventListener("click", () => {

      showSection(
        button.dataset.openSection
      );

    });

  });


/* =========================================================
   MOBILE MENU
   ========================================================= */

const mobileMenu = $("mobileMenu");
const menuButton = $("menuButton");
const closeMenuButton = $("closeMenu");


function openMobileMenu() {

  if (!mobileMenu) return;

  mobileMenu.classList.add("open");

  mobileMenu.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeMobileMenu() {

  if (!mobileMenu) return;

  mobileMenu.classList.remove("open");

  mobileMenu.setAttribute(
    "aria-hidden",
    "true"
  );

}


menuButton?.addEventListener(
  "click",
  openMobileMenu
);

closeMenuButton?.addEventListener(
  "click",
  closeMobileMenu
);


/* =========================================================
   SIP CALCULATOR
   ========================================================= */

function calculateSIP(
  monthly,
  annualRate,
  years,
  stepUp = 0
) {

  monthly = Math.max(0, monthly);
  annualRate = Math.max(0, annualRate);
  years = Math.max(1, years);
  stepUp = Math.max(0, stepUp);

  const monthlyRate =
    annualRate / 100 / 12;

  let balance = 0;
  let invested = 0;
  let currentMonthly = monthly;

  const yearly = [];

  for (let year = 1; year <= years; year++) {

    let yearlyInvested = 0;

    for (let month = 1; month <= 12; month++) {

      balance += currentMonthly;

      invested += currentMonthly;
      yearlyInvested += currentMonthly;

      balance *=
        1 + monthlyRate;

    }

    yearly.push({
      year,
      invested,
      value: balance,
      yearlyInvested
    });

    currentMonthly *=
      1 + stepUp / 100;
  }

  return {
    value: balance,
    invested,
    returns: balance - invested,
    yearly
  };

}


/* =========================================================
   SIP UI
   ========================================================= */

function updateSIP() {

  const monthly =
    number("sipAmount", 5000);

  const rate =
    number("sipReturn", 12);

  const years =
    number("sipYears", 20);

  const stepUp =
    number("sipStepUp", 0);


  const result =
    calculateSIP(
      monthly,
      rate,
      years,
      stepUp
    );


  if ($("sipCorpus"))
    $("sipCorpus").textContent =
      money(result.value);

  if ($("sipInvested"))
    $("sipInvested").textContent =
      money(result.invested);

  if ($("sipReturns"))
    $("sipReturns").textContent =
      money(result.returns);

  if ($("sipResultYears"))
    $("sipResultYears").textContent =
      `${years} years`;


  renderYearlyList(result.yearly);

  drawWealthChart(
    "sipChart",
    result.yearly
  );


  updateDashboard(
    monthly,
    result,
    years
  );

}


function renderYearlyList(data) {

  const list = $("yearlyList");

  if (!list) return;

  list.innerHTML = "";

  data.forEach(row => {

    const item =
      document.createElement("div");

    item.className =
      "yearly-row";

    item.innerHTML = `
      <span>Year ${row.year}</span>
      <strong>${money(row.value)}</strong>
      <small>
        Invested ${money(row.invested)}
      </small>
    `;

    list.appendChild(item);

  });

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard(
  monthly,
  result,
  years
) {

  if ($("dashboardCorpus"))
    $("dashboardCorpus").textContent =
      money(result.value);

  if ($("dashboardSip"))
    $("dashboardSip").textContent =
      money(monthly);

  if ($("dashboardInvested"))
    $("dashboardInvested").textContent =
      money(result.invested);

  if ($("dashboardGrowth"))
    $("dashboardGrowth").textContent =
      money(result.returns);

  if ($("dashboardYears"))
    $("dashboardYears").textContent =
      `${years} years`;

  drawWealthChart(
    "wealthChart",
    result.yearly
  );

}


/* =========================================================
   GOAL PLANNER
   ========================================================= */

function calculateGoalSIP(
  target,
  annualRate,
  years
) {

  target = Math.max(0, target);
  annualRate = Math.max(0, annualRate);
  years = Math.max(1, years);

  const monthlyRate =
    annualRate / 100 / 12;

  const months = years * 12;

  if (monthlyRate === 0) {

    return target / months;

  }

  return (
    target *
    monthlyRate /
    (
      Math.pow(
        1 + monthlyRate,
        months
      ) - 1
    )
  );

}


function updateGoal() {

  const target =
    number("goalAmount", 10000000);

  const rate =
    number("goalReturn", 12);

  const years =
    number("goalYears", 20);

  const name =
    $("goalName")?.value ||
    "My financial goal";


  const monthly =
    calculateGoalSIP(
      target,
      rate,
      years
    );


  if ($("requiredSip"))
    $("requiredSip").textContent =
      money(monthly);

  if ($("goalTarget"))
    $("goalTarget").textContent =
      money(target);

  if ($("goalTime"))
    $("goalTime").textContent =
      `${years} years`;

  if ($("goalRate"))
    $("goalRate").textContent =
      `${rate}%`;

  if ($("goalResultName"))
    $("goalResultName").textContent =
      name;

  if ($("goalResult"))
    $("goalResult").hidden = false;

}


/* =========================================================
   SCENARIOS
   ========================================================= */

function updateScenarios() {

  const monthly =
    number("scenarioSip", 10000);

  const years =
    number("scenarioYears", 20);

  const conservative =
    calculateSIP(
      monthly,
      8,
      years
    );

  const base =
    calculateSIP(
      monthly,
      12,
      years
    );

  const higher =
    calculateSIP(
      monthly,
      15,
      years
    );


  if ($("conservativeValue"))
    $("conservativeValue").textContent =
      money(conservative.value);

  if ($("baseValue"))
    $("baseValue").textContent =
      money(base.value);

  if ($("higherValue"))
    $("higherValue").textContent =
      money(higher.value);


  drawScenarioChart(
    conservative.yearly,
    base.yearly,
    higher.yearly
  );

}


/* =========================================================
   CHART ENGINE
   ========================================================= */

function setupCanvas(canvas) {

  const rect =
    canvas.getBoundingClientRect();

  const dpr =
    window.devicePixelRatio || 1;

  canvas.width =
    rect.width * dpr;

  canvas.height =
    rect.height * dpr;

  const ctx =
    canvas.getContext("2d");

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  return {
    ctx,
    width: rect.width,
    height: rect.height
  };

}


function drawWealthChart(
  canvasId,
  yearly
) {

  const canvas = $(canvasId);

  if (!canvas || !yearly?.length)
    return;

  const {
    ctx,
    width,
    height
  } = setupCanvas(canvas);


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  const padding = {
    top: 20,
    right: 15,
    bottom: 28,
    left: 15
  };

  const chartWidth =
    width -
    padding.left -
    padding.right;

  const chartHeight =
    height -
    padding.top -
    padding.bottom;


  const max =
    Math.max(
      ...yearly.map(x => x.value)
    );


  const points =
    yearly.map((row, index) => {

      const x =
        padding.left +
        chartWidth *
        (
          index /
          Math.max(1, yearly.length - 1)
        );

      const y =
        padding.top +
        chartHeight *
        (
          1 -
          row.value / max
        );

      return { x, y };

    });


  /* GRID */

  ctx.strokeStyle =
    "rgba(255,255,255,.07)";

  ctx.lineWidth = 1;

  for (let i = 0; i < 4; i++) {

    const y =
      padding.top +
      chartHeight *
      i / 3;

    ctx.beginPath();

    ctx.moveTo(
      padding.left,
      y
    );

    ctx.lineTo(
      width - padding.right,
      y
    );

    ctx.stroke();

  }


  /* AREA */

  const gradient =
    ctx.createLinearGradient(
      0,
      padding.top,
      0,
      height
    );

  gradient.addColorStop(
    0,
    "rgba(124,92,255,.30)"
  );

  gradient.addColorStop(
    1,
    "rgba(124,92,255,0)"
  );


  ctx.beginPath();

  ctx.moveTo(
    points[0].x,
    height - padding.bottom
  );

  points.forEach(point => {

    ctx.lineTo(
      point.x,
      point.y
    );

  });

  ctx.lineTo(
    points[points.length - 1].x,
    height - padding.bottom
  );

  ctx.closePath();

  ctx.fillStyle = gradient;

  ctx.fill();


  /* LINE */

  ctx.beginPath();

  points.forEach((point, index) => {

    if (index === 0) {

      ctx.moveTo(
        point.x,
        point.y
      );

    } else {

      ctx.lineTo(
        point.x,
        point.y
      );

    }

  });

  ctx.strokeStyle =
    "#8b72ff";

  ctx.lineWidth = 3;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.stroke();


  /* END POINT */

  const last =
    points[points.length - 1];

  ctx.beginPath();

  ctx.arc(
    last.x,
    last.y,
    5,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.fill();

}


function drawScenarioChart(
  conservative,
  base,
  higher
) {

  const canvas =
    $("scenarioChart");

  if (!canvas) return;

  const {
    ctx,
    width,
    height
  } = setupCanvas(canvas);


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  const datasets = [
    {
      data: conservative,
      color: "#777d91"
    },
    {
      data: base,
      color: "#8b72ff"
    },
    {
      data: higher,
      color: "#42d6ad"
    }
  ];


  const padding = 18;

  const max =
    Math.max(
      ...datasets.flatMap(
        d => d.data.map(x => x.value)
      )
    );


  datasets.forEach(dataset => {

    const points =
      dataset.data.map(
        (row, index) => {

          const x =
            padding +
            (
              width -
              padding * 2
            ) *
            (
              index /
              Math.max(
                1,
                dataset.data.length - 1
              )
            );

          const y =
            padding +
            (
              height -
              padding * 2
            ) *
            (
              1 -
              row.value / max
            );

          return { x, y };

        }
      );


    ctx.beginPath();

    points.forEach(
      (point, index) => {

        if (index === 0)
          ctx.moveTo(
            point.x,
            point.y
          );
        else
          ctx.lineTo(
            point.x,
            point.y
          );

      }
    );

    ctx.strokeStyle =
      dataset.color;

    ctx.lineWidth = 2.5;

    ctx.lineJoin = "round";

    ctx.stroke();

  });

}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

$("calculateSip")
  ?.addEventListener(
    "click",
    updateSIP
  );

$("calculateGoal")
  ?.addEventListener(
    "click",
    updateGoal
  );

$("runScenarios")
  ?.addEventListener(
    "click",
    updateScenarios
  );


/* =========================================================
   LIVE SIP INPUT
   ========================================================= */

[
  "sipAmount",
  "sipReturn",
  "sipYears",
  "sipStepUp"
].forEach(id => {

  $(id)?.addEventListener(
    "input",
    updateSIP
  );

});


/* =========================================================
   RESIZE CHARTS
   ========================================================= */

let resizeTimer;

window.addEventListener(
  "resize",
  () => {

    clearTimeout(resizeTimer);

    resizeTimer =
      setTimeout(() => {

        updateSIP();

        updateScenarios();

      }, 180);

  }
);


/* =========================================================
   INITIAL CALCULATIONS
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateSIP();
    updateScenarios();

  }
);