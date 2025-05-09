export type Reservation = {
  id: string;
  date: string;
  from: string;
  until: string;
  people: number;
  table: number;
  QR_code: string;
};