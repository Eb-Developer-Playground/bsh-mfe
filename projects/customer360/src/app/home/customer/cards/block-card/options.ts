export const reasons: BlockCardReason[] = [
  { value: 'Customer Request', label: 'CARDS.REASONS-CUSTOMER_REQUEST' },
  { value: 'Stolen or Lost Card', label: 'CARDS.REASONS-STOLEN_LOST_CARD' },
  { value: 'Other', label: 'CARDS.REASONS-OTHER' },
];

export const typesOfBlocking: TypeOfBlocking[] = [
  {
    title: 'Permanently block card',
    description:
      'Block and disable card transactions for a indefinite amount of time. ',
  },
  {
    title: 'Temporarily block card',
    description:
      'Block and disable card transactions for a defined amount of time. ',
  },
];

export type BlockCardReason = {
  text?: string;
  value?: string;
  label?: string;
};

export type TypeOfBlocking = {
  title: string;
  description: string;
};
