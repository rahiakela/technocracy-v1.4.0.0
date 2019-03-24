import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';

describe('Question Controller', () => {
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [QuestionController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: QuestionController = module.get<QuestionController>(QuestionController);
    expect(controller).toBeDefined();
  });
});
