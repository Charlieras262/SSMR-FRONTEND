export interface RegulatoryDto {
    nombre: string;
    descripcion: string;
    documento: string;
    requisitos: { nombre: string; descripcion: string;  }[];
}


export interface Requisitos{
    requisitos: { nombre: string; descripcion: string;  }[];
}
