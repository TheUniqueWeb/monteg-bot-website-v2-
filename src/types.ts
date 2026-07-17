export interface User {
  id: string; // unique ID or Telegram ID
  full_name: string;
  username: string;
  mobile: string;
  profile_photo_url?: string;
  ad_balance: number;
  task_balance: number;
  refer_balance: number;
  total_balance: number;
  refer_by?: string;
  join_date: string;
  status: 'active' | 'banned';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  amount: number;
  link: string;
  proof_type: 'text' | 'image';
  verify_method: 'auto' | 'manual';
  completed_count: number;
  limit_count: number;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  proof_data: string; // text proof or image URL
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
  task_title?: string;
  user_name?: string;
}

export interface Ad {
  id: string;
  title: string;
  reward: number;
  limit_count: number;
  completed_count: number;
  duration: number; // in seconds
}

export interface Withdrawal {
  id: string;
  user_id: string;
  number: string;
  payment_method: 'Bkash' | 'Nagad' | 'Rocket';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
  user_name?: string;
}

export interface Banner {
  id: string;
  image_url: string;
  link_url?: string;
  title?: string;
}

export interface AppConfig {
  bot_token: string;
  monteg_link: string;
  per_ad_amount: number;
  refer_reward: number;
  ad_limit: number;
  min_withdraw: number;
  support_link: string;
  scrolling_notice: string;
}
