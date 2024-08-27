export interface Request {
  idRequest: number;
  name: string;
  lastName: string;
  telephone: string;
  email: string;
  requestType: number;
  state: number;
  idReviwer: string;
  appointmentLocation: string;
  appointment: Date;
  requestComment: string;
}

export interface RequestResponse {
    estadoSolicitud: string;
    noSolicitud: number;
    nombreRevisonr: string;
    nombreSolicitante: string;
    punteo : number;
}
