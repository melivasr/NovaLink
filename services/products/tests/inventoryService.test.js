jest.mock('../repositories/inventoryRepository');

const InventoryService = require('../services/inventoryService');
const InventoryRepository = require('../repositories/inventoryRepository');

let service;
let mockRepo;

beforeEach(() => {
  InventoryRepository.mockClear();
  service = new InventoryService();
  mockRepo = InventoryRepository.mock.instances[0];
});

test('getSkillById with non-existent id should throw status 404', async () => {
  mockRepo.findById = jest.fn().mockResolvedValue(null);
  await expect(service.getSkillById(99)).rejects.toMatchObject({ status: 404 });
});

test('getSkillById with valid id should return skill', async () => {
  const skill = { id: 1, name: 'Comunicación', stock: 10, xp_points: 100 };
  mockRepo.findById = jest.fn().mockResolvedValue(skill);
  const result = await service.getSkillById(1);
  expect(result.name).toBe('Comunicación');
});

test('createSkill with missing difficulty should throw status 400', async () => {
  await expect(service.createSkill({ name: 'Liderazgo', stock: 5, points: 100, price: 50 }))
    .rejects.toMatchObject({ status: 400 });
});

test('createSkill with missing stock should throw status 400', async () => {
  await expect(service.createSkill({ name: 'Liderazgo', difficulty: 'Media', points: 100, price: 50 }))
    .rejects.toMatchObject({ status: 400 });
});

test('createSkill with valid data should return created skill', async () => {
  const created = { id: 1, name: 'Liderazgo', difficulty: 'Media', stock: 5, xp_points: 200, price: 100 };
  mockRepo.create = jest.fn().mockResolvedValue(created);
  const result = await service.createSkill({ name: 'Liderazgo', difficulty: 'Media', stock: 5, points: 200, price: 100 });
  expect(result.name).toBe('Liderazgo');
});

test('deleteSkill with non-existent id should throw status 404', async () => {
  mockRepo.delete = jest.fn().mockResolvedValue(false);
  await expect(service.deleteSkill(99)).rejects.toMatchObject({ status: 404 });
});
