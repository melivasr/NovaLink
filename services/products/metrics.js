const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de requests HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP recibidos',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const skillsQueriedTotal = new client.Counter({
  name: 'skills_queried_total',
  help: 'Total de consultas de habilidades',
  registers: [register],
});

const skillsCreatedTotal = new client.Counter({
  name: 'skills_created_total',
  help: 'Total de habilidades creadas',
  registers: [register],
});

module.exports = { register, httpRequestDuration, httpRequestsTotal, skillsQueriedTotal, skillsCreatedTotal };
