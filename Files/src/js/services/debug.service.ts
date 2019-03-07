import { Injectable } from '@angular/core';

declare var overwolf: any;

@Injectable()
export class DebugService {

	constructor() {
		let debugMode = true;
		console.log = this.override(console.log, debugMode);
		console.warn = this.override(console.warn, debugMode);
		console.error = this.overrideError(console.error, debugMode);
	}

	private override(oldConsoleLogFunc: any, debugMode: boolean) {
		if (debugMode) {
			return function() {
				let argsString = "";
				for (let i = 0; i < arguments.length; i++) {
					let cache = [];
					argsString += (JSON.stringify(arguments[i], function(key, value) {
						if (typeof value === 'object' && value !== null) {
							if (cache.indexOf(value) !== -1) {
								// Circular reference found, discard key
								return;
							}
							// Store value in our collection
							cache.push(value);
						}
						return value;
					}) || '').substring(0, 1000) + ' | ';
					cache = null; // Enable garbage collection + " | "
				}
				oldConsoleLogFunc.apply(console, [argsString]);
			};
		}
		return oldConsoleLogFunc;
	}

	private overrideError(oldConsoleLogFunc: any, debugMode: boolean) {
		if (debugMode) {
			return function() {
				let argsString = "";
				for (let i = 0; i < arguments.length; i++) {
					let cache = [];
					argsString += (JSON.stringify(arguments[i], function(key, value) {
						if (typeof value === 'object' && value !== null) {
							if (cache.indexOf(value) !== -1) {
								// Circular reference found, discard key
								return;
							}
							// Store value in our collection
							cache.push(value);
						}
						return value;
					}) || '') + ' | ';
					cache = null; // Enable garbage collection + " | "
				}
				oldConsoleLogFunc.apply(console, [argsString]);
				oldConsoleLogFunc.apply(console, arguments);
			};
		}
		return oldConsoleLogFunc;
	}
}
