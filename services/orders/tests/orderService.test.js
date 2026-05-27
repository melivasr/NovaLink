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

test('checkout with empty items array should throw status 400', async () => {
  await expect(orderService.checkout(1, [])).rejects.toMatchObject({ status: 400 });
});

test('checkout with null items should throw status 400', async () => {
  await expect(orderService.checkout(1, null)).rejects.toMatchObject({ status: 400 });
});

test('checkout with item missing skillId should throw status 400', async () => {
  await expect(orderService.checkout(1, [{ quantity: 1 }])).rejects.toMatchObject({ status: 400 });
});

test('checkout with valid data should publish orden.creada event', async () => {
  await orderService.checkout(1, [{ skillId: 5, quantity: 2 }]);
  expect(publish).toHaveBeenCalledWith('orden.creada', expect.objectContaining({ userId: 1 }));
});

test('checkout should include issued_by in orden.creada event', async () => {
  await orderService.checkout(1, [{ skillId: 5, quantity: 2 }], { issued_by: 'auth-service' });
  expect(publish).toHaveBeenCalledWith('orden.creada', expect.objectContaining({ issued_by: 'auth-service' }));
});

test('checkout with valid data should return status Procesando', async () => {
  const result = await orderService.checkout(1, [{ skillId: 5, quantity: 2 }]);
  expect(result.status).toBe('Procesando');
});

test('getOrderById with non-existent id should throw status 404', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue(null);
  await expect(orderService.getOrderById(99)).rejects.toMatchObject({ status: 404 });
});