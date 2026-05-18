jest.mock('../repositories/notificationRepository');

const NotificationService = require('../services/notificationService');
const NotificationRepository = require('../repositories/notificationRepository');

let service;
let mockRepo;

beforeEach(() => {
  NotificationRepository.mockClear();
  service = new NotificationService();
  mockRepo = NotificationRepository.mock.instances[0];
});

test('createNotification without userId should throw status 400', async () => {
  await expect(service.createNotification({ message: 'Hola' }))
    .rejects.toMatchObject({ status: 400 });
});

test('createNotification without message should throw status 400', async () => {
  await expect(service.createNotification({ userId: 1 }))
    .rejects.toMatchObject({ status: 400 });
});

test('createNotification with valid data should return notification with userId and message', async () => {
  const row = { id: 1, user_id: 1, order_id: 2, message: 'Completado', is_read: false, created_at: new Date() };
  mockRepo.create = jest.fn().mockResolvedValue(row);
  const result = await service.createNotification({ userId: 1, orderId: 2, message: 'Completado' });
  expect(result.userId).toBe(1);
  expect(result.message).toBe('Completado');
});

test('markAsRead with non-existent id should throw status 404', async () => {
  mockRepo.markAsRead = jest.fn().mockResolvedValue(null);
  await expect(service.markAsRead(99)).rejects.toMatchObject({ status: 404 });
});

test('markAsRead with valid id should return notification with read true', async () => {
  const row = { id: 1, user_id: 1, order_id: null, message: 'Hola', is_read: true, created_at: new Date() };
  mockRepo.markAsRead = jest.fn().mockResolvedValue(row);
  const result = await service.markAsRead(1);
  expect(result.read).toBe(true);
});
