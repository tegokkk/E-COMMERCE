import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { toDatetimeLocal, fromDatetimeLocal } from './datetime';

describe('Package display cutoff conversions', () => {
  it.each([
    ['Asia/Bangkok', '2026-11-20T19:00', '2026-11-20T13:00:00.000Z'],
    ['UTC', '2026-11-20T12:00', '2026-11-20T20:00:00.000Z'],
    ['America/New_York', '2026-11-20T07:00', '2026-11-21T01:00:00.000Z'],
  ])('round-trips an unchanged instant and converts edits in %s', (timezone, expectedInput, expectedEdit) => {
    const moduleUrl = pathToFileURL(path.resolve('src/lib/datetime.js')).href;
    const code = `import { toDatetimeLocal, fromDatetimeLocal } from ${JSON.stringify(moduleUrl)};
      const original = '2026-11-20T12:00:37.456Z';
      const input = toDatetimeLocal(original);
      console.log(JSON.stringify({input,unchanged:fromDatetimeLocal(input,original),edited:fromDatetimeLocal('2026-11-20T20:00',original)}));`;
    const result = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', code], { env: { ...process.env, TZ: timezone }, encoding: 'utf8', windowsHide: true }));
    expect(result).toEqual({ input: expectedInput, unchanged: '2026-11-20T12:00:37.456Z', edited: expectedEdit });
  });

  it('handles empty dates and rejects invalid edits', () => {
    expect(toDatetimeLocal(null)).toBe('');
    expect(toDatetimeLocal('invalid')).toBe('');
    expect(fromDatetimeLocal('', '2026-11-20T12:00:00Z')).toBeNull();
    expect(() => fromDatetimeLocal('invalid')).toThrow('Batas penayangan tidak valid.');
  });
});
