import { environment } from 'src/environments/environment';
import { GeneralService } from './general.service';
import { Injectable } from '@angular/core';
import { RequestEntrepreneurDto } from '../models/RequestEntrepreneurDto';
import { EntrePreneurReques } from '../models/EntrePreneurReques';

@Injectable({
  providedIn: 'root'
})
export class EntrepreneurReqeustService {

  constructor(private general: GeneralService) { }

  createEntrepreneurRequest(request: RequestEntrepreneurDto) {
    return this.general.postData<Request, RequestEntrepreneurDto>(`${environment.api}/external/save/requestEntrepreneur`, request);
  }

  updateEntrepreneurRequestPoint(idRequest: number, point: number) {
    return this.general.putData<EntrePreneurReques, null>(`${environment.api}/internal/update/points/${idRequest}/${point}`);
  }
}
