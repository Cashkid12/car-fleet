const Car = require('../models/Car');
const Activity = require('../models/Activity');

// GET reports summary
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    let totalIncome = 0, totalExpenses = 0;

    cars.forEach(car => {
      totalIncome += car.incomeHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .reduce((s, e) => s + e.amount, 0);
      totalExpenses += car.expenseHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .reduce((s, e) => s + e.cost, 0);
      totalExpenses += car.damageHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .reduce((s, e) => s + (e.actualCost || e.estimatedCost || 0), 0);
    });

    const activeCars = cars.filter(c => c.status === 'healthy').length;
    const damagedCars = cars.filter(c => c.status === 'damaged').length;
    const totalCars = cars.length;

    res.json({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
      activeCars,
      damagedCars,
      totalCars,
      avgIncomePerCar: totalCars > 0 ? Math.round(totalIncome / totalCars) : 0,
      avgExpensePerCar: totalCars > 0 ? Math.round(totalExpenses / totalCars) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET chart data
exports.getCharts = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const chartData = [];
    let periods = 12;
    if (period === 'daily') periods = 30;
    if (period === 'weekly') periods = 12;

    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date();
      let start, end, label;

      if (period === 'daily') {
        d.setDate(d.getDate() - i);
        start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        label = d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
      } else if (period === 'weekly') {
        d.setDate(d.getDate() - (i * 7));
        start = new Date(d);
        start.setDate(start.getDate() - start.getDay());
        end = new Date(start);
        end.setDate(end.getDate() + 7);
        label = `${start.toLocaleDateString('en', { day: 'numeric', month: 'short' })}`;
      } else {
        d.setMonth(d.getMonth() - i);
        start = new Date(d.getFullYear(), d.getMonth(), 1);
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        label = d.toLocaleDateString('en', { month: 'short' });
      }

      let income = 0, expenses = 0;
      cars.forEach(car => {
        income += car.incomeHistory.filter(e => { const ed = new Date(e.date); return ed >= start && ed <= end; }).reduce((s, e) => s + e.amount, 0);
        expenses += car.expenseHistory.filter(e => { const ed = new Date(e.date); return ed >= start && ed <= end; }).reduce((s, e) => s + e.cost, 0);
        expenses += car.damageHistory.filter(e => { const ed = new Date(e.date); return ed >= start && ed <= end; }).reduce((s, e) => s + (e.actualCost || e.estimatedCost || 0), 0);
      });

      chartData.push({ label, income, expenses, profit: income - expenses });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET vehicle performance
exports.getVehiclePerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const vehicleStats = cars.map(car => {
      const income = car.incomeHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .reduce((s, e) => s + e.amount, 0);
      const expenses = car.expenseHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .reduce((s, e) => s + e.cost, 0) +
        car.damageHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .reduce((s, e) => s + (e.actualCost || e.estimatedCost || 0), 0);

      return {
        _id: car._id,
        plateNumber: car.plateNumber,
        driverName: car.driverName,
        income,
        expenses,
        profit: income - expenses,
        profitMargin: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0,
        status: car.status
      };
    });

    const sorted = vehicleStats.sort((a, b) => b.profit - a.profit);
    const best = sorted.slice(0, 5);
    const lowest = [...sorted].reverse().slice(0, 5);

    res.json({ best, lowest, all: sorted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET expense breakdown
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const categories = {};
    let totalExpenses = 0;

    cars.forEach(car => {
      car.expenseHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .forEach(e => {
          categories[e.type] = (categories[e.type] || 0) + e.cost;
          totalExpenses += e.cost;
        });
      car.damageHistory
        .filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
        .forEach(e => {
          categories['repair'] = (categories['repair'] || 0) + (e.actualCost || e.estimatedCost || 0);
          totalExpenses += (e.actualCost || e.estimatedCost || 0);
        });
    });

    const breakdown = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({ breakdown, totalExpenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET business insights
exports.getInsights = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const insights = [];

    // Monthly comparison
    let thisMonthIncome = 0, lastMonthIncome = 0;
    let thisMonthExpenses = 0, lastMonthExpenses = 0;

    cars.forEach(car => {
      thisMonthIncome += car.incomeHistory.filter(e => new Date(e.date) >= thisMonth).reduce((s, e) => s + e.amount, 0);
      lastMonthIncome += car.incomeHistory.filter(e => { const d = new Date(e.date); return d >= lastMonth && d <= lastMonthEnd; }).reduce((s, e) => s + e.amount, 0);
      thisMonthExpenses += car.expenseHistory.filter(e => new Date(e.date) >= thisMonth).reduce((s, e) => s + e.cost, 0);
      lastMonthExpenses += car.expenseHistory.filter(e => { const d = new Date(e.date); return d >= lastMonth && d <= lastMonthEnd; }).reduce((s, e) => s + e.cost, 0);
    });

    if (lastMonthIncome > 0) {
      const incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1);
      insights.push({
        type: incomeChange >= 0 ? 'positive' : 'negative',
        message: `Income ${incomeChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(incomeChange)}% compared to last month.`
      });
    }

    if (lastMonthExpenses > 0) {
      const expenseChange = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1);
      insights.push({
        type: expenseChange <= 0 ? 'positive' : 'negative',
        message: `Expenses ${expenseChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(expenseChange)}% compared to last month.`
      });
    }

    // Best vehicle
    let bestVehicle = null, bestProfit = -Infinity;
    cars.forEach(car => {
      const income = car.incomeHistory.filter(e => new Date(e.date) >= thisMonth).reduce((s, e) => s + e.amount, 0);
      const expenses = car.expenseHistory.filter(e => new Date(e.date) >= thisMonth).reduce((s, e) => s + e.cost, 0) +
        car.damageHistory.filter(e => new Date(e.date) >= thisMonth).reduce((s, e) => s + (e.actualCost || e.estimatedCost || 0), 0);
      const profit = income - expenses;
      if (profit > bestProfit) { bestProfit = profit; bestVehicle = car; }
    });

    if (bestVehicle) {
      insights.push({
        type: 'positive',
        message: `${bestVehicle.plateNumber} is your best performing vehicle this month with KES ${bestProfit.toLocaleString()} profit.`
      });
    }

    // Most damaged
    let mostDamaged = null, mostDamageCost = 0;
    cars.forEach(car => {
      const damageCost = car.damageHistory.filter(e => new Date(e.date) >= thisMonth).reduce((s, e) => s + (e.actualCost || e.estimatedCost || 0), 0);
      if (damageCost > mostDamageCost) { mostDamageCost = damageCost; mostDamaged = car; }
    });

    if (mostDamaged && mostDamageCost > 0) {
      insights.push({
        type: 'warning',
        message: `${mostDamaged.plateNumber} has the highest repair costs this month at KES ${mostDamageCost.toLocaleString()}.`
      });
    }

    // Average daily income
    const daysInMonth = now.getDate();
    const avgDaily = thisMonthIncome > 0 ? Math.round(thisMonthIncome / daysInMonth) : 0;
    if (avgDaily > 0) {
      insights.push({
        type: 'info',
        message: `Your average daily income this month is KES ${avgDaily.toLocaleString()}.`
      });
    }

    // Fleet health
    const healthy = cars.filter(c => c.status === 'healthy').length;
    if (cars.length > 0) {
      insights.push({
        type: healthy === cars.length ? 'positive' : 'warning',
        message: `${healthy} out of ${cars.length} vehicles are healthy.${healthy < cars.length ? ' Some vehicles need attention.' : ''}`
      });
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET income analysis
exports.getIncomeAnalysis = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    let totalIncome = 0, monthlyIncome = 0, yearlyIncome = 0;
    let dailyIncomes = [];

    cars.forEach(car => {
      car.incomeHistory.forEach(e => {
        const d = new Date(e.date);
        totalIncome += e.amount;
        if (d >= thisMonth) monthlyIncome += e.amount;
        if (d >= thisYear) yearlyIncome += e.amount;
        dailyIncomes.push({ date: d.toISOString().split('T')[0], amount: e.amount });
      });
    });

    const dailyMap = {};
    dailyIncomes.forEach(d => {
      dailyMap[d.date] = (dailyMap[d.date] || 0) + d.amount;
    });

    const dailyEntries = Object.entries(dailyMap).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const highestDay = dailyEntries.length > 0 ? dailyEntries.reduce((a, b) => a[1] > b[1] ? a : b) : null;
    const lowestDay = dailyEntries.length > 0 ? dailyEntries.reduce((a, b) => a[1] < b[1] ? a : b) : null;
    const daysWithIncome = dailyEntries.length;
    const avgDaily = daysWithIncome > 0 ? Math.round(monthlyIncome / daysWithIncome) : 0;

    res.json({
      totalIncome,
      monthlyIncome,
      yearlyIncome,
      avgDailyIncome: avgDaily,
      highestIncomeDay: highestDay ? { date: highestDay[0], amount: highestDay[1] } : null,
      lowestIncomeDay: lowestDay ? { date: lowestDay[0], amount: lowestDay[1] } : null,
      totalEntries: dailyIncomes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};