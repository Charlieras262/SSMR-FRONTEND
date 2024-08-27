import { GeneralService } from './general.service';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestDto } from '../models/RequestDto';

@Injectable({
  providedIn: 'root',
})

export class RequestService extends GeneralService {

  getAllRequest(idUser: string) {
    return super.getData<RequestDto[]>(
      `${environment.api}/internal/reviewer/request/${idUser}`
    );
  }

  assignRequest(idUser: string) {
    return super.patchData<boolean, any>(
      `${environment.api}/internal/reviewer/request/assign/${idUser}`
    );
  }

  getRequestDetail(idRequest: number) {
    return super.getData(
      `${environment.api}/external/request/detail/${idRequest}`
    );
  }

  approveRequestLocation(idRequest: number) {
    return super.patchData<boolean, any>(
      `${environment.api}/internal/reviewer/request/update`,
      idRequest.toString(),
      { comment: '', state: 165 }
    );
  }

  approveRequestInterview(idRequest: number, contextLocation?: number) {
    return super.patchData<boolean, any>(
      `${environment.api}/internal/reviewer/request/update`,
      idRequest.toString(),
      { comment: '', state: 167, contextLocation, date:null }
    );
  }

  rejectRequest(idRequest: number, comment: string) {
    return super.patchData<boolean, any>(
      `${environment.api}/internal/reviewer/request/update`,
      idRequest.toString(),
      { comment, state: 166 }
    );
  }

  approveRequestFinish(idRequest: number, comment: string, date: Date) {
    return super.patchData<boolean, any>(
      `${environment.api}/internal/reviewer/request/update`,
      idRequest.toString(),
      { comment, state: 11, date }
    );
  }
}
