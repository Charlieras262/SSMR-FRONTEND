import { environment } from 'src/environments/environment';
import { RequestEnacterDto } from './../models/RequestEnacterDto';
import { GeneralService } from './general.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRequestService {

  constructor(private general:GeneralService) { }


  createUserRequest(user:RequestEnacterDto){

return this.general.postData<Request,RequestEnacterDto>(`${environment.api}/external/save/requestUserEnacters`,user);

  }
}
