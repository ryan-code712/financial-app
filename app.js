const monthlyIncome = 6500;
const currentNetWorth = 148750;

const budgetGroups = [
  {
    name: "Essentials",
    target: 2900,
    spent: 2725,
    lines: [
      { name: "Housing", planned: 1800, spent: 1800 },
      { name: "Groceries", planned: 650, spent: 580 },
      { name: "Utilities", planned: 450, spent: 345 },
    ],
  },
  {
    name: "Financial Goals",
    target: 1800,
    spent: 1460,
    lines: [
      { name: "Emergency Fund", planned: 700, spent: 700 },
      { name: "Home Fund", planned: 500, spent: 300 },
      { name: "Education fund", planned: 300, spent: 260 },
      { name: "Investments", planned: 300, spent: 200 },
    ],
  },
  {
    name: "Lifestyle",
    target: 1200,
    spent: 980,
    lines: [
      { name: "Dining", planned: 350, spent: 310 },
      { name: "Transport", planned: 350, spent: 290 },
      { name: "Fun + Shopping", planned: 500, spent: 380 },
    ],
  },
];

const accounts = [
  { name: "Checking", type: "Cash", balance: 3240 },
  { name: "Unibank", type: "Bank account", balance: 23840 },
  { name: "Fidelity Brokerage", type: "Investments", balance: 89450 },
  { name: "Fidelity IRA", type: "Retirement", balance: 35210 },
  { name: "Credit Card", type: "Liability", balance: -640 },
];

const transactions = [
  { name: "Payroll Deposit", category: "Income", amount: 3250, direction: "in" },
  { name: "Whole Foods", category: "Groceries", amount: 146, direction: "out" },
  { name: "Mortgage", category: "Housing", amount: 1800, direction: "out" },
  { name: "ETF Auto-Invest", category: "Investments", amount: 200, direction: "out" },
  { name: "Dining", category: "Lifestyle", amount: 52, direction: "out" },
];

const connectionState = {
  fidelity: false,
  unibank: false,
};

const connectionProviders = [
  { id: "fidelity", name: "Fidelity", details: "Brokerage + retirement sync" },
  { id: "unibank", name: "Unibank", details: "Checking + savings sync" },
];

let netWorthGoals = [175000, 250000, 500000];
let activeRange = "day";

const rangeSeries = {
  minute: [149000, 148960, 149030, 148990, 149080, 149060, 149120, 149080],
  hour: [148500, 148700, 148640, 148910, 149020, 148980, 149140, 149090],
  day: [147200, 147900, 148100, 148050, 148400, 148900, 148760, 149030],
  "4hour": [146800, 147100, 147550, 147430, 147980, 148620, 148400, 149010],
  "5day": [145900, 146500, 147200, 148000, 147780, 148320, 148940, 149200],
  month: [141000, 142400, 143100, 144500, 145800, 147200, 148400, 149300],
  year: [118500, 121100, 125900, 131300, 135700, 139900, 145800, 149300],
  ytd: [134200, 136500, 137900, 140400, 142200, 145700, 147800, 149300],
};

const currency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const incomeTotal = document.getElementById("incomeTotal");
const plannedTotal = document.getElementById("plannedTotal");
const remainingTotal = document.getElementById("remainingTotal");
const plannedBar = document.getElementById("plannedBar");
const goalHint = document.getElementById("goalHint");
const budgetGroupsNode = document.getElementById("budgetGroups");
const accountList = document.getElementById("accountList");
const transactionList = document.getElementById("transactionList");
const connectionList = document.getElementById("connectionList");
const netWorthValue = document.getElementById("netWorthValue");
const netWorthChange = document.getElementById("netWorthChange");
const netWorthGoalsNode = document.getElementById("netWorthGoals");
const goalInput = document.getElementById("goalInput");
const addGoalBtn = document.getElementById("addGoalBtn");
const chartPath = document.getElementById("chartPath");
const rangeLabel = document.getElementById("rangeLabel");
const rangeChange = document.getElementById("rangeChange");
const notifications = document.getElementById("notifications");

function renderHeaderMetrics() {
  const planned = budgetGroups.reduce((sum, group) => sum + group.target, 0);
  const remaining = monthlyIncome - planned;
  const ratio = Math.min((planned / monthlyIncome) * 100, 100);

  incomeTotal.textContent = currency(monthlyIncome);
  plannedTotal.textContent = currency(planned);
  remainingTotal.textContent = currency(remaining);
  plannedBar.style.width = `${ratio}%`;

  if (remaining > 0) {
    goalHint.textContent = `${currency(remaining)} left to assign`;
    goalHint.className = "tag good";
  } else if (remaining === 0) {
    goalHint.textContent = "Fully assigned";
    goalHint.className = "tag";
  } else {
    goalHint.textContent = `${currency(Math.abs(remaining))} over-assigned`;
    goalHint.className = "tag warn";
  }
}

function renderBudgetGroups() {
  budgetGroupsNode.innerHTML = budgetGroups
    .map((group) => {
      const groupRatio = group.target > 0 ? Math.min((group.spent / group.target) * 100, 100) : 0;
      return `
        <article class="group-card">
          <div class="row-between">
            <h4>${group.name}</h4>
            <p><strong>${currency(group.spent)}</strong> / ${currency(group.target)}</p>
          </div>
          <div class="bar-track tight"><div class="bar-fill" style="width:${groupRatio}%"></div></div>
          <div class="line-items">
            ${group.lines
              .map(
                (line) => `
                <div class="line-row">
                  <span>${line.name}</span>
                  <span>${currency(line.spent)} / ${currency(line.planned)}</span>
                </div>
              `,
              )
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAccounts() {
  accountList.innerHTML = accounts
    .map((account) => {
      const className = account.balance < 0 ? "value-negative" : "value-positive";
      return `
        <article class="list-row">
          <div>
            <p class="row-title">${account.name}</p>
            <p class="row-sub">${account.type}</p>
          </div>
          <p class="${className}">${currency(account.balance)}</p>
        </article>
      `;
    })
    .join("");
}

function renderActivity() {
  transactionList.innerHTML = transactions
    .map((tx) => {
      const directionClass = tx.direction === "in" ? "value-positive" : "value-negative";
      const sign = tx.direction === "in" ? "+" : "-";
      return `
        <li class="activity-row">
          <div>
            <p class="row-title">${tx.name}</p>
            <p class="row-sub">${tx.category}</p>
          </div>
          <p class="${directionClass}">${sign}${currency(tx.amount)}</p>
        </li>
      `;
    })
    .join("");
}

function renderConnections() {
  connectionList.innerHTML = connectionProviders
    .map(
      (provider) => `
      <article class="connect-row">
        <div>
          <p class="row-title">${provider.name}</p>
          <p class="row-sub">${provider.details}</p>
        </div>
        <button class="small-btn ${connectionState[provider.id] ? "connected" : ""}" data-provider="${provider.id}">
          ${connectionState[provider.id] ? "Connected" : "Connect"}
        </button>
      </article>
    `,
    )
    .join("");

  document.querySelectorAll(".small-btn[data-provider]").forEach((button) => {
    button.addEventListener("click", () => {
      const providerId = button.dataset.provider;
      connectionState[providerId] = !connectionState[providerId];
      renderConnections();
      renderNotifications();
    });
  });
}

function renderNetWorth() {
  netWorthValue.textContent = currency(currentNetWorth);
  const oneDayChange = rangeSeries.day[rangeSeries.day.length - 1] - rangeSeries.day[0];
  const symbol = oneDayChange >= 0 ? "+" : "-";
  netWorthChange.textContent = `${symbol}${currency(Math.abs(oneDayChange))} today`;
  netWorthChange.className = oneDayChange >= 0 ? "tag good" : "tag warn";

  netWorthGoalsNode.innerHTML = netWorthGoals
    .sort((a, b) => a - b)
    .map((goal) => {
      const progress = Math.min((currentNetWorth / goal) * 100, 100);
      const remaining = Math.max(goal - currentNetWorth, 0);
      const completed = currentNetWorth >= goal;
      return `
        <article class="group-card">
          <div class="row-between">
            <h4>${currency(goal)} net worth goal</h4>
            <p>${completed ? "Reached" : `${currency(remaining)} to go`}</p>
          </div>
          <div class="bar-track tight"><div class="bar-fill" style="width:${progress}%"></div></div>
          <p class="row-sub">${Math.round(progress)}% complete</p>
        </article>
      `;
    })
    .join("");
}

function buildPath(values) {
  const width = 320;
  const height = 140;
  const padding = 12;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function renderChart() {
  const values = rangeSeries[activeRange];
  const change = values[values.length - 1] - values[0];
  chartPath.setAttribute("d", buildPath(values));
  chartPath.setAttribute("stroke", change >= 0 ? "#1b7b53" : "#b13a3a");

  const labels = {
    minute: "Per minute",
    hour: "Per hour",
    day: "Per day",
    "4hour": "Per 4 hours",
    "5day": "Per 5 days",
    month: "Per month",
    year: "Per year",
    ytd: "YTD",
  };

  rangeLabel.textContent = labels[activeRange];
  const sign = change >= 0 ? "+" : "-";
  rangeChange.textContent = `${sign}${currency(Math.abs(change))}`;
  rangeChange.className = change >= 0 ? "value-positive" : "value-negative";
}

function renderNotifications() {
  const connectedProviders = Object.entries(connectionState)
    .filter(([, isConnected]) => isConnected)
    .map(([id]) => connectionProviders.find((provider) => provider.id === id)?.name)
    .filter(Boolean);
  const connectionText = connectedProviders.length
    ? `${connectedProviders.join(" and ")} connected for sync.`
    : "No investment institutions connected yet. Connect Fidelity and Unibank to sync automatically.";

  const highestGoal = Math.max(...netWorthGoals);
  const highestGap = Math.max(highestGoal - currentNetWorth, 0);

  const notes = [
    connectionText,
    `Current net worth is ${currency(currentNetWorth)}. Remaining to your top goal (${currency(highestGoal)}): ${currency(highestGap)}.`,
    `You can monitor trend moves by minute, hour, day, 4-hour, 5-day, month, year, and YTD in Investments.`,
  ];

  notifications.innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
}

function setupViewSwitching() {
  document.querySelectorAll(".segment-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".segment-btn.active")?.classList.remove("active");
      button.classList.add("active");

      const view = button.dataset.view;
      document.querySelectorAll(".view").forEach((panel) => {
        panel.classList.add("hidden-view");
        panel.classList.remove("active-view");
      });

      const activePanel = document.getElementById(`${view}View`);
      activePanel.classList.remove("hidden-view");
      activePanel.classList.add("active-view");
    });
  });
}

function setupRangeSwitching() {
  document.querySelectorAll(".range-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".range-btn.active")?.classList.remove("active");
      button.classList.add("active");
      activeRange = button.dataset.range;
      renderChart();
    });
  });
}

function setupGoalCreation() {
  addGoalBtn.addEventListener("click", () => {
    const goal = Number(goalInput.value);
    if (!goal || goal <= 0) return;
    netWorthGoals.push(goal);
    goalInput.value = "";
    renderNetWorth();
    renderNotifications();
  });
}

function renderAll() {
  renderHeaderMetrics();
  renderBudgetGroups();
  renderAccounts();
  renderActivity();
  renderConnections();
  renderNetWorth();
  renderChart();
  renderNotifications();
}

setupViewSwitching();
setupRangeSwitching();
setupGoalCreation();
renderAll();
