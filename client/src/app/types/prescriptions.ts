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
  rightEye: EyePrescription;
  leftEye: EyePrescription;
  doctor: string;
  notes: string;
}
