import { describe, it, expect } from 'vitest';
import {
  selectModel,
  getAgentComplexity,
  getSkillComplexity,
  getModelDisplayName,
  getModelTier,
  MODEL_IDS
} from '../../../src/utils/model-selector.js';

describe('model-selector', () => {
  describe('selectModel', () => {
    describe('hook generation', () => {
      it('should always return haiku model ID for hooks', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'hook'
        });
        expect(result).toBe(MODEL_IDS.haiku);
      });

      it('should return haiku even when user selected opus', () => {
        const result = selectModel({
          userSelectedModel: 'opus',
          generationType: 'hook'
        });
        expect(result).toBe(MODEL_IDS.haiku);
      });
    });

    describe('skill generation', () => {
      it('should return haiku for simple skills', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'skill',
          itemName: 'eslint'
        });
        expect(result).toBe(MODEL_IDS.haiku);
      });

      it('should return sonnet for complex skills', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'skill',
          itemName: 'nextjs'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
      });

      it('should return sonnet for medium complexity skills', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'skill',
          itemName: 'unknown-skill'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
      });
    });

    describe('agent generation', () => {
      it('should return haiku for simple agents', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'agent',
          itemName: 'designer'
        });
        expect(result).toBe(MODEL_IDS.haiku);
      });

      it('should return sonnet for medium agents', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'agent',
          itemName: 'backend-engineer'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
      });

      it('should return sonnet for complex agents', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'agent',
          itemName: 'architect'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
      });

      it('should default to medium complexity for unknown agents', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'agent',
          itemName: 'unknown-agent'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
      });
    });

    describe('claude-md generation', () => {
      it('should return sonnet when user selected sonnet', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'claude-md'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
      });

      it('should return opus when user selected opus', () => {
        const result = selectModel({
          userSelectedModel: 'opus',
          generationType: 'claude-md'
        });
        expect(result).toBe(MODEL_IDS.opus);
      });
    });

    describe('tier capping', () => {
      it('should never exceed user tier when capped at sonnet', () => {
        const result = selectModel({
          userSelectedModel: 'sonnet',
          generationType: 'claude-md'
        });
        expect(result).toBe(MODEL_IDS.sonnet);
        expect(result).not.toBe(MODEL_IDS.opus);
      });
    });
  });

  describe('getAgentComplexity', () => {
    it('should return complex for architect', () => {
      expect(getAgentComplexity('architect')).toBe('complex');
    });

    it('should return complex for security-analyst', () => {
      expect(getAgentComplexity('security-analyst')).toBe('complex');
    });

    it('should return medium for backend-engineer', () => {
      expect(getAgentComplexity('backend-engineer')).toBe('medium');
    });

    it('should return medium for testing-specialist', () => {
      expect(getAgentComplexity('testing-specialist')).toBe('medium');
    });

    it('should return simple for designer', () => {
      expect(getAgentComplexity('designer')).toBe('simple');
    });

    it('should return simple for copywriter', () => {
      expect(getAgentComplexity('copywriter')).toBe('simple');
    });

    it('should default to medium for unknown agents', () => {
      expect(getAgentComplexity('unknown-agent')).toBe('medium');
    });

    it('should handle case insensitive agent names', () => {
      expect(getAgentComplexity('ARCHITECT')).toBe('complex');
      expect(getAgentComplexity('Designer')).toBe('simple');
    });
  });

  describe('getSkillComplexity', () => {
    it('should return simple for eslint', () => {
      expect(getSkillComplexity('eslint')).toBe('simple');
    });

    it('should return simple for prettier', () => {
      expect(getSkillComplexity('prettier')).toBe('simple');
    });

    it('should return simple for git', () => {
      expect(getSkillComplexity('git')).toBe('simple');
    });

    it('should return complex for nextjs', () => {
      expect(getSkillComplexity('nextjs')).toBe('complex');
    });

    it('should return complex for typescript', () => {
      expect(getSkillComplexity('typescript')).toBe('complex');
    });

    it('should return complex for kubernetes', () => {
      expect(getSkillComplexity('kubernetes')).toBe('complex');
    });

    it('should default to medium for unknown skills', () => {
      expect(getSkillComplexity('unknown-skill')).toBe('medium');
    });

    it('should handle case insensitive skill names', () => {
      expect(getSkillComplexity('NEXTJS')).toBe('complex');
      expect(getSkillComplexity('Eslint')).toBe('simple');
    });
  });

  describe('getModelDisplayName', () => {
    it('should return Haiku 3.5 for haiku model ID', () => {
      expect(getModelDisplayName(MODEL_IDS.haiku)).toBe('Haiku 3.5');
    });

    it('should return Sonnet 4.5 for sonnet model ID', () => {
      expect(getModelDisplayName(MODEL_IDS.sonnet)).toBe('Sonnet 4.5');
    });

    it('should return Opus 4.5 for opus model ID', () => {
      expect(getModelDisplayName(MODEL_IDS.opus)).toBe('Opus 4.5');
    });

    it('should return the model ID itself for unknown models', () => {
      const unknownId = 'claude-unknown-model';
      expect(getModelDisplayName(unknownId)).toBe(unknownId);
    });
  });

  describe('getModelTier', () => {
    it('should return haiku for haiku model ID', () => {
      expect(getModelTier(MODEL_IDS.haiku)).toBe('haiku');
    });

    it('should return sonnet for sonnet model ID', () => {
      expect(getModelTier(MODEL_IDS.sonnet)).toBe('sonnet');
    });

    it('should return opus for opus model ID', () => {
      expect(getModelTier(MODEL_IDS.opus)).toBe('opus');
    });

    it('should return sonnet for unknown model IDs', () => {
      expect(getModelTier('claude-unknown-model')).toBe('sonnet');
    });
  });
});
