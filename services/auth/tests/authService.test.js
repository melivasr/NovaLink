jest.mock('../repositories/userRepository');

const bcryptjs = require('bcryptjs');
const AuthService = require('../services/authService');
const UserRepository = require('../repositories/userRepository');

describe('AuthService', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    UserRepository.mockClear();
    service = new AuthService();
    mockRepo = UserRepository.mock.instances[0];
  });

  it('throws 400 when email is missing', async () => {
    await expect(service.login('', 'password')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 400 when password is missing', async () => {
    await expect(service.login('test@test.com', '')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 401 when user is not found', async () => {
    mockRepo.findByEmail = jest.fn().mockResolvedValue(null);
    await expect(service.login('noexiste@test.com', 'pass')).rejects.toMatchObject({ status: 401 });
  });

  it('throws 401 when password does not match', async () => {
    const hash = await bcryptjs.hash('correct', 10);
    mockRepo.findByEmail = jest.fn().mockResolvedValue({
      id: 1, name: 'Test', email: 'test@test.com', password_hash: hash, is_admin: false
    });
    await expect(service.login('test@test.com', 'wrong')).rejects.toMatchObject({ status: 401 });
  });

  it('returns user and token on valid credentials', async () => {
    const hash = await bcryptjs.hash('secret', 10);
    mockRepo.findByEmail = jest.fn().mockResolvedValue({
      id: 1, name: 'Ana', email: 'ana@test.com', password_hash: hash, is_admin: false
    });
    const result = await service.login('ana@test.com', 'secret');
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('ana@test.com');
  });
});
