const amqp = require('amqplib');

const EXCHANGE = 'novalink';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://novalink:novalink_pass@localhost:5672';

let _channel = null;

async function connect() {
  const conn = await amqp.connect(RABBITMQ_URL);
  _channel = await conn.createChannel();
  await _channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  conn.on('close', () => { _channel = null; });
  console.log('[broker] Connected to RabbitMQ');
}

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await connect();
      return;
    } catch (err) {
      console.log(`[broker] Attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('[broker] Could not connect to RabbitMQ after multiple attempts');
}

async function getChannel() {
  if (!_channel) await connect();
  return _channel;
}

async function publish(routingKey, payload) {
  const ch = await getChannel();
  ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
  console.log(`[broker] Published → ${routingKey}`);
}

async function subscribe(queue, routingKey, handler) {
  const ch = await getChannel();
  await ch.assertQueue(queue, { durable: true });
  await ch.bindQueue(queue, EXCHANGE, routingKey);
  await ch.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      await handler(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch (err) {
      console.error(`[broker] Error in ${queue}:`, err.message);
      ch.nack(msg, false, false);
    }
  });
  console.log(`[broker] Subscribed ${queue} → ${routingKey}`);
}

module.exports = { publish, subscribe, connectWithRetry };
