/*
 * Revenue Intelligence & Forecasting: fills the page from window.REVENUE_INTEL (data.js).
 * The chart is drawn at the card's real pixel width, so its labels stay the same size on
 * every screen; it redraws on resize.
 */
(function () {
  "use strict";
  var DATA = window.REVENUE_INTEL;
  if (!DATA) return;

  var state = { scenario: "base", focus: 0 };
  var SCENARIO_WORDS = { base: "base", downside: "downside", upside: "best-case" };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var $ = function (id) { return document.getElementById(id); };

  function money(value, digits) {
    if (value == null || !isFinite(value)) return "—";
    var abs = Math.abs(value);
    var sign = value < 0 ? "−" : "";
    if (abs >= 1e6) return sign + "£" + (abs / 1e6).toFixed(digits == null ? 2 : digits) + "M";
    return sign + "£" + Math.round(abs).toLocaleString("en-GB");
  }
  function pct(value, digits) {
    if (value == null || !isFinite(value)) return "—";
    return (value >= 0 ? "+" : "−") + (Math.abs(value) * 100).toFixed(digits == null ? 1 : digits) + "%";
  }
  function plainPct(value, digits) {
    if (value == null || !isFinite(value)) return "—";
    return (Math.abs(value) * 100).toFixed(digits == null ? 1 : digits) + "%";
  }
  function labelMonth(ym) { var p = ym.split("-"); return MONTHS[Number(p[1]) - 1] + " " + p[0].slice(2); }
  function longMonth(ym) { var p = ym.split("-"); return LONG[Number(p[1]) - 1] + " " + p[0]; }
  function token(name, fallback) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; }
  function scenarioValue(row) {
    if (state.scenario === "downside") return row.scenario_downside;
    if (state.scenario === "upside") return row.scenario_upside;
    return row.base;
  }
  function bar(label, width, value, key) {
    return '<div class="ri-bar' + (key ? " is-key" : "") + '"><span>' + label + '</span><i style="--w:' + width.toFixed(1) + '%"></i><b>' + value + "</b></div>";
  }

  /* ----- Static sections ----- */

  function fillKpis() {
    var k = DATA.kpis;
    $("kpi-complete").textContent = money(k.complete_net);
    $("kpi-yoy").textContent = pct(k.jan_nov_yoy);
    $("kpi-wmape").textContent = plainPct(k.h1_wmape);
    $("copy-measured").innerHTML =
      "Merchandise net sales are gross merchandise lines, plus returns, plus discount and commission lines. Across the whole extract that is " +
      money(k.extract_net) + ". The 24 complete months are " + money(k.complete_net) +
      ". Returns were " + plainPct(k.return_rate) + " of merchandise gross. Postage, " + money(k.postage) +
      " signed, is kept out of the target. The source is Chen, D. (2012), <em>Online Retail II</em>, UCI Machine Learning Repository.";
    $("copy-forecast").textContent =
      "On 12 one-step forecasts from December 2010 through November 2011, repeating the same month last year missed by " +
      money(k.h1_mae) + " on average, or " + plainPct(k.h1_wmape) +
      " of revenue. Last month missed by " + money(DATA.models.naive_last.mae) +
      ". A drift model missed by " + money(DATA.models.drift.mae) +
      ". A trend-plus-cycle regression missed by " + money(DATA.models.fourier_trend.mae) +
      ". The base plan does not add a growth trend the data did not reward.";
  }

  function fillDecomp() {
    var k = DATA.kpis;
    var rows = [
      ["Gross sales", k.gross], ["Returns", k.returns], ["Contra", k.contra],
      ["Merchandise net", k.extract_net, true], ["Postage (excluded)", k.postage]
    ];
    var max = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[1]); }));
    $("decomp-bars").innerHTML = rows.map(function (r) {
      return bar(r[0], Math.max(0.6, (Math.abs(r[1]) / max) * 100), money(r[1]), r[2]);
    }).join("");
  }

  function fillModels() {
    var order = ["seasonal_naive", "naive_last", "drift", "fourier_trend"];
    var names = { seasonal_naive: "Same month last year", naive_last: "Last month repeats", drift: "Drift", fourier_trend: "Trend + annual cycle" };
    $("model-rows").innerHTML = order.map(function (key) {
      var row = DATA.models[key];
      var selected = key === DATA.kpis.model;
      return "<tr" + (selected ? ' class="is-key"' : "") + "><td>" + names[key] + (selected ? ' <span class="ri-tag">· selected</span>' : "") +
        "</td><td>" + money(row.mae) + "</td><td>" + money(row.rmse) + "</td><td>" + plainPct(row.wmape) + "</td></tr>";
    }).join("");
  }

  function fillConcentration() {
    var k = DATA.kpis;
    var customer = [
      ["Top decile of customers", k.top_decile], ["Top 10 accounts", k.top10_accounts], ["Repeat customers", k.repeat_share],
      ["UK share of net", k.uk_share], ["No customer id", k.unidentified_share]
    ];
    $("customer-bars").innerHTML = customer.map(function (r, i) { return bar(r[0], r[1] * 100, plainPct(r[1]), i === 0); }).join("");
    $("customer-note").textContent =
      k.customers_50 + " of " + k.positive_customers.toLocaleString("en-GB") +
      " identified customers account for half of positive identified sales; " +
      k.customers_80.toLocaleString("en-GB") + " account for 80%. Median customer " + money(k.median_customer) +
      "; mean " + money(k.mean_customer) + ". Top 10 products are only " + plainPct(k.top10_products) +
      " of product net sales (" + k.products_50 + " products for half).";
    var peak = Math.max.apply(null, DATA.seasonal.map(function (r) { return r.index_vs_all_complete_months; }));
    $("season-bars").innerHTML = DATA.seasonal.map(function (r) {
      var v = r.index_vs_all_complete_months;
      return bar(MONTHS[Number(r.calendar_month) - 1], Math.min(100, (v / (peak * 1.04)) * 100), v.toFixed(2) + "×", v === peak);
    }).join("");
  }

  // Twelve rows, one per calendar month, with both trading years side by side.
  function fillMonths() {
    var h = DATA.history, off = h.length - 12;
    var span = function (a, b) { return labelMonth(a.month).replace(" ", " ’") + "–" + labelMonth(b.month).replace(" ", " ’"); };
    $("month-head").innerHTML = '<tr><th scope="col">Month</th><th scope="col">' + span(h[0], h[off - 1]) + '</th><th scope="col">' +
      span(h[off], h[h.length - 1]) + '</th><th scope="col">Change</th></tr>';
    var rows = [];
    for (var i = 0; i < 12; i++) {
      var a = h[i], b = h[i + off];
      rows.push('<tr><td>' + LONG[Number(b.month.split("-")[1]) - 1] + "</td><td>" + money(a.net) + "</td><td>" + money(b.net) + "</td><td>" + (b.yoy == null ? "—" : pct(b.yoy)) + "</td></tr>");
    }
    $("month-rows").innerHTML = rows.join("");
  }

  function fillMonthButtons() {
    $("ri-months").innerHTML = DATA.forward.map(function (d, i) {
      return '<button type="button" data-focus="' + i + '" aria-pressed="' + (i === state.focus) + '">' + labelMonth(d.month) + "</button>";
    }).join("");
  }

  /* ----- Forecast chart ----- */

  var geom = null;

  function drawChart() {
    var svg = $("ri-chart");
    var history = DATA.history, forward = DATA.forward, n = history.length + forward.length;
    var W = Math.max(280, Math.round(svg.parentNode.clientWidth));
    var H = W < 560 ? 240 : Math.round(Math.min(360, Math.max(280, W * 0.32)));
    var pad = { l: 50, r: 12, t: 22, b: 30 };
    var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    var published = forward.filter(function (d) { return d.interval_published; });
    var values = history.map(function (d) { return d.net; })
      .concat(forward.map(scenarioValue))
      .concat(published.map(function (d) { return d.residual_interval_low; }))
      .concat(published.map(function (d) { return d.residual_interval_high; }));
    var minV = Math.min.apply(null, values) * 0.92, maxV = Math.max.apply(null, values) * 1.04;
    var step = [50e3, 100e3, 200e3, 250e3, 500e3, 1e6].filter(function (s) { return s >= (maxV - minV) / 6; })[0] || 1e6;
    function x(i) { return pad.l + (i / (n - 1)) * plotW; }
    function y(v) { return pad.t + (1 - (v - minV) / (maxV - minV)) * plotH; }
    geom = { W: W, pad: pad, plotW: plotW, n: n };

    var ink = token("--card-ink", "#F6EFEA"), rose = token("--card-rose", "#E8B6AF"), rule = token("--card-rule", "rgba(246,239,234,.16)");
    var out = [];
    var split = x(history.length - 1);
    out.push('<rect x="' + split.toFixed(1) + '" y="' + pad.t + '" width="' + (W - pad.r - split).toFixed(1) + '" height="' + plotH + '" fill="' + token("--ri-region", "rgba(232,182,175,0.06)") + '"></rect>');
    out.push('<text class="is-forecast" x="' + (W - pad.r) + '" y="' + (pad.t - 8) + '" text-anchor="end">Forecast</text>');
    for (var t = Math.ceil(minV / step) * step; t <= maxV; t += step) {
      out.push('<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '" stroke="' + rule + '"></line>');
      out.push('<text x="' + (pad.l - 8) + '" y="' + (y(t) + 4).toFixed(1) + '" text-anchor="end">£' + (t / 1e6).toFixed(step < 1e5 ? 2 : 1) + "M</text>");
    }
    var every = W < 520 ? 6 : 3;
    for (var i = 0; i < n; i += every) {
      var fc = i >= history.length, ym = fc ? forward[i - history.length].month : history[i].month;
      out.push('<text' + (fc ? ' class="is-forecast"' : "") + ' x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + labelMonth(ym) + "</text>");
    }
    if (published.length) {
      var up = published.map(function (d) { return x(history.length + forward.indexOf(d)).toFixed(1) + "," + y(d.residual_interval_high).toFixed(1); });
      var lo = published.map(function (d) { return x(history.length + forward.indexOf(d)).toFixed(1) + "," + y(d.residual_interval_low).toFixed(1); }).reverse();
      out.push('<path d="M' + up.join(" L") + " L" + lo.join(" L") + ' Z" fill="' + token("--ri-band", "rgba(232,182,175,0.24)") + '"></path>');
    }
    out.push('<path d="' + history.map(function (d, i) { return (i ? "L" : "M") + x(i).toFixed(1) + "," + y(d.net).toFixed(1); }).join(" ") +
      '" fill="none" stroke="' + ink + '" stroke-width="2.2" stroke-linejoin="round"></path>');
    var fpts = [[x(history.length - 1), y(history[history.length - 1].net)]].concat(forward.map(function (d, i) { return [x(history.length + i), y(scenarioValue(d))]; }));
    out.push('<path d="' + fpts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") +
      '" fill="none" stroke="' + rose + '" stroke-width="2" stroke-dasharray="5 5" stroke-linejoin="round"></path>');
    var f = fpts[state.focus + 1];
    out.push('<line x1="' + f[0].toFixed(1) + '" x2="' + f[0].toFixed(1) + '" y1="' + pad.t + '" y2="' + (H - pad.b) + '" stroke="' + rose + '" stroke-opacity="0.5" stroke-dasharray="2 4"></line>');
    out.push('<circle cx="' + f[0].toFixed(1) + '" cy="' + f[1].toFixed(1) + '" r="5.5" fill="' + rose + '" stroke="' + token("--card", "#1C1919") + '" stroke-width="2"></circle>');

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.innerHTML = out.join("");

    var row = forward[state.focus];
    $("readout-month").textContent = longMonth(row.month);
    $("readout-point").textContent = money(scenarioValue(row));
    $("readout-band").textContent = row.interval_published
      ? money(row.residual_interval_low) + " to " + money(row.residual_interval_high)
      : "Point only · not walk-forward tested";
    var note = "Solid line: merchandise net sales in the 24 complete months. Peak is " + longMonth(DATA.kpis.peak_month) +
      " at " + money(DATA.kpis.peak) + ". Dashed line: " + SCENARIO_WORDS[state.scenario] + " scenario from the selected model (" + DATA.kpis.model.replace("_", " ") + ").";
    if (row.partial_month_actual_net_sales != null) {
      note += " Partial " + longMonth(row.month) + " actual through " + Number(row.partial_month_through.slice(8)) + " December: " +
        money(row.partial_month_actual_net_sales) + ". Not scored.";
    }
    $("chart-note").textContent = note;
    document.querySelectorAll("[data-focus]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.focus) === state.focus)); });
  }

  function bind() {
    document.querySelectorAll("[data-scenario]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.scenario = btn.dataset.scenario;
        document.querySelectorAll("[data-scenario]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        drawChart();
      });
    });
    $("ri-months").addEventListener("click", function (e) {
      var b = e.target.closest("[data-focus]");
      if (!b) return;
      state.focus = Number(b.dataset.focus);
      drawChart();
    });
    $("ri-chart").addEventListener("click", function (e) {
      if (!geom) return;
      var rect = e.currentTarget.getBoundingClientRect();
      var px = (e.clientX - rect.left) * (geom.W / rect.width);
      var idx = Math.round(((px - geom.pad.l) / geom.plotW) * (geom.n - 1)) - DATA.history.length;
      state.focus = Math.max(0, Math.min(DATA.forward.length - 1, idx));
      drawChart();
    });
    var pending = 0;
    window.addEventListener("resize", function () {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(drawChart);
    });
  }

  fillKpis();
  fillDecomp();
  fillModels();
  fillConcentration();
  fillMonths();
  fillMonthButtons();
  bind();
  drawChart();
})();
