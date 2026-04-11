const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = require('./app');

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Roadmap API running on port ${PORT}`);
});
