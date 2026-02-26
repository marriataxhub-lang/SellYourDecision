export type Category = "Career" | "Relationships" | "Lifestyle" | "Money (safe)" | "Other";

export type Decision = {
  id: string;
  created_at: string;
  title: string;
  details: string;
  option_a: string;
  option_b: string;
  category: Category;
  expires_at: string;
  vote_count_a: number;
  vote_count_b: number;
};

export type Choice = "A" | "B";
