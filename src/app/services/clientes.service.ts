import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from "@angular/common/http";
import { of } from "rxjs";
import { Clientes } from "../models/clientes";

@Injectable({
  providedIn: "root"
})

export class ClientesService {

  resourceUrl: string;
  constructor(private httpClient: HttpClient) {
    this.resourceUrl = "https://pav2.azurewebsites.net/api/clientes/";
  }

  get() {
    return this.httpClient.get(this.resourceUrl);
  }

  getById(Id: number) {
    return this.httpClient.get(this.resourceUrl + Id);
  }

  post(obj: Pais) {
    return this.httpClient.post(this.resourceUrl, obj);
  }
  


}