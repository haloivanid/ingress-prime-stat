import time from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

time.extend(utc);
time.extend(timezone);

type TPoint = string | number;
type TDiff = { left: TPoint; right: TPoint; result: TPoint };
type TDiffDatetime = { left: Date; right: Date; result: number };
type TKeyFields = keyof IngressPrimeStatFields;

interface IExceptionOptions {
    details?: string[];
    message?: string;
}

interface IToStringOptions {
    delimiter?: 'TAB' | 'COMMA' | 'SEMICOLON' | 'SPACE' | 'PIPE';
    spaceLength?: number;
}

interface IToJSONOptions {
    showAllStat?: boolean;
}

export type IngressStatDiff = { [p in TKeyFields]: TDiff } & { diffDatetime: TDiffDatetime };

export type TInputStat = string | object | Record<string, TPoint> | IngressPrimeStat;

class Meta {
    private _storages: Record<string, number[]> = {};
    private static _instance: Meta;

    static get init(): Meta {
        return this._instance || (this._instance = new this());
    }

    static get storages(): Record<string, number[]> {
        return Meta.init._storages;
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
}

class Converter {
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

    private static readonly headerMask: { [p in keyof Partial<IngressPrimeStatFields>]: string } = {
        'Discoverie: Kinetic Capsules': 'Discovery: Kinetic Capsules',
        'Discoverie: Machina Reclaims': 'Discovery: Machina Reclaims',
    };

    private static parseHeader(headerLine: string): string[] {
        for (const [key, value] of Object.entries(this.headerMask)) {
            headerLine = headerLine.replace(new RegExp(key, 'g'), value);
        }

        const headers: string[] = [];

        const listFields = Object.keys(Meta.storages);
        for (let key of listFields) {
            if (Object.keys(this.headerMask).includes(key)) {
                key = this.headerMask[key as keyof typeof this.headerMask] || key;
            }

            const pos = headerLine.indexOf(key);

            if (pos > 0) {
                throw new IngressStatException('FAILED_PARSE_HEADER', {
                    details: [`${headerLine.substring(0, 40)}...`],
                });
            }

            if (pos === 0) {
                headers.push(key);
                headerLine = headerLine.substring(key.length).trim();
            }
        }

        return headers;
    }

    private static parsePoint(pointLine: string): (number | string)[] {
        if (!pointLine.includes('ALL TIME')) throw new IngressStatException('WRONG_TIME_SPAN');

        // replace all time span lang
        pointLine = this.allTimeSpanLang.reduce(
            (acc, word) => acc.replace(new RegExp(`^${word}`), 'ALL_TIME'),
            pointLine,
        );

        // splitting & parse point line into number and string
        return pointLine.split(/[\s\t,;|]+/).map((p) => {
            if (p.match(/^[0-9]+$/)) {
                return parseInt(p);
            } else {
                return p.replace('_', ' ');
            }
        });
    }

    static fromString(input: string): Record<string, TPoint> {
        const lines = input.trim().split('\n');
        if (lines.length !== 2) {
            throw new IngressStatException('BAD_INPUT_FORMAT', { details: ['Input must have 2 lines'] });
        }

        const headers = this.parseHeader(lines[0].trim());
        const points = this.parsePoint(lines[1].trim());

        if (headers.length !== points.length) {
            throw new IngressStatException('BAD_INPUT_FORMAT', {
                details: ['Different length between header and point'],
            });
        }

        return headers.reduce((obj: { [p: string]: string | number }, key, index) => {
            const masks = Object.entries(this.headerMask);
            const isMasked = masks.find((mask) => mask[1] === key);
            if (isMasked) key = isMasked[0];

            obj[key] = points[index];
            return obj;
        }, {});
    }

    static fromObject(input: object | Record<string, string | number> | IngressPrimeStat): Record<string, TPoint> {
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

    static toString(stat: IngressPrimeStat, options?: IToStringOptions): string {
        const defineDelimiter = {
            TAB: '\t',
            COMMA: ',',
            SEMICOLON: ';',
            SPACE: ' ',
            PIPE: '|',
        };

        const opts = {
            mode: options?.delimiter || 'TAB',
            spaceLength: options?.spaceLength || 8,
        };

        const headers = Object.getOwnPropertyNames(stat).filter((key) => Object.keys(Meta.storages).includes(key));
        const points: TPoint[] = headers.map((key) => stat[key as TKeyFields]);

        let separator = defineDelimiter[opts.mode];
        separator = opts.mode === 'SPACE' ? separator.repeat(opts.spaceLength) : separator;

        return `${headers.join(separator)}\n${points.join(separator)}`;
    }

    static toJSON(stat: IngressPrimeStat, opts?: IToJSONOptions): Record<string, TPoint> {
        const options = { showAllStat: opts?.showAllStat || false };

        const result: Record<string, TPoint> = {};
        for (const key of Object.keys(Meta.storages)) {
            if (!options.showAllStat && !stat[key as TKeyFields]) continue;
            result[key] = stat[key as TKeyFields] || 0;
        }
        return result;
    }
}

class Validator {
    private readonly exceptionName = 'VALIDATION_ERROR';
    private errors: string[] = [];

    constructor(private readonly input: Record<TKeyFields, TPoint>) {
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

    static check(input: Record<TKeyFields, TPoint>): void {
        new this(input);
    }
}

class IngressPrimeStatFields {
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
    'Overclock Hack Points': number;

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
    'Urban Ops Missions': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Ctrl': number;

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
    'Echo': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Discoverie': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Operation Chronos Points': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Discoverie: Kinetic Capsules': number;

    @Meta.property([Meta.propType.NUMBER, Meta.propType.EVENT])
    'Discoverie: Machina Reclaims': number;

    @Meta.property([Meta.propType.NUMBER])
    'Agents Recruited': number;

    @Meta.property([Meta.propType.NUMBER])
    'Recursions': number;

    @Meta.property([Meta.propType.NUMBER])
    'Months Subscribed': number;
}

export class IngressStatException extends Error {
    private static readonly errorCode: { [p: string]: { details: string[]; message: string } } = {
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

    code: keyof typeof IngressStatException.errorCode;
    details: string[];
    message: string;

    constructor(code: keyof typeof IngressStatException.errorCode, opts?: IExceptionOptions) {
        const message = code === 'UNKNOWN' ? opts?.message : IngressStatException.errorCode[code].message;
        const details = code === 'UNKNOWN' ? opts?.details : IngressStatException.errorCode[code].details;

        super(`Error ${code}, ${message}.${details ? ` Details: ${details.join(', ')}` : ''}`);

        this.code = code;
        this.details = opts?.details || IngressStatException.errorCode[this.code].details;
        this.message = opts?.message || IngressStatException.errorCode[this.code].message;

        this.message = `${this.message} - ${this.details.toString()}`;
    }
}

export class IngressPrimeStat extends IngressPrimeStatFields {
    private readonly timezone: string = 'UTC';

    private constructor(input: TInputStat, timezone?: string) {
        super();

        this.build(input);
        this.timezone = timezone || this.timezone;
    }

    private metaStorages(): Record<string, number[]> {
        return Meta.storages;
    }

    private build(input: TInputStat): IngressPrimeStat {
        if (!input) {
            throw new IngressStatException('BAD_INPUT_FORMAT', { details: ['Input is empty'] });
        }

        const result: Record<string, TPoint> =
            typeof input === 'string' ? Converter.fromString(input) : Converter.fromObject(input);

        for (const key of Object.keys(this.metaStorages())) {
            if (result[key]) {
                this[key as TKeyFields] = result[key] as never;
                continue;
            }

            if (this.metaStorages()[key].includes(Meta.propType.NON_NULL) && !result[key]) {
                this[key as TKeyFields] = 0 as never;
            }
        }

        Validator.check(this);
        return this;
    }

    /**
     * Ingress Prime Stat
     * @description This function is used to parse Ingress Prime Stat from string or object
     * @param input string | object | Record<string, string | number> | IngressPrimeStat
     * @param timezone string
     * @returns Promise<IngressPrimeStat>
     */
    static process(input: TInputStat, timezone?: string): IngressPrimeStat {
        return new this(input, timezone);
    }

    datetime() {
        const dateStat = this['Date (yyyy-mm-dd)'];
        const timeStat = this['Time (hh:mm:ss)'];

        if (!dateStat || !timeStat) {
            throw new IngressStatException('BAD_INPUT_FORMAT', { details: ['Missing date or time'] });
        }

        return time.tz(`${dateStat} ${timeStat}`, this.timezone).toDate();
    }

    diff(other: IngressPrimeStat, opts?: { mode?: 'OLD2NEW' | 'NEW2OLD'; filter?: boolean }): IngressStatDiff {
        const diffResult: IngressStatDiff = {} as IngressStatDiff;

        const classes = [this, other];
        let cLeft = classes[0];
        let cRight = classes[1];

        if (opts?.mode) {
            const classSorted = classes.sort((a, b) => a.datetime().getTime() - b.datetime().getTime());
            switch (opts?.mode) {
                case 'OLD2NEW':
                    cLeft = classSorted[0];
                    cRight = classSorted[1];
                    break;
                case 'NEW2OLD':
                    cLeft = classSorted[1];
                    cRight = classSorted[0];
                    break;
            }
        }

        for (const key of Object.keys(Meta.storages)) {
            const left = cLeft[key as TKeyFields] || 0;
            const right = cRight[key as TKeyFields] || 0;

            let result: TPoint = 0;
            if (typeof left === 'number' && typeof right === 'number') {
                result = right - left;
                if (opts?.filter && result <= 0) continue;
            }
            if (typeof left === 'string' && typeof right === 'string') {
                result = `${left} => ${right}`;
                if (opts?.filter && left === right) continue;
            }

            diffResult[key as TKeyFields] = { left, right, result };
        }

        diffResult.diffDatetime = {
            left: cLeft.datetime(),
            right: cRight.datetime(),
            result: time(cLeft.datetime()).diff(time(cRight.datetime()), 'seconds'),
        };

        // TODO: add no diff function

        return diffResult;
    }

    toJSON(options?: IToJSONOptions): Record<string, TPoint> {
        return Converter.toJSON(this, options);
    }

    toString(options?: IToStringOptions): string {
        return Converter.toString(this, options);
    }
}
