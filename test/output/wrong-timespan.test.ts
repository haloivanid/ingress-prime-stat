import * as fs from 'fs';
import * as path from 'path';
import { IngressStat, IngressStatException } from '../../lib';

describe('Test Wrong Timespan', () => {
    let input: string;

    beforeAll(() => {
        input = fs.readFileSync(path.resolve(__dirname, '../case/wrong-timespan.txt'), 'utf8');
    });

    it('should return error', () => {
        try {
            new IngressStat(input);
        } catch (e) {
            expect(e).toBeInstanceOf(IngressStatException);
        }
    });
});
