export type Exam = {
  id: string;
  slug: string;
  name: string;
  description: string;
  subjects: string[];
  status: "active" | "coming_soon";
};
export type Test = {
  id: number;
  exam_id: string;
  test_name: string;
  duration_minutes: number;
  subject_topic: string;
  instructions: string;
  test_category: "standard" | "demo" | "upcoming";
  date_scheduled: string | null;
  published: boolean;
};
export type Bundle = {
  id: number;
  exam_id: string;
  bundle_name: string;
  description: string;
  price: number;
  features: string[];
  published: boolean;
};
export type Question = {
  id: number;
  question_text: string;
  options: Record<string, string>;
  marks: number;
  image_url: string | null;
};
export type Attempt = {
  id: string;
  test_id: number;
  ends_at: string;
  questions: Question[];
  answers: Record<string, string>;
};
export type Result = {
  id: string;
  test_id: number;
  score: number;
  total_marks: number;
  correct_count: number;
  question_count: number;
  submitted_at: string;
  tests: { test_name: string } | null;
};
export type Profile = {
  id: string;
  full_name: string;
  school_name: string;
  mobile_number: string;
  city: string;
  dob: string | null;
  gender: string;
  state: string;
  country: string;
  role: "student" | "admin";
};
