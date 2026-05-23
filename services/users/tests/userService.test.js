jest.mock('../repositories/userRepository');
jest.mock('../events/broker', () => ({ publish: jest.fn().mockResolvedValue() }));

const UserService = require('../services/userService');
const UserRepository = require('../repositories/userRepository');
const { publish } = require('../events/broker');

let service;
let mockRepo;

beforeEach(() => {
  UserRepository.mockClear();
  service = new UserService();
  mockRepo = UserRepository.mock.instances[0];
});

test('createUser with missing name should throw status 400', async () => {
  await expect(service.createUser({ email: 'test@test.com', password: '123' }))
    .rejects.toMatchObject({ status: 400 });
});

test('createUser with missing email should throw status 400', async () => {
  await expect(service.createUser({ name: 'Ana', password: '123' }))
    .rejects.toMatchObject({ status: 400 });
});

test('createUser with invalid email format should throw status 400', async () => {
  await expect(service.createUser({ name: 'Ana', email: 'noesemail', password: '123' }))
    .rejects.toMatchObject({ status: 400 });
});

test('createUser with valid data should publish usuario.registrado', async () => {
  const result = await service.createUser({ name: 'Ana', email: 'ana@test.com', password: 'pass123' });
  expect(publish).toHaveBeenCalledWith('usuario.registrado', expect.objectContaining({ name: 'Ana', email: 'ana@test.com' }));
  expect(result.message).toBeDefined();
});

test('getUserById with non-existent id should throw status 404', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue(null);
  await expect(service.getUserById(99)).rejects.toMatchObject({ status: 404 });
});

test('getUserById with valid id should return user', async () => {
  const user = { id: 1, name: 'Ana', email: 'ana@test.com' };
  mockRepo.findById = jest.fn().mockResolvedValue(user);
  const result = await service.getUserById(1);
  expect(result.id).toBe(1);
});

test('addSkillToUser without skillId should throw status 400', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue({ id: 1 });
  await expect(service.addSkillToUser(1, {})).rejects.toMatchObject({ status: 400 });
});

test('addSkillToUser with non-existent user should throw status 404', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue(null);
  await expect(service.addSkillToUser(99, { skillId: 5 })).rejects.toMatchObject({ status: 404 });
});
