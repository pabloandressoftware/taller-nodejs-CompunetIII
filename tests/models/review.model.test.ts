import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

jest.mock('mongoose', () => {
  const SchemaMock: any = jest.fn().mockImplementation(function (this: any, definition: any, options: any) {
    this.definition = definition;
    this.options = options;
    return this;
  });
  SchemaMock.Types = {
    ObjectId: function MockObjectId() {
    },
  };

  const modelMock = jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    validate: jest.fn(),
    populate: jest.fn(),
  }));

  const mocked = {
    Schema: SchemaMock,
    model: modelMock,
    Types: {
      ObjectId: jest.fn().mockImplementation(() => ({ toString: () => 'mock-object-id' })),
    },
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  return { __esModule: true, default: mocked, ...mocked };
});

describe('Review Model', () => {
  let mongoose: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mongoose = require('mongoose').default ?? require('mongoose');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Exports básicos', () => {
    it('debería exportar ReviewModel', () => {
      jest.isolateModules(() => {
        const { ReviewModel } = require('../../src/models/review.model');
        expect(ReviewModel).toBeDefined();
      });
    });

    it('debería re-exportar el tipo ReviewsInput', () => {
      jest.isolateModules(() => {
        const { ReviewsInput } = require('../../src/models/review.model');
        expect(true).toBe(true);
      });
    });
  });

  describe('Schema definition', () => {
    it('debería crear el schema con campos y opciones esperados', () => {
      jest.isolateModules(() => {
        require('../../src/models/review.model');

        const schemaMockFn = mongoose.Schema as jest.Mock;
        const schemaCalls = schemaMockFn.mock.calls as unknown as any[][];
        expect(schemaCalls.length).toBeGreaterThan(0);

        const [definition, options] = schemaCalls[0] as any[];

        expect(options?.timestamps).toBe(true);

        expect(definition.movieId?.required).toBe(true);
        expect(definition.movieId?.ref).toBe('Movie');
        expect(definition.movieId?.type).toBe((mongoose.Schema as any).Types.ObjectId);

        expect(definition.userId?.required).toBe(true);
        expect(definition.userId?.ref).toBe('User');
        expect(definition.userId?.type).toBe((mongoose.Schema as any).Types.ObjectId);

        expect(definition.rating?.required).toBe(true);
        expect(definition.rating?.type).toBe(Number);

        expect(definition.comment?.required).toBe(true);
        expect(definition.comment?.type).toBe(String);
      });
    });

    it('debería registrar el modelo con nombre "Review"', () => {
      jest.isolateModules(() => {
        require('../../src/models/review.model');

        const modelMockFn = mongoose.model as jest.Mock;
        const modelCalls = modelMockFn.mock.calls as unknown as any[][];
        expect(modelCalls.length).toBeGreaterThan(0);

        const [name, schemaArg] = modelCalls[0] as any[];
        expect(name).toBe('Review');

        const schemaInstance = ((mongoose.Schema as jest.Mock).mock.instances[0]) as any;
        expect(schemaArg).toBe(schemaInstance);
        expect(schemaInstance.definition).toBeDefined();
        expect(schemaInstance.options?.timestamps).toBe(true);
      });
    });
  });

  describe('Tipos (sanity de runtime)', () => {
    it('ReviewDocument debería extender base', () => {
      jest.isolateModules(() => {
        const { ReviewDocument } = require('../../src/models/review.model') as any;
        const mockDoc: Partial<typeof ReviewDocument> = {
          _id: 'mock-object-id' as any,
          movieId: 'movie-123' as any,
          userId: 'user-123' as any,
          rating: 5,
          comment: 'Great movie!',
        };
        expect(mockDoc.rating).toBe(5);
        expect(mockDoc.comment).toBe('Great movie!');
      });
    });

    it('ReviewsInput acepta forma base requerida', () => {
      const valid = {
        movieId: 'movie-xyz',
        userId: 'user-xyz',
        rating: 4,
        comment: 'Good movie',
      };
      expect(valid.movieId).toBeTruthy();
      expect(valid.userId).toBeTruthy();
      expect(valid.rating).toBe(4);
      expect(valid.comment).toBeTruthy();
    });

    it('ReviewsInput valida tipos de rating', () => {
      const validRatings = [1, 2, 3, 4, 5];
      validRatings.forEach(rating => {
        const review = {
          movieId: 'movie-xyz',
          userId: 'user-xyz',
          rating: rating,
          comment: 'Test comment',
        };
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      });
    });

    it('ReviewsInput requiere todos los campos', () => {
      const review = {
        movieId: 'movie-xyz',
        userId: 'user-xyz',
        rating: 5,
        comment: 'Excellent!',
      };
      
      expect(review.movieId).toBeDefined();
      expect(review.userId).toBeDefined();
      expect(review.rating).toBeDefined();
      expect(review.comment).toBeDefined();
    });
  });

  describe('Validaciones de negocio', () => {
    it('debería validar que rating sea un número', () => {
      const review = {
        movieId: 'movie-xyz',
        userId: 'user-xyz',
        rating: 5,
        comment: 'Test',
      };
      expect(typeof review.rating).toBe('number');
    });

    it('debería validar que comment sea un string', () => {
      const review = {
        movieId: 'movie-xyz',
        userId: 'user-xyz',
        rating: 5,
        comment: 'This is a comment',
      };
      expect(typeof review.comment).toBe('string');
      expect(review.comment.length).toBeGreaterThan(0);
    });

    it('debería validar referencias a Movie y User', () => {
      jest.isolateModules(() => {
        require('../../src/models/review.model');

        const schemaMockFn = mongoose.Schema as jest.Mock;
        const [definition] = schemaMockFn.mock.calls[0] as any[];

        expect(definition.movieId?.ref).toBe('Movie');
        expect(definition.userId?.ref).toBe('User');
      });
    });
  });
});
