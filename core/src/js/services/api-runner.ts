import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiRunner {
	constructor(private readonly http: HttpClient) {}

	public async callPostApi<T>(
		url: string,
		input: any,
		options?: {
			contentType?: string;
			bearerToken?: string;
		},
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			let headers = new HttpHeaders({
				'Content-Type': options?.contentType ?? 'application/json',
			});
			if (options?.bearerToken) {
				headers = headers.set('Authorization', `Bearer ${options.bearerToken}`);
				console.debug('set authorization', headers, options.bearerToken);
			}
			this.http.post(url, input, { headers: headers }).subscribe(
				(result: any) => {
					console.log('retrieved POST call', url, input);
					resolve(result);
				},
				error => {
					console.error('Could not execute POST call', url, input, error);
					resolve(null);
				},
			);
		});
	}

	public async callGetApi<T>(url: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.http.get(url).subscribe(
				(result: any) => {
					console.log('retrieved GET call', url);
					resolve(result);
				},
				error => {
					console.error('Could not execute GET call', url);
					resolve(null);
				},
			);
		});
	}
}
