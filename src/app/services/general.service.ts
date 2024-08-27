import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Param } from '../models/Params';
import { UrlUtils } from '../utils/url-utils';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  constructor(protected html: HttpClient) {}

  getData<R>(
    baseUrl: string,
    params?: string | string[] | Param[],
    headers?: Param[]
  ) {
    return this.html.get<R>(this.createUrl(baseUrl, params), {
      headers: UrlUtils.toHeaders(headers),
    });
  }

  postData<R, B>(baseUrl: string, body?: B, headers?: Param[]) {
    return this.html.post<R>(baseUrl, body, {
      headers: UrlUtils.toHeaders(headers),
    });
  }

  putData<R, B>(
    baseUrl: string,
    params?: string | string[] | Param[],
    body?: B,
    headers?: Param[]
  ) {
    return this.html.put<R>(this.createUrl(baseUrl, params), body, {
      headers: UrlUtils.toHeaders(headers),
    });
  }

  patchData<R, B>(
    baseUrl: string,
    params?: string | string[] | Param[],
    body?: B,
    headers?: Param[]
  ) {
    return this.html.patch<R>(this.createUrl(baseUrl, params), body, {
      headers: UrlUtils.toHeaders(headers),
    });
  }

  deleteData<R>(
    baseUrl: string,
    params?: string | string[] | Param[],
    headers?: Param[]
  ) {
    return this.html.delete<R>(this.createUrl(baseUrl, params), {
      headers: UrlUtils.toHeaders(headers),
    });
  }

  createUrl(baseUrl: string, params?: string | string[] | Param[]): string {
    if (!params) return baseUrl;
    if (typeof params == 'string' || typeof params == 'number')
      return `${baseUrl}/${params}`;
    if (params[0] instanceof Param)
      return `${baseUrl}${UrlUtils.toQueryParams(params)}}`;
    else return `${baseUrl}/${params.join('/')}`;
  }
}
