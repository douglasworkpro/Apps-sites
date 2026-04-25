export interface EmailVariation {
  id: string;
  email: string;
  isUsed: boolean;
  purpose: string;
  observation: string;
  usedDate: string | null;
  createdAt: string;
}
