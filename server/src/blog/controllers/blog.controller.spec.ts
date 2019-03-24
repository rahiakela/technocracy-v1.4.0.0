import { Test } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import {BlogService} from '../services/blog.service';

describe('Blog Controller', () => {
  let blogController: BlogController;
  let blogService: BlogService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [BlogService],
    }).compile();

    blogService = module.get<BlogService>(BlogService);
    blogController = module.get<BlogController>(BlogController);
  });

  describe('getAllPublishedBlog', () => {
    it('should return an array of blogs', async () => {
      const result = [];
      jest.spyOn(blogService, 'getAllPublishedBlog').mockImplementation(() => result);

      expect(await blogController.getAllPublishedBlog(0)).toBe(result);
    });
  });

});
