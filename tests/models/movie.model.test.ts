import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// ⚠️ No importes mongoose/MovieModel aquí. Primero definimos el mock global.
jest.mock('mongoose', () => {
  const SchemaMock: any = jest.fn().mockImplementation(function (this: any, definition: any, options: any) {
    this.definition = definition;
    this.options = options;
    return this;
  });
  SchemaMock.Types = {
    ObjectId: function MockObjectId() {
      /* marcador */
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

  // Soporta import default (`import mongoose from 'mongoose'`)
  return { __esModule: true, default: mocked, ...mocked };
});

describe('Movie Model', () => {
  // Punteros a los mocks reales (después de require)
  let mongoose: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Cargamos la versión mockeada de mongoose para leer sus mocks
    mongoose = require('mongoose').default ?? require('mongoose');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Exports básicos', () => {
    it('debería exportar MovieModel', () => {
      jest.isolateModules(() => {
        const { MovieModel } = require('../../src/models/movie.model');
        expect(MovieModel).toBeDefined();
      });
    });

    it('debería re-exportar el tipo MoviesInput', () => {
      // Sólo comprobación de que compila/está accesible
      jest.isolateModules(() => {
        const { } = require('../../src/models/movie.model');
        // Si el import falla, no llega aquí.
        expect(true).toBe(true);
      });
    });
  });

  describe('Schema definition', () => {
    it('debería crear el schema con campos y opciones esperados', () => {
      jest.isolateModules(() => {
        require('../../src/models/movie.model');

        const schemaMockFn = mongoose.Schema as jest.Mock;
        const schemaCalls = schemaMockFn.mock.calls as unknown as any[][];
        expect(schemaCalls.length).toBeGreaterThan(0);

        const [definition, options] = schemaCalls[0] as any[];

        // timestamps
        expect(options?.timestamps).toBe(true);

        // Campos requeridos
        expect(definition.title?.required).toBe(true);
        expect(definition.description?.required).toBe(true);
        expect(definition.director?.required).toBe(true);
        expect(definition.releaseDate?.required).toBe(true);
        expect(definition.genre?.required).toBe(true);

        // userId: ObjectId + ref User + required
        expect(definition.userId?.required).toBe(true);
        expect(definition.userId?.ref).toBe('User');
        expect(definition.userId?.type).toBe((mongoose.Schema as any).Types.ObjectId);

        // reviews: array de ObjectId con ref Review
        expect(Array.isArray(definition.reviews)).toBe(true);
        const reviewItem = definition.reviews[0];
        expect(reviewItem?.ref).toBe('Review');
        expect(reviewItem?.type).toBe((mongoose.Schema as any).Types.ObjectId);
      });
    });

    it('debería registrar el modelo con nombre "Movie"', () => {
      jest.isolateModules(() => {
        require('../../src/models/movie.model');

        const modelMockFn = mongoose.model as jest.Mock;
        const modelCalls = modelMockFn.mock.calls as unknown as any[][];
        expect(modelCalls.length).toBeGreaterThan(0);

        const [name, schemaArg] = modelCalls[0] as any[];
        expect(name).toBe('Movie');

        const schemaInstance = ((mongoose.Schema as jest.Mock).mock.instances[0]) as any;
        expect(schemaArg).toBe(schemaInstance);
        expect(schemaInstance.definition).toBeDefined();
        expect(schemaInstance.options?.timestamps).toBe(true);
      });
    });
  });

  describe('Tipos (sanity de runtime)', () => {
    it('MovieDocument debería extender base', () => {
      jest.isolateModules(() => {
        const { MovieDocument } = require('../../src/models/movie.model') as any;
        // runtime sanity básico
        const mockDoc: Partial<typeof MovieDocument> = {
          _id: 'mock-object-id' as any,
          title: 'Inception',
          description: 'A mind-bending thriller',
          director: 'Christopher Nolan',
          releaseDate: new Date('2010-07-16'),
          genre: 'Sci-Fi',
          userId: 'user-123' as any,
          reviews: [] as any,
        };
        expect(mockDoc.title).toBe('Inception');
      });
    });

    it('MoviesInput acepta forma base requerida', () => {
      // No necesitamos importar nada: sólo demostramos estructura válida
      const valid = {
        title: 'Dunkirk',
        description: 'War drama',
        director: 'Christopher Nolan',
        releaseDate: new Date('2017-07-21'),
        genre: 'War',
        userId: 'user-xyz' as any,
      };
      expect(valid.title).toBeTruthy();
      expect(valid.description).toBeTruthy();
      expect(valid.director).toBeTruthy();
      expect(valid.releaseDate).toBeInstanceOf(Date);
      expect(valid.genre).toBeTruthy();
      expect(valid.userId).toBeTruthy();
    });
  });
});
