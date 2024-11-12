import * as fs from 'fs';
import * as path from 'path';
import { IngressPrimeStat } from '../lib';

describe('Ingress Prime Stat Test (output)', () => {
  let caseInput: string;
  const instance = IngressPrimeStat;

  beforeAll(() => {
    caseInput = fs.readFileSync(path.resolve(__dirname, './case/normal.txt'), 'utf8');
  });

  it('Should instantiate IngressPrimeStat', () => {
    const stat = instance.process(caseInput);
    expect(stat).toBeInstanceOf(instance);
  });

  it('Should get faction', () => {
    const stat = instance.process(caseInput);
    expect(stat['Agent Faction']).toBe('Resistance');
  });

  it('Should convert time from Asia/Jakarta to UTC', () => {
    const statUTC = instance.process(caseInput);
    const statWithCustomTZ = instance.process(caseInput, 'Asia/Jakarta');
    const diff = statUTC.diff(statWithCustomTZ).diffDatetime;
    expect(diff.result).toBe(7 * 60 * 60);
  });

  it('Should throw error', () => {
    expect(() => {
      instance.process('invalid');
    }).toThrowError();
  });
});
