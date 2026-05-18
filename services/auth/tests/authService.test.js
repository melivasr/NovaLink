jest.mock('../repositories/userRepository');

const bcryptjs = require('bcryptjs');
const AuthService = require('../services/authService');
const UserRepository = require('../repositories/userRepository');

let service;
let mockRepo;

beforeEach(() => {
  UserRepository.mockClear();
  service = new AuthService();
  mockRepo = UserRepository.mock.instances[0];
});

test('login with empty email should throw status 400', async () => {
  await expect(service.login('', 'password')).rejects.toMatchObject({ status: 400 });
});

test('login with empty password should throw status 400', async () => {
  await expect(service.login('test@test.com', '')).rejects.toMatchObject({ status: 400 });
});

test('login with non-existent email should throw status 401', async () => {
  mockRepo.findByEmail = jest.fn().mockResolvedValue(null);
  await expect(service.login('noexiste@test.com', 'pass')).rejects.toMatchObject({ status: 401 });
});

test('login with wrong password should throw status 401', async () => {
  const hash = await bcryptjs.hash('correct', 10);
  mockRepo.findByEmail = jest.fn().mockResolvedValue({
    id: 1, name: 'Test', email: 'test@test.com', password_hash: hash, is_admin: false
  });
  await expect(service.login('test@test.com', 'wrong')).rejects.toMatchObject({ status: 401 });
});

test('login with valid credentials should return user and token', async () => {
  const hash = await bcryptjs.hash('secret', 10);
  mockRepo.findByEmail = jest.fn().mockResolvedValue({
    id: 1, name: 'Ana', email: 'ana@test.com', password_hash: hash, is_admin: false
  });
  const result = await service.login('ana@test.com', 'secret');
  expect(result).toHaveProperty('token');
  expect(result.user.email).toBe('ana@test.com');
});
