jest.mock('../repositories/orderRepository');
jest.mock('../events/broker', () => ({
  publish: jest.fn().mockResolvedValue(undefined)
}));

const orderService = require('../services/orderService');
const OrderRepository = require('../repositories/orderRepository');
const { publish } = require('../events/broker');

const mockRepo = OrderRepository.mock.instances[0];

beforeEach(() => {
  publish.mockClear();
});

test('createOrder with empty items array should throw status 400', async () => {
  await expect(orderService.createOrder(1, [])).rejects.toMatchObject({ status: 400 });
});

test('createOrder with null items should throw status 400', async () => {
  await expect(orderService.createOrder(1, null)).rejects.toMatchObject({ status: 400 });
});

test('createOrder with item missing skillId should throw status 400', async () => {
  await expect(orderService.createOrder(1, [{ quantity: 1 }])).rejects.toMatchObject({ status: 400 });
});

test('createOrder with valid data should return order with status Pendiente', async () => {
  const order = { id: 10, user_id: 1, status: 'Pendiente', created_at: new Date() };
  mockRepo.create = jest.fn().mockResolvedValue(order);
  const result = await orderService.createOrder(1, [{ skillId: 5, quantity: 2 }]);
  expect(result.id).toBe(10);
  expect(result.status).toBe('Pendiente');
});

test('checkoutOrder with non-existent id should throw status 404', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue(null);
  await expect(orderService.checkoutOrder(99)).rejects.toMatchObject({ status: 404 });
});

test('checkoutOrder with already completed order should throw status 400', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue({ id: 1, status: 'Completada', items: [] });
  await expect(orderService.checkoutOrder(1)).rejects.toMatchObject({ status: 400 });
});

test('checkoutOrder with valid pending order should publish pedido.creado event', async () => {
  const order = { id: 1, user_id: 2, status: 'Pendiente', items: [{ skillId: 5, quantity: 1 }] };
  mockRepo.findById = jest.fn().mockResolvedValue(order);
  mockRepo.updateStatus = jest.fn().mockResolvedValue({ ...order, status: 'Procesando' });
  await orderService.checkoutOrder(1);
  expect(publish).toHaveBeenCalledWith('pedido.creado', expect.objectContaining({ orderId: 1 }));
});

test('checkoutOrder should include issued_by in pedido.creado event', async () => {
  const order = { id: 1, user_id: 2, status: 'Pendiente', items: [{ skillId: 5, quantity: 1 }] };
  mockRepo.findById = jest.fn().mockResolvedValue(order);
  mockRepo.updateStatus = jest.fn().mockResolvedValue({ ...order, status: 'Procesando' });
  await orderService.checkoutOrder(1, { issued_by: 'auth-service' });
  expect(publish).toHaveBeenCalledWith('pedido.creado', expect.objectContaining({ issued_by: 'auth-service' }));
});

test('checkoutOrder with valid pending order should return status Procesando', async () => {
  const order = { id: 1, user_id: 2, status: 'Pendiente', items: [{ skillId: 5, quantity: 1 }] };
  mockRepo.findById = jest.fn().mockResolvedValue(order);
  mockRepo.updateStatus = jest.fn().mockResolvedValue({ ...order, status: 'Procesando' });
  const result = await orderService.checkoutOrder(1);
  expect(result.status).toBe('Procesando');
});

test('getOrderById with non-existent id should throw status 404', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue(null);
  await expect(orderService.getOrderById(99)).rejects.toMatchObject({ status: 404 });
});
