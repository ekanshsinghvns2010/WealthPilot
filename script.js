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
   PREMIUM CHART ENGINE — CHUNK 1/2
   ========================================================= */

const chartRegistry = {};
const chartAnimations = {};


/* ---------------------------------------------------------
   COMPACT ₹ FORMAT
   --------------------------------------------------------- */

function compactMoney(value) {

  value = Math.max(0, Number(value) || 0);

  if (value >= 10000000) {
    const n = value / 10000000;
    return `₹${n.toFixed(n >= 10 ? 0 : 1)}Cr`;
  }

  if (value >= 100000) {
    const n = value / 100000;
    return `₹${n.toFixed(n >= 10 ? 0 : 1)}L`;
  }

  if (value >= 1000) {
    const n = value / 1000;
    return `₹${n.toFixed(n >= 10 ? 0 : 1)}K`;
  }

  return `₹${Math.round(value)}`;
}


/* ---------------------------------------------------------
   CANVAS SETUP
   --------------------------------------------------------- */

function setupCanvas(canvas) {

  const rect =
    canvas.getBoundingClientRect();

  const width =
    Math.max(1, rect.width);

  const height =
    Math.max(1, rect.height);

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2.5
    );

  canvas.width =
    Math.round(width * dpr);

  canvas.height =
    Math.round(height * dpr);

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
    width,
    height
  };
}


/* ---------------------------------------------------------
   PREMIUM CHART STYLES
   --------------------------------------------------------- */

function installChartStyles() {

  if ($("wealthPilotChartStyles"))
    return;

  const style =
    document.createElement("style");

  style.id =
    "wealthPilotChartStyles";

  style.textContent = `

    .wp-chart-tooltip {
      position: absolute;
      z-index: 20;
      pointer-events: none;
      min-width: 145px;
      padding: 11px 13px;
      border-radius: 12px;
      background: rgba(15,15,28,.94);
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: 0 12px 35px rgba(0,0,0,.35);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #fff;
      font-family: inherit;
      font-size: 12px;
      line-height: 1.5;
      opacity: 0;
      transform: translateY(5px);
      transition:
        opacity .16s ease,
        transform .16s ease;
    }

    .wp-chart-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .wp-chart-tooltip .wp-tooltip-year {
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .wp-chart-tooltip .wp-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
    }

    .wp-chart-tooltip .wp-tooltip-label {
      opacity: .65;
    }

    .wp-chart-tooltip .wp-tooltip-value {
      font-weight: 700;
    }

    canvas[id="sipChart"],
    canvas[id="wealthChart"],
    canvas[id="scenarioChart"] {
      touch-action: pan-y;
      cursor: crosshair;
    }

  `;

  document.head.appendChild(style);
}

installChartStyles();


/* ---------------------------------------------------------
   TOOLTIP
   --------------------------------------------------------- */

function getChartTooltip(canvas) {

  const parent =
    canvas.parentElement;

  if (!parent)
    return null;

  if (
    getComputedStyle(parent).position ===
    "static"
  ) {
    parent.style.position =
      "relative";
  }

  let tooltip =
    parent.querySelector(
      ".wp-chart-tooltip"
    );

  if (!tooltip) {

    tooltip =
      document.createElement("div");

    tooltip.className =
      "wp-chart-tooltip";

    parent.appendChild(tooltip);
  }

  return tooltip;
}


function hideChartTooltip(canvas) {

  const tooltip =
    canvas.parentElement?.querySelector(
      ".wp-chart-tooltip"
    );

  tooltip?.classList.remove(
    "visible"
  );
}


/* ---------------------------------------------------------
   SMOOTH CURVE
   --------------------------------------------------------- */

function drawSmoothPath(
  ctx,
  points
) {

  if (!points.length)
    return;

  ctx.beginPath();

  ctx.moveTo(
    points[0].x,
    points[0].y
  );

  for (
    let i = 0;
    i < points.length - 1;
    i++
  ) {

    const current =
      points[i];

    const next =
      points[i + 1];

    const previous =
      points[
        Math.max(0, i - 1)
      ];

    const following =
      points[
        Math.min(
          points.length - 1,
          i + 2
        )
      ];

    const cp1x =
      current.x +
      (next.x - previous.x) / 6;

    const cp1y =
      current.y +
      (next.y - previous.y) / 6;

    const cp2x =
      next.x -
      (following.x - current.x) / 6;

    const cp2y =
      next.y -
      (following.y - current.y) / 6;

    ctx.bezierCurveTo(
      cp1x,
      cp1y,
      cp2x,
      cp2y,
      next.x,
      next.y
    );
  }
}


/* ---------------------------------------------------------
   GRID
   --------------------------------------------------------- */

function drawChartGrid(
  ctx,
  width,
  height,
  padding,
  max
) {

  const chartHeight =
    height -
    padding.top -
    padding.bottom;

  ctx.save();

  ctx.lineWidth = 1;

  ctx.strokeStyle =
    "rgba(255,255,255,.065)";

  ctx.fillStyle =
    "rgba(255,255,255,.42)";

  ctx.font =
    "10px system-ui, sans-serif";

  ctx.textBaseline =
    "middle";

  const rows = 4;

  for (
    let i = 0;
    i < rows;
    i++
  ) {

    const ratio =
      i / (rows - 1);

    const y =
      padding.top +
      chartHeight * ratio;

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

    if (width > 300) {

      const value =
        max * (1 - ratio);

      ctx.fillText(
        compactMoney(value),
        padding.left + 4,
        y - 6
      );
    }
  }

  ctx.restore();
}


/* ---------------------------------------------------------
   WEALTH CHART
   --------------------------------------------------------- */

function drawWealthChart(
  canvasId,
  yearly
) {

  const canvas =
    $(canvasId);

  if (
    !canvas ||
    !yearly?.length
  )
    return;

  const {
    ctx,
    width,
    height
  } =
    setupCanvas(canvas);

  if (
    width < 5 ||
    height < 5
  )
    return;

  const padding = {

    top: 24,

    right: 16,

    bottom: 28,

    left:
      width > 300
        ? 48
        : 12

  };

  const chartWidth =
    width -
    padding.left -
    padding.right;

  const chartHeight =
    height -
    padding.top -
    padding.bottom;

  const maxValue =
    Math.max(
      ...yearly.map(row =>
        Math.max(
          row.value || 0,
          row.invested || 0
        )
      )
    );

  const max =
    maxValue || 1;

  const bottom =
    height -
    padding.bottom;


  /* ZERO STATE */

  if (maxValue <= 0) {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    drawChartGrid(
      ctx,
      width,
      height,
      padding,
      1
    );

    ctx.fillStyle =
      "rgba(255,255,255,.45)";

    ctx.font =
      "12px system-ui, sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "Enter a SIP amount to see your projection",
      width / 2,
      height / 2
    );

    ctx.textAlign =
      "start";

    chartRegistry[canvasId] = {

      type: "wealth",

      canvas,

      yearly,

      points: []

    };

    hideChartTooltip(canvas);

    return;
  }


  /* POINTS */

  const points =
    yearly.map(
      (row, index) => {

        const ratio =
          index /
          Math.max(
            1,
            yearly.length - 1
          );

        const x =
          padding.left +
          chartWidth * ratio;

        const y =
          padding.top +
          chartHeight *
          (
            1 -
            row.value / max
          );

        return {
          x,
          y,
          row
        };

      }
    );


  const investedPoints =
    yearly.map(
      (row, index) => {

        const ratio =
          index /
          Math.max(
            1,
            yearly.length - 1
          );

        return {

          x:
            padding.left +
            chartWidth * ratio,

          y:
            padding.top +
            chartHeight *
            (
              1 -
              (row.invested || 0) /
              max
            ),

          row

        };

      }
    );


  /* ANIMATION */

  if (
    chartAnimations[canvasId]
  ) {

    cancelAnimationFrame(
      chartAnimations[canvasId]
    );

  }

  const start =
    performance.now();

  const duration = 750;


  function render(time) {

    const progress =
      Math.min(
        1,
        (time - start) /
        duration
      );

    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    drawChartGrid(
      ctx,
      width,
      height,
      padding,
      max
    );


    const animatedPoints =
      points.map(point => ({

        x: point.x,

        y:
          bottom -
          (
            bottom -
            point.y
          ) * eased

      }));


    const animatedInvested =
      investedPoints.map(
        point => ({

          x: point.x,

          y:
            bottom -
            (
              bottom -
              point.y
            ) * eased

        })
      );


    /* AREA */

    const areaGradient =
      ctx.createLinearGradient(
        0,
        padding.top,
        0,
        bottom
      );

    areaGradient.addColorStop(
      0,
      "rgba(139,114,255,.32)"
    );

    areaGradient.addColorStop(
      .55,
      "rgba(139,114,255,.10)"
    );

    areaGradient.addColorStop(
      1,
      "rgba(139,114,255,0)"
    );

    drawSmoothPath(
      ctx,
      animatedPoints
    );

    ctx.lineTo(
      animatedPoints[
        animatedPoints.length - 1
      ].x,
      bottom
    );

    ctx.lineTo(
      animatedPoints[0].x,
      bottom
    );

    ctx.closePath();

    ctx.fillStyle =
      areaGradient;

    ctx.fill();


    /* INVESTED LINE */

    drawSmoothPath(
      ctx,
      animatedInvested
    );

    ctx.strokeStyle =
      "rgba(255,255,255,.38)";

    ctx.lineWidth = 1.5;

    ctx.setLineDash([
      5,
      5
    ]);

    ctx.stroke();

    ctx.setLineDash([]);


    /* MAIN LINE */

    drawSmoothPath(
      ctx,
      animatedPoints
    );

    const lineGradient =
      ctx.createLinearGradient(
        0,
        0,
        width,
        0
      );

    lineGradient.addColorStop(
      0,
      "#7c5cff"
    );

    lineGradient.addColorStop(
      .5,
      "#a58cff"
    );

    lineGradient.addColorStop(
      1,
      "#c0b1ff"
    );

    ctx.strokeStyle =
      lineGradient;

    ctx.lineWidth = 3;

    ctx.lineJoin =
      "round";

    ctx.lineCap =
      "round";

    ctx.stroke();


    /* END POINT */

    if (progress >= 1) {

      const last =
        animatedPoints[
          animatedPoints.length - 1
        ];

      ctx.beginPath();

      ctx.arc(
        last.x,
        last.y,
        5,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(139,114,255,.25)";

      ctx.fill();

      ctx.beginPath();

      ctx.arc(
        last.x,
        last.y,
        3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.fill();
    }


    if (progress < 1) {

      chartAnimations[canvasId] =
        requestAnimationFrame(
          render
        );

    } else {

      chartAnimations[canvasId] =
        null;

      chartRegistry[canvasId] = {

        type: "wealth",

        canvas,

        yearly,

        points,

        investedPoints,

        padding,

        width,

        height,

        max

      };

    }

  }


  chartAnimations[canvasId] =
    requestAnimationFrame(
      render
    );

  setupChartInteraction(canvas);
}


/* ---------------------------------------------------------
   SCENARIO CHART
   --------------------------------------------------------- */

function drawScenarioChart(
  conservative,
  base,
  higher
) {

  const canvas =
    $("scenarioChart");

  if (!canvas)
    return;

  const {
    ctx,
    width,
    height
  } =
    setupCanvas(canvas);

  if (
    width < 5 ||
    height < 5
  )
    return;

  const datasets = [

    {
      key: "conservative",
      name: "8% Conservative",
      data: conservative,
      color: "#777d91"
    },

    {
      key: "base",
      name: "12% Base",
      data: base,
      color: "#9a82ff"
    },

    {
      key: "higher",
      name: "15% Higher",
      data: higher,
      color: "#42d6ad"
    }

  ];

  const padding = {

    top: 22,

    right: 16,

    bottom: 24,

    left:
      width > 300
        ? 48
        : 12

  };

  const chartWidth =
    width -
    padding.left -
    padding.right;

  const chartHeight =
    height -
    padding.top -
    padding.bottom;

  const allValues =
    datasets.flatMap(
      dataset =>
        dataset.data.map(
          row => row.value || 0
        )
    );

  const max =
    Math.max(
      ...allValues,
      1
    );


  const prepared =
    datasets.map(
      dataset => ({

        ...dataset,

        points:
          dataset.data.map(
            (row, index) => {

              const ratio =
                index /
                Math.max(
                  1,
                  dataset.data.length - 1
                );

              return {

                x:
                  padding.left +
                  chartWidth * ratio,

                y:
                  padding.top +
                  chartHeight *
                  (
                    1 -
                    row.value / max
                  ),

                row

              };

            }
          )

      })
    );


  if (
    chartAnimations.scenario
  ) {

    cancelAnimationFrame(
      chartAnimations.scenario
    );

  }

  const start =
    performance.now();

  const duration = 700;


  function render(time) {

    const progress =
      Math.min(
        1,
        (time - start) /
        duration
      );

    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    drawChartGrid(
      ctx,
      width,
      height,
      padding,
      max
    );


    prepared.forEach(
      dataset => {

        const animated =
          dataset.points.map(
            point => ({

              x: point.x,

              y:
                height -
                padding.bottom -
                (
                  height -
                  padding.bottom -
                  point.y
                ) * eased

            })
          );


        drawSmoothPath(
          ctx,
          animated
        );

        ctx.strokeStyle =
          dataset.color;

        ctx.lineWidth =
          dataset.key === "base"
            ? 3
            : 2;

        ctx.lineCap =
          "round";

        ctx.lineJoin =
          "round";

        ctx.stroke();


        if (progress >= 1) {

          const last =
            animated[
              animated.length - 1
            ];

          ctx.beginPath();

          ctx.arc(
            last.x,
            last.y,
            dataset.key === "base"
              ? 3.5
              : 3,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            dataset.color;

          ctx.fill();

        }

      }
    );


    if (progress < 1) {

      chartAnimations.scenario =
        requestAnimationFrame(
          render
        );

    } else {

      chartAnimations.scenario =
        null;

      chartRegistry.scenarioChart = {

        type: "scenario",

        canvas,

        datasets: prepared,

        padding,

        width,

        height,

        max

      };

    }

  }


  chartAnimations.scenario =
    requestAnimationFrame(
      render
    );

  setupChartInteraction(canvas);
}
/* =========================================================
   PREMIUM CHART ENGINE — CHUNK 2/2
   ========================================================= */


/* ---------------------------------------------------------
   TOOLTIP POSITION
   --------------------------------------------------------- */

function positionTooltip(
  tooltip,
  x,
  y,
  canvas
) {

  if (!tooltip)
    return;

  const parent =
    canvas.parentElement;

  if (!parent)
    return;

  tooltip.classList.add("visible");

  const parentWidth =
    parent.clientWidth;

  const parentHeight =
    parent.clientHeight;

  const tooltipWidth =
    tooltip.offsetWidth || 150;

  const tooltipHeight =
    tooltip.offsetHeight || 90;

  let left =
    x + 14;

  let top =
    y - tooltipHeight - 12;


  if (
    left + tooltipWidth >
    parentWidth - 8
  ) {

    left =
      x - tooltipWidth - 14;

  }

  if (left < 8)
    left = 8;


  if (top < 8)
    top = y + 14;


  if (
    top + tooltipHeight >
    parentHeight - 8
  ) {

    top =
      parentHeight -
      tooltipHeight -
      8;

  }


  tooltip.style.left =
    `${left}px`;

  tooltip.style.top =
    `${top}px`;
}


/* ---------------------------------------------------------
   STATIC WEALTH CHART
   --------------------------------------------------------- */

function drawWealthChartStatic(
  chart,
  activeIndex = -1
) {

  if (!chart?.canvas)
    return;

  const {
    ctx,
    width,
    height
  } =
    setupCanvas(chart.canvas);

  const padding =
    chart.padding;

  const points =
    chart.points || [];

  const investedPoints =
    chart.investedPoints || [];

  if (!points.length)
    return;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  drawChartGrid(
    ctx,
    width,
    height,
    padding,
    chart.max
  );


  /* AREA */

  const areaGradient =
    ctx.createLinearGradient(
      0,
      padding.top,
      0,
      height - padding.bottom
    );

  areaGradient.addColorStop(
    0,
    "rgba(139,114,255,.32)"
  );

  areaGradient.addColorStop(
    .55,
    "rgba(139,114,255,.10)"
  );

  areaGradient.addColorStop(
    1,
    "rgba(139,114,255,0)"
  );


  drawSmoothPath(
    ctx,
    points
  );

  ctx.lineTo(
    points[points.length - 1].x,
    height - padding.bottom
  );

  ctx.lineTo(
    points[0].x,
    height - padding.bottom
  );

  ctx.closePath();

  ctx.fillStyle =
    areaGradient;

  ctx.fill();


  /* INVESTED */

  drawSmoothPath(
    ctx,
    investedPoints
  );

  ctx.strokeStyle =
    "rgba(255,255,255,.38)";

  ctx.lineWidth = 1.5;

  ctx.setLineDash([
    5,
    5
  ]);

  ctx.stroke();

  ctx.setLineDash([]);


  /* MAIN LINE */

  drawSmoothPath(
    ctx,
    points
  );

  const lineGradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      0
    );

  lineGradient.addColorStop(
    0,
    "#7c5cff"
  );

  lineGradient.addColorStop(
    .5,
    "#a58cff"
  );

  lineGradient.addColorStop(
    1,
    "#c0b1ff"
  );

  ctx.strokeStyle =
    lineGradient;

  ctx.lineWidth = 3;

  ctx.lineJoin =
    "round";

  ctx.lineCap =
    "round";

  ctx.stroke();


  /* ACTIVE GUIDE */

  if (
    activeIndex >= 0 &&
    activeIndex < points.length
  ) {

    const point =
      points[activeIndex];


    ctx.beginPath();

    ctx.moveTo(
      point.x,
      padding.top
    );

    ctx.lineTo(
      point.x,
      height - padding.bottom
    );

    ctx.strokeStyle =
      "rgba(255,255,255,.18)";

    ctx.lineWidth = 1;

    ctx.setLineDash([
      3,
      4
    ]);

    ctx.stroke();

    ctx.setLineDash([]);


    /* GLOW */

    ctx.beginPath();

    ctx.arc(
      point.x,
      point.y,
      8,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(139,114,255,.18)";

    ctx.fill();


    /* DOT */

    ctx.beginPath();

    ctx.arc(
      point.x,
      point.y,
      4,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      point.x,
      point.y,
      2.5,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#9a82ff";

    ctx.fill();

  } else {

    const last =
      points[points.length - 1];

    ctx.beginPath();

    ctx.arc(
      last.x,
      last.y,
      6,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(139,114,255,.22)";

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      last.x,
      last.y,
      3,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.fill();
  }
}


/* ---------------------------------------------------------
   STATIC SCENARIO CHART
   --------------------------------------------------------- */

function drawScenarioChartStatic(
  chart,
  activeIndex = -1
) {

  if (!chart?.canvas)
    return;

  const {
    ctx,
    width,
    height
  } =
    setupCanvas(chart.canvas);

  const padding =
    chart.padding;

  const datasets =
    chart.datasets || [];

  if (!datasets.length)
    return;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  drawChartGrid(
    ctx,
    width,
    height,
    padding,
    chart.max
  );


  datasets.forEach(
    dataset => {

      const points =
        dataset.points || [];

      if (!points.length)
        return;


      drawSmoothPath(
        ctx,
        points
      );

      ctx.strokeStyle =
        dataset.color;

      ctx.lineWidth =
        dataset.key === "base"
          ? 3
          : 2;

      ctx.lineCap =
        "round";

      ctx.lineJoin =
        "round";

      ctx.stroke();


      if (
        activeIndex < 0
      ) {

        const last =
          points[
            points.length - 1
          ];

        ctx.beginPath();

        ctx.arc(
          last.x,
          last.y,
          dataset.key === "base"
            ? 3.5
            : 3,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          dataset.color;

        ctx.fill();

      }

    }
  );


  /* ACTIVE YEAR */

  if (
    activeIndex >= 0 &&
    datasets[0]?.points?.[activeIndex]
  ) {

    const activePoint =
      datasets[0]
        .points[activeIndex];


    ctx.beginPath();

    ctx.moveTo(
      activePoint.x,
      padding.top
    );

    ctx.lineTo(
      activePoint.x,
      height - padding.bottom
    );

    ctx.strokeStyle =
      "rgba(255,255,255,.18)";

    ctx.lineWidth = 1;

    ctx.setLineDash([
      3,
      4
    ]);

    ctx.stroke();

    ctx.setLineDash([]);


    datasets.forEach(
      dataset => {

        const point =
          dataset.points[
            activeIndex
          ];

        if (!point)
          return;


        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          7,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `${dataset.color}33`;

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          dataset.key === "base"
            ? 3.5
            : 3,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          dataset.color;

        ctx.fill();

      }
    );
  }
}


/* ---------------------------------------------------------
   INTERACTION
   --------------------------------------------------------- */

function setupChartInteraction(canvas) {

  if (
    canvas.dataset.chartInteraction
  )
    return;

  canvas.dataset.chartInteraction =
    "true";

  const tooltip =
    getChartTooltip(canvas);


  function getPointerPosition(event) {

    const rect =
      canvas.getBoundingClientRect();

    return {

      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top

    };
  }


  function showWealthPoint(
    chart,
    position
  ) {

    if (!chart.points?.length) {

      hideChartTooltip(canvas);

      return;
    }


    let closest = 0;

    let distance =
      Infinity;


    chart.points.forEach(
      (point, index) => {

        const d =
          Math.abs(
            point.x -
            position.x
          );

        if (
          d < distance
        ) {

          distance = d;
          closest = index;

        }

      }
    );


    const point =
      chart.points[closest];

    const row =
      point.row;

    const returns =
      Math.max(
        0,
        (row.value || 0) -
        (row.invested || 0)
      );


    drawWealthChartStatic(
      chart,
      closest
    );


    if (!tooltip)
      return;


    tooltip.innerHTML = `

      <div class="wp-tooltip-year">
        Year ${row.year}
      </div>

      <div class="wp-tooltip-row">

        <span class="wp-tooltip-label">
          Invested
        </span>

        <span class="wp-tooltip-value">
          ${money(row.invested)}
        </span>

      </div>

      <div class="wp-tooltip-row">

        <span class="wp-tooltip-label">
          Returns
        </span>

        <span class="wp-tooltip-value">
          ${money(returns)}
        </span>

      </div>

      <div class="wp-tooltip-row">

        <span class="wp-tooltip-label">
          Total
        </span>

        <span class="wp-tooltip-value">
          ${money(row.value)}
        </span>

      </div>

    `;


    positionTooltip(
      tooltip,
      point.x,
      point.y,
      canvas
    );
  }


  function showScenarioPoint(
    chart,
    position
  ) {

    if (
      !chart.datasets?.length
    )
      return;


    const length =
      chart.datasets[0]
        ?.points?.length || 0;

    if (!length)
      return;


    let closest = 0;

    let distance =
      Infinity;


    for (
      let i = 0;
      i < length;
      i++
    ) {

      const x =
        chart.datasets[0]
          .points[i].x;

      const d =
        Math.abs(
          x -
          position.x
        );

      if (
        d < distance
      ) {

        distance = d;
        closest = i;

      }

    }


    const first =
      chart.datasets[0]
        .points[closest];

    const year =
      first.row.year;


    drawScenarioChartStatic(
      chart,
      closest
    );


    if (!tooltip)
      return;


    tooltip.innerHTML = `

      <div class="wp-tooltip-year">
        Year ${year}
      </div>

      ${chart.datasets.map(
        dataset => {

          const row =
            dataset.points[
              closest
            ].row;

          return `

            <div class="wp-tooltip-row">

              <span class="wp-tooltip-label">
                ${dataset.name}
              </span>

              <span
                class="wp-tooltip-value"
                style="color:${dataset.color}"
              >
                ${money(row.value)}
              </span>

            </div>

          `;

        }
      ).join("")}

    `;


    positionTooltip(
      tooltip,
      first.x,
      first.y,
      canvas
    );
  }


  function handlePointer(event) {

    const key =
      canvas.id ===
      "scenarioChart"
        ? "scenarioChart"
        : canvas.id;

    const chart =
      chartRegistry[key];

    if (!chart)
      return;


    const position =
      getPointerPosition(
        event
      );


    if (
      chart.type ===
      "wealth"
    ) {

      showWealthPoint(
        chart,
        position
      );

    } else {

      showScenarioPoint(
        chart,
        position
      );

    }
  }


  canvas.addEventListener(
    "pointermove",
    handlePointer
  );


  canvas.addEventListener(
    "pointerdown",
    handlePointer
  );


  canvas.addEventListener(
    "pointerleave",
    () => {

      hideChartTooltip(
        canvas
      );

      const key =
        canvas.id ===
        "scenarioChart"
          ? "scenarioChart"
          : canvas.id;

      const chart =
        chartRegistry[key];

      if (!chart)
        return;


      if (
        chart.type ===
        "wealth"
      ) {

        drawWealthChartStatic(
          chart,
          -1
        );

      } else {

        drawScenarioChartStatic(
          chart,
          -1
        );

      }

    }
  );
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