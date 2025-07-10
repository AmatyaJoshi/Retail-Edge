export interface EyePrescription {
  sphere: number;
  cylinder: number | undefined;
  axis: number | undefined;
  add: number | undefined;
  pd: number | undefined;
}

export interface Prescription {
  id: string;
  customerId: string;
  date: string;
  expiryDate: string;
  rightEye: {
    sphere: number;
    cylinder: number;
    axis: number;
    add: number;
    pd: number;
  };
  leftEye: {
    sphere: number;
    cylinder: number;
    axis: number;
    add: number;
    pd: number;
  };
  doctor: string;
  notes?: string;
}
