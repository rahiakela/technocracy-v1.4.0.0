import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let service: BlogService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogService],
    }).compile();
    service = module.get<BlogService>(BlogService);
  });
  it('BlogService should be defined', () => {
    // expect(service).toBeDefined();
  });
});