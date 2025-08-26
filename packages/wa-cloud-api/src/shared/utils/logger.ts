// @ts-nocheck
import type { LoggerInterface } from '../types/logger';

export default class Logger implements LoggerInterface {
    private debug: boolean;
    private name: string;

    constructor(name: string, debug = false) {
        this.name = name;
        this.debug = debug;
    }

    error(...data: any[]) {
        let prefix = `[ ${Date.now()} ] - ERROR`;
        if (this.name) {
            prefix += ` - ${this.name}`;
        }
        console.error.apply(console, [prefix, ': ', ...data]);
    }

    info(...data: any[]) {
        let prefix = `[ ${Date.now()} ] - INFO`;
        if (this.name) {
            prefix += ` - ${this.name}`;
        }
        console.info.apply(console, [prefix, ': ', ...data]);
    }

    log(...data: any[]) {
        if (this.debug) {
            let prefix = `[ ${Date.now()} ]`;
            if (this.name) {
                prefix += ` - ${this.name}`;
            }
            console.log.apply(console, [prefix, ': ', ...data]);
        }
    }

    warn(...data: any[]) {
        let prefix = `[ ${Date.now()} ] - WARN`;
        if (this.name) {
            prefix += ` - ${this.name}`;
        }
        console.warn.apply(console, [prefix, ': ', ...data]);
    }
}
