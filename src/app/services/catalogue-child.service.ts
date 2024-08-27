import { CatalogueChild } from './../models/CatalogueChild';
import { GeneralService } from './general.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogueChildService {

  constructor(private general:GeneralService) { }

public getAllCatalogueChild(){

return this.general.getData<CatalogueChild[]>(`${environment.api}/external/catalogue/getAll`)

}
public getAllCatalogueChildByParent(id:number){


  return this.general.getData<CatalogueChild[]>(`${environment.api}/external/catalogue/getBy/${id}`);
}

}
