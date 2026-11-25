/*
 * The six case studies: the single source for the homepage nodes, the preview
 * card and the work section.
 *
 * Content comes from the live case-study pages (titles, tools, summaries) and
 * every number is one those pages already publish. Nothing here is estimated.
 *
 *   label    node title, one entry per line
 *   summary  one short line for the hero card; description is the longer
 *            version used in Selected works
 *   featured the study the hero card shows first (and returns to)
 *   tools    skills named on the case study
 *   preview  a small chart of figures from the case study
 *             kind: "area" (a series), "bars" (vertical), "hbars" (horizontal),
 *                   "change" (signed percentages), "pair" (before → after)
 *   slot     position in the hero: l1–l3 down the left, r1–r3 down the right
 *
 * The list is in display order: 01–06 here is the order of the hero nodes
 * (left column, then right), the Tab order and the Selected works grid.
 */
(() => {
  window.ORBIT_PROJECTS = Object.freeze([
    {
      id: "01",
      slot: "l1",
      featured: true,
      title: "Accounts Receivable Aging Analysis",
      label: ["A/R Aging"],
      kicker: "Excel · Financial reporting",
      tools: ["Excel", "A/R aging", "Collections"],
      summary: "An Excel follow-up queue for a dental practice. Across two snapshots, 90+ day A/R went from 31.4% to 18.7% of the open balance.",
      description: "Built an Excel follow-up queue for a dental practice. Across two snapshots, the 90+ day share of open A/R went from 31.4% to 18.7%.",
      href: "projects/ar-tracker.html",
      preview: {
        kind: "pair",
        caption: "90+ day share of open A/R, two snapshots",
        unit: "%",
        items: [{ label: "Earlier snapshot", value: 31.4 }, { label: "Later snapshot", value: 18.7 }]
      }
    },
    {
      id: "02",
      slot: "l2",
      title: "Revenue Intelligence & Forecasting",
      label: ["Revenue Intelligence", "& Forecasting"],
      kicker: "Forecasting · Revenue analysis",
      tools: ["SQL", "Python", "Forecasting"],
      summary: "Monthly net sales for a UK online wholesaler. Same month last year was the best forecast: 8.4% error over 12 backtests.",
      description: "Using the same month last year beat three alternatives, with 8.4% weighted absolute percentage error across 12 one-month backtests.",
      href: "projects/revenue-intelligence/",
      preview: {
        kind: "area",
        caption: "Monthly net sales (£), Dec 2009 – Nov 2011",
        format: { prefix: "£", scale: 1e6, suffix: "M", decimals: 1 },
        ticks: [0.5e6, 1e6, 1.5e6],
        axis: [[0, "Dec 09"], [6, "Jun 10"], [12, "Dec 10"], [18, "Jun 11"], [23, "Nov 11"]],
        values: [778069, 604589, 523808, 751969, 636011, 606335, 669763, 615619, 660881, 841130, 1067260, 1392728,
          757330, 578814, 499163, 678980, 480039, 730872, 723533, 676574, 700256, 1009869, 1059341, 1423253]
      }
    },
    {
      id: "03",
      slot: "l3",
      title: "Transaction Anomaly Detection",
      label: ["Transaction", "Anomaly Detection"],
      kicker: "DuckDB SQL · Fraud operations",
      tools: ["DuckDB", "SQL", "Window functions"],
      summary: "Rules plus a statistical score on simulated PaySim payments: 886 frauds caught versus 531, at 200 reviews a day.",
      description: "Scoring caught 886 fraud cases versus 531 with rules alone on simulated holdout data, at the same 200 reviews per day.",
      href: "projects/transaction-anomaly.html",
      preview: {
        kind: "bars",
        caption: "Holdout fraud recall at 200 alerts per day",
        format: { suffix: "%", decimals: 2 },
        items: [
          { label: "Existing flag", value: 0.27 },
          { label: "Rules", value: 20.49 },
          { label: "Rules + score", value: 34.18 }
        ]
      }
    },
    {
      id: "04",
      slot: "r1",
      title: "Nike Revenue & Channel Performance",
      label: ["Nike Revenue", "& Channels"],
      kicker: "Tableau · Financial performance",
      tools: ["Tableau", "10-K analysis", "Channel mix"],
      summary: "A Tableau story on Nike’s public FY2025 10-K: revenue, inventory and the channel mix.",
      description: "A Tableau story built on Nike's public FY2025 10-K: revenue, inventory and which channels still deserve inventory depth.",
      href: "projects/nike.html",
      preview: {
        kind: "change",
        caption: "FY2025 change from the year before, per the 10-K",
        items: [
          { label: "Revenue", value: -10 },
          { label: "Wholesale", value: -7 },
          { label: "Direct", value: -13 }
        ]
      }
    },
    {
      id: "05",
      slot: "r2",
      title: "Student Performance Risk Analysis",
      label: ["Student", "Performance Risk"],
      kicker: "SQL · Risk segmentation",
      tools: ["PostgreSQL", "Window functions", "Cohorts"],
      summary: "A PostgreSQL study of 6,607 students: ranked risk drivers, behavioral cohorts and an early-warning queue.",
      description: "A PostgreSQL study of 6,607 students: ranked risk drivers, behavioral cohorts and an advising early-warning queue.",
      href: "projects/student-performance-sql.html",
      preview: {
        kind: "hbars",
        caption: "Exam-score gap, top vs bottom tier (points)",
        format: { decimals: 2, prefix: "+" },
        items: [
          { label: "Attendance", value: 6.02 },
          { label: "Hours studied", value: 4.56 },
          { label: "Resources", value: 1.89 },
          { label: "Prior scores", value: 1.8 }
        ]
      }
    },
    {
      id: "06",
      slot: "r3",
      title: "Film Revenue & Genre Analysis",
      label: ["Film Revenue", "& Genre"],
      kicker: "Python · Exploratory analysis",
      tools: ["Python", "pandas", "EDA"],
      summary: "About 10,000 TMDb titles: inflation-adjusted revenue by budget, popularity, genre and year.",
      description: "About 10,000 TMDb titles: inflation-adjusted revenue against budget, popularity, genre and release year. Association, not a recipe for a hit.",
      href: "projects/tmdb-revenue.html",
      preview: {
        kind: "hbars",
        caption: "Median inflation-adjusted revenue by genre",
        format: { prefix: "$", suffix: "M", decimals: 0 },
        items: [
          { label: "Animation", value: 149 },
          { label: "Adventure", value: 115 },
          { label: "Comedy", value: 47 }
        ]
      }
    }
  ]);
})();
