import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

const mockUser = {
  username: 'Ariel',
  id: 'someId',
  password: 'somePassword',
  tasks: [],
};

const mockTasks: Task[] = [
  {
    id: '6e11b7c3-2b9c-46d3-a82e-cbd6a745b38c',
    title: 'Testing',
    description: 'Testing',
    status: TaskStatus.OPEN,
    user: mockUser,
  },
];

const mockTask: Task = {
  id: '6e11b7c3-2b9c-46d3-a82e-cbd6a745b38c',
  title: 'Testing',
  description: 'Testing',
  status: TaskStatus.OPEN,
  user: mockUser,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: Repository<Task>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            getTasks: jest.fn(),
            findOne: jest.fn(),
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      //   tasksRepository.getTasks.mockResolvedValue('someValue');
      jest.spyOn(tasksRepository, 'findBy').mockResolvedValue(mockTasks);
      const result = await tasksService.getTasks(
        { status: TaskStatus.OPEN },
        mockUser,
      );
      const expectedValue = [
        {
          description: 'Testing',
          id: '6e11b7c3-2b9c-46d3-a82e-cbd6a745b38c',
          status: 'OPEN',
          title: 'Testing',
          user: {
            id: 'someId',
            password: 'somePassword',
            tasks: [],
            username: 'Ariel',
          },
        },
      ];
      expect(result).toEqual(expectedValue);
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      const expectedValue = {
        description: 'Testing',
        id: '6e11b7c3-2b9c-46d3-a82e-cbd6a745b38c',
        status: 'OPEN',
        title: 'Testing',
        user: {
          id: 'someId',
          password: 'somePassword',
          tasks: [],
          username: 'Ariel',
        },
      };
      //   tasksRepository.findOne.mockResolvedValue(mockTask);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask);
      const mockTaskId = '6e11b7c3-2b9c-46d3-a82e-cbd6a745b38c';
      const result = await tasksService.getTaskById(mockTaskId, mockUser);
      expect(result).toEqual(expectedValue);
    });
  });

  it('calls TasksRepository.findOne and handles an error', async () => {
    // tasksRepository.findOne.mockResolvedValue(null);
    jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(null);
    expect(tasksService.getTaskById('someId', mockUser)).rejects.toThrow(
      NotFoundException,
    );
  });
});
