export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

export interface StarAward {
  count: number;
  tier: 1 | 2 | 3;
}
