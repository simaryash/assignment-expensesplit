const express = require('express');
const app = express();

const data = require('./data');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});
function addBalance(from, to, amount) {
  if (!data.balances[from][to]) {
    data.balances[from][to] = 0;
  }
  data.balances[from][to] += amount;
}

app.post('/users', (req, res) => {
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: 'userId and name required' });
  }

  data.users[userId] = { userId, name };
  data.balances[userId] = {};

  res.json({
    message: 'User created',
    user: data.users[userId]
  });
});
// CREATE GROUP
app.post('/groups', (req, res) => {
  const { groupId, name, members } = req.body;

  if (!groupId || !name || !members) {
    return res.status(400).json({
      error: 'groupId, name and members are required'
    });
  }

  // Validate members
  for (let userId of members) {
    if (!data.users[userId]) {
      return res.status(400).json({
        error: `User ${userId} does not exist`
      });
    }
  }

  data.groups[groupId] = {
    groupId,
    name,
    members
  };

  res.json({
    message: 'Group created',
    group: data.groups[groupId]
  });
});
// ADD EXPENSE (EQUAL / EXACT / PERCENT)
app.post('/expenses', (req, res) => {
  const { groupId, paidBy, amount, splitType, splits } = req.body;

  const group = data.groups[groupId];
  if (!group) {
    return res.status(400).json({ error: 'Group not found' });
  }

  if (!group.members.includes(paidBy)) {
    return res.status(400).json({ error: 'Payer not in group' });
  }

  // -------- EQUAL SPLIT --------
  if (splitType === 'EQUAL') {
    const share = Number((amount / group.members.length).toFixed(2));

    group.members.forEach(userId => {
      if (userId !== paidBy) {
        addBalance(userId, paidBy, share);
      }
    });

    return res.json({
      message: 'Expense added (equal split)',
      share
    });
  }

  // -------- EXACT SPLIT --------
  if (splitType === 'EXACT') {
    let total = 0;
    splits.forEach(s => total += s.amount);

    if (total !== amount) {
      return res.status(400).json({
        error: 'Exact split total does not match amount'
      });
    }

    splits.forEach(s => {
      if (s.user !== paidBy) {
        addBalance(s.user, paidBy, s.amount);
      }
    });

    return res.json({
      message: 'Expense added (exact split)'
    });
  }

  // -------- PERCENT SPLIT --------
  if (splitType === 'PERCENT') {
    let percentTotal = 0;
    splits.forEach(s => percentTotal += s.percent);

    if (percentTotal !== 100) {
      return res.status(400).json({
        error: 'Percent total must be 100'
      });
    }

    splits.forEach(s => {
      const share = Number(((s.percent / 100) * amount).toFixed(2));
      if (s.user !== paidBy) {
        addBalance(s.user, paidBy, share);
      }
    });

    return res.json({
      message: 'Expense added (percent split)'
    });
  }

  return res.status(400).json({ error: 'Invalid split type' });
});

// SETTLE DUES
app.post('/settle', (req, res) => {
  const { from, to, amount } = req.body;

  if (!data.balances[from] || !data.balances[from][to]) {
    return res.status(400).json({ error: 'No balance exists' });
  }

  data.balances[from][to] -= amount;

  if (data.balances[from][to] <= 0) {
    delete data.balances[from][to];
  }

  res.json({ message: 'Settlement successful' });
});

  

// VIEW USER BALANCES
app.get('/users/:userId/balances', (req, res) => {
  const { userId } = req.params;

  if (!data.users[userId]) {
    return res.status(400).json({ error: 'User not found' });
  }

  const owes = data.balances[userId] || {};
  const owedBy = {};

  for (let from in data.balances) {
    if (data.balances[from][userId]) {
      owedBy[from] = data.balances[from][userId];
    }
  }

  res.json({
    user: userId,
    owes,
    owedBy
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
