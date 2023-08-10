import time from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

time.extend(utc);
time.extend(timezone);

class Meta {
    private static _instance: Meta;
    private _storages: Record<string, number[]> = {};

    private static get init(): Meta {
        return this._instance || (this._instance = new this());
    }

    static get propType(): Record<string, number> {
        return {
            EVENT: 0,
            NON_NULL: 1,
            NUMBER: 2,
            REQUIRED: 3,
            STRING: 4,
        };
    }

    static property(values: number[]): PropertyDecorator {
        return (_: object, property: string | symbol): void => {
            const storages = Meta.init._storages;
            storages[property as string] = values;
        };
    }

    static get storages(): Record<string, number[]> {
        return Meta.init._storages;
    }
}

class AllTimeStats {
    @Meta.property([Meta.propType.STRING, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Time Span': string;

    @Meta.property([Meta.propType.STRING, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Agent Name': string;

    @Meta.property([Meta.propType.STRING, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Agent Faction': string;

    @Meta.property([Meta.propType.STRING, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Date (yyyy-mm-dd)': string;

    @Meta.property([Meta.propType.STRING, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Time (hh:mm:ss)': string;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Level': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Lifetime AP': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL, Meta.propType.REQUIRED])
    'Current AP': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Unique Portals Visited': number;

    @Meta.property([Meta.propType.NUMBER])
    'Unique Portals Drone Visited': number;

    @Meta.property([Meta.propType.NUMBER])
    'Furthest Drone Flight Distance': number;

    @Meta.property([Meta.propType.NUMBER])
    'Furthest Drone Distance': number;

    @Meta.property([Meta.propType.NUMBER])
    'Portals Discovered': number;

    @Meta.property([Meta.propType.NUMBER])
    'Seer Points': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'XM Collected': number;

    @Meta.property([Meta.propType.NUMBER])
    'OPR Agreements': number;

    @Meta.property([Meta.propType.NUMBER])
    'AR Videos Uploaded': number;

    @Meta.property([Meta.propType.NUMBER])
    'Portal Scans Uploaded': number;

    @Meta.property([Meta.propType.NUMBER])
    'Scout Controller on Unique Portals': number;

    @Meta.property([Meta.propType.NUMBER])
    'Uniques Scout Controlled': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Resonators Deployed': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Links Created': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Control Fields Created': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Mind Units Captured': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Longest Link Ever Created': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Largest Control Field': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'XM Recharged': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Portals Captured': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Unique Portals Captured': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Mods Deployed': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Hacks': number;

    @Meta.property([Meta.propType.NUMBER])
    'Drone Hacks': number;

    @Meta.property([Meta.propType.NUMBER])
    'Glyph Hack Points': number;

    @Meta.property([Meta.propType.NUMBER])
    'Completed Hackstreaks': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Longest Sojourner Streak': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Resonators Destroyed': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Portals Neutralized': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Enemy Links Destroyed': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Enemy Fields Destroyed': number;

    @Meta.property([Meta.propType.NUMBER])
    'Battle Beacon Combatant': number;

    @Meta.property([Meta.propType.NUMBER])
    'Drones Returned': number;

    @Meta.property([Meta.propType.NUMBER])
    'Machina Links Destroyed': number;

    @Meta.property([Meta.propType.NUMBER])
    'Machina Resonators Destroyed': number;

    @Meta.property([Meta.propType.NUMBER])
    'Machina Portals Neutralized': number;

    @Meta.property([Meta.propType.NUMBER])
    'Machina Portals Reclaimed': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Max Time Portal Held': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Max Time Link Maintained': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Max Link Length x Days': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Max Time Field Held': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Largest Field MUs x Days': number;

    @Meta.property([Meta.propType.NUMBER])
    'Forced Drone Recalls': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.NON_NULL])
    'Distance Walked': number;

    @Meta.property([Meta.propType.NUMBER])
    'Kinetic Capsules Completed': number;

    @Meta.property([Meta.propType.NUMBER])
    'Unique Missions Completed': number;

    @Meta.property([Meta.propType.NUMBER])
    'Agents Successfully Recruited': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Mission Day(s) Attended': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'NL-1331 Meetup(s) Attended': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'First Saturday Events': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Second Sunday Events': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Sentinel Portals Captured': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Event Portal Glyph Points': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Clear Fields Events': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'OPR Live Events': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Prime Challenges': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Stealth Ops Missions': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Epiphany Dawn': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Umbra: Unique Resonator Slots Deployed': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Didact: Total Fields Created': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Didact Fields Created': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Matryoshka Links Created': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Unique Event Portals Hacked': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Courier AP Earned': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Kureze Effect': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Comic Sans Links': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'EOS Points Earned': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Solstice XM Recharged': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Kythera': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Peace Link Points': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Superposition': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Ctrl': number;

    @Meta.property([Meta.propType.NUMBER])
    'Agents Recruited': number;

    @Meta.property([Meta.propType.NUMBER])
    'Recursions': number;

    @Meta.property([Meta.propType.NUMBER])
    'Months Subscribed': number;
}

class InputParser {
    private static readonly allTimeSpanLang: string[] = [
        'GESAMT',
        'ALL TIME',
        'OD POCZĄTKU',
        "DALL'INIZIO",
        '全部',
        'Celé období',
        'ЗА ВСЕ ВРЕМЯ',
        'SIEMPRE',
        'ALLE',
        'TOUS TEMPS',
    ];

    private static parseHeader(headerLine: string): string[] {
        const headers: string[] = [];
        for (const key of Object.keys(Meta.storages)) {
            const pos = headerLine.indexOf(key);
            if (pos > 0) {
                throw new IngressStatException('FAILED_PARSE_HEADER', {
                    details: [`${headerLine.substring(0, 25)}...`],
                });
            }

            if (pos === 0) {
                headers.push(key);
                headerLine = headerLine.substring(key.length).trim();
            }
        }

        return headers;
    }

    private static parsePoint(pointLine: string): (string | number)[] {
        if (!pointLine.includes('ALL TIME')) throw new IngressStatException('WRONG_TIME_SPAN');

        // replace all time span lang
        pointLine = InputParser.allTimeSpanLang.reduce(
            (acc, word) => acc.replace(new RegExp(`^${word}`), 'ALL_TIME'),
            pointLine,
        );

        // splitting & parse point line into number and string
        return pointLine
            .replace(/\s{2,}/g, ' ')
            .split(/[\s\t]/)
            .map((p) => {
                if (p.match(/^[0-9]+$/)) {
                    return parseInt(p);
                } else {
                    return p.replace('_', ' ');
                }
            });
    }

    static fromString(input: string): Record<string, IngressStatPoint> {
        const lines = input.trim().split('\n');
        if (lines.length !== 2) {
            throw new IngressStatException('BAD_INPUT_FORMAT', { details: ['Input must have 2 lines'] });
        }

        const headers = InputParser.parseHeader(lines[0].trim());
        const points = InputParser.parsePoint(lines[1].trim());

        if (headers.length !== points.length) {
            throw new IngressStatException('BAD_INPUT_FORMAT', {
                details: ['Different length between header and point'],
            });
        }

        return headers.reduce((obj: { [p: string]: string | number }, key, index) => {
            obj[key] = points[index];
            return obj;
        }, {});
    }

    static fromObject(input: object | Record<string, string | number> | IngressStat): Record<string, IngressStatPoint> {
        type commonKeys = Extract<keyof typeof input, keyof typeof Meta.storages>;
        const inputKeys: string[] = Object.keys(input) as commonKeys[];
        if (inputKeys.every((key) => !(key in Meta.storages))) {
            throw new IngressStatException('BAD_INPUT_FORMAT', {
                details: ['Object input must have at least 1 valid key'],
            });
        }

        return Object.keys(Meta.storages).reduce((obj: { [p: string]: string | number }, key) => {
            if (inputKeys.includes(key)) {
                obj[key] = input[key as commonKeys];
            }
            return obj;
        }, {});
    }
}

class Validator {
    private readonly exceptionName = 'VALIDATION_ERROR';
    private errors: string[] = [];

    constructor(private readonly input: Record<keyof AllTimeStats, IngressStatPoint>) {
        this.required();
        this.datetime();

        if (this.errors.length > 0) {
            throw new IngressStatException(this.exceptionName, { details: this.errors });
        }
    }

    private required(): void {
        const requiredFields = Object.keys(Meta.storages).filter((key) =>
            Meta.storages[key].includes(Meta.propType.REQUIRED),
        );
        for (const key of requiredFields) {
            if (!(key in this.input)) {
                this.errors.push(`Missing required field ${key}`);
            }
        }
    }

    private datetime(): void {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;

        const date = this.input['Date (yyyy-mm-dd)'];
        const time = this.input['Time (hh:mm:ss)'];

        if (typeof date === 'number' || !dateRegex.test(date)) {
            this.errors.push('Invalid date format');
        }

        if (typeof time === 'number' || !timeRegex.test(time)) {
            this.errors.push('Invalid time format');
        }
    }
}

type IngressStatPoint = string | number;
export type IngressStatDiff = {
    [p in keyof AllTimeStats]: { left: IngressStatPoint; right: IngressStatPoint; result: IngressStatPoint };
} & { diffDatetime: { left: Date; right: Date; result: number } };

export type IngressStatInput = string | object | Record<string, IngressStatPoint> | IngressStat;

export class IngressStat extends AllTimeStats {
    private readonly statTimezone: string;

    constructor(input: IngressStatInput, timezone?: string) {
        super();
        this.build(input);

        this.statTimezone = timezone || 'UTC';
    }

    private build(input: IngressStatInput): IngressStat {
        let result: Record<string, IngressStatPoint>;
        if (typeof input === 'string') {
            result = InputParser.fromString(input);
        } else {
            result = InputParser.fromObject(input);
        }

        const metaStorages = Meta.storages;
        for (const key of Object.keys(metaStorages)) {
            if (result[key]) {
                this[key as keyof AllTimeStats] = result[key] as never;
                continue;
            }

            if (metaStorages[key].includes(Meta.propType.NON_NULL) && !result[key]) {
                this[key as keyof AllTimeStats] = 0 as never;
            }
        }

        new Validator(this);

        return this;
    }

    datetime() {
        return time.tz(`${this['Date (yyyy-mm-dd)']} ${this['Time (hh:mm:ss)']}`, this.statTimezone).toDate();
    }

    diff(other: IngressStat): IngressStatDiff {
        const diffResult: IngressStatDiff = {} as IngressStatDiff;

        for (const key of Object.keys(Meta.storages)) {
            const left = this[key as keyof AllTimeStats];
            const right = other[key as keyof AllTimeStats];

            let result: IngressStatPoint = 0;
            if (typeof left === 'number' && typeof right === 'number') {
                result = right - left;
            }
            if (typeof left === 'string' && typeof right === 'string') {
                result = `${left} => ${right}`;
            }

            diffResult[key as keyof AllTimeStats] = { left, right, result };
        }

        diffResult.diffDatetime = {
            left: this.datetime(),
            right: other.datetime(),
            result: time(this.datetime()).diff(time(other.datetime()), 'seconds'),
        };

        return diffResult;
    }

    toString(options?: { mode?: 'TAB' | 'COMMA' | 'SPACE'; spaceWidth?: 2 | 4 | 8 }): string {
        const opts = {
            mode: options?.mode || 'TAB',
            spaceWidth: options?.spaceWidth || 8,
        };

        const headers = Object.keys(this).filter((key) => key in Object.keys(Meta.storages));
        const points: IngressStatPoint[] = headers.map((key) => this[key as keyof AllTimeStats]);

        const separator = opts.mode === 'TAB' ? '\t' : opts.mode === 'COMMA' ? ',' : `${' '.repeat(opts.spaceWidth)}`;
        return `${headers.join(separator)}\n${points.join(separator)}`;
    }
}

const exceptionCode = {
    BAD_INPUT_FORMAT: {
        details: ['Input is not a string, JSON, or IngressStat'],
        message: 'Bad input stat, Please check your stat again',
    },
    FAILED_PARSE_HEADER: {
        details: [],
        message: 'Cannot parse header stat',
    },
    TIMEZONE_NEEDED: {
        details: ['Timezone required but got empty'],
        message: 'Timezone is needed to define date time, see https://timezonedb.com/time-zones',
    },
    UNKNOWN: {
        details: ['Unknown error'],
        message: 'Something went wrong with your stat',
    },
    VALIDATION_ERROR: {
        details: [],
        message: 'Failed to validate stat, see the details',
    },
    WRONG_TIME_SPAN: {
        details: ['Only support all time span'],
        message: 'Wrong time span, please input only from all time span',
    },
};

interface ExceptionOptions {
    details?: string[];
    message?: string;
}

export class IngressStatException extends Error {
    code: keyof typeof exceptionCode;
    details: string[];
    message: string;

    constructor(code: keyof typeof exceptionCode, opts?: ExceptionOptions) {
        const message = code === 'UNKNOWN' ? opts?.message : exceptionCode[code].message;
        const details = code === 'UNKNOWN' ? opts?.details : exceptionCode[code].details;

        super(`Error ${code}, ${message}.${details ? ` Details: ${details.join(', ')}` : ''}`);

        this.code = code;
        this.details = opts?.details || exceptionCode[this.code].details;
        this.message = opts?.message || exceptionCode[this.code].message;
    }
}
