import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, Task, TaskSubmission, Ad, Withdrawal, Banner, AppConfig } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase if credentials are provided in env
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("SUPABASE_URL and SUPABASE_ANON_KEY are not configured. Falling back to persistent Local JSON Database.");
}

// -----------------------------------------------------------------------------
// LOCAL PERSISTENT JSON DATABASE IMPLEMENTATION
// -----------------------------------------------------------------------------
const MOCK_DB_FILE = path.join(process.cwd(), "mock_db.json");

interface MockDatabase {
  configs: Record<string, string>;
  users: User[];
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  ads: Ad[];
  adViews: { user_id: string; ad_id: string; viewed_at: string }[];
  withdrawals: Withdrawal[];
  banners: Banner[];
}

const DEFAULT_MOCK_DB: MockDatabase = {
  configs: {
    bot_token: "719405829:AAH_montegBot_WebDemoExample",
    monteg_link: "https://t.me/monteg_earning_bot",
    per_ad_amount: "0.05",
    refer_reward: "0.20",
    ad_limit: "10",
    min_withdraw: "2.00",
    support_link: "https://t.me/monteg_earn_support",
    scrolling_notice: "📢 Welcome to Monteg Bot Platform! Complete Tasks, Watch Ads, and Refer Friends to earn real rewards. Double bonus active this week!"
  },
  users: [
    {
      id: "683921",
      full_name: "Mahamudur Rahman",
      username: "mahamudur778",
      mobile: "+8801712345678",
      profile_photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      ad_balance: 0.15,
      task_balance: 0.45,
      refer_balance: 0.60,
      total_balance: 1.20,
      join_date: "2026-06-15T10:30:00Z",
      status: "active"
    },
    {
      id: "928374",
      full_name: "Sajib Ahmed",
      username: "sajib_earn",
      mobile: "+8801822334455",
      profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      ad_balance: 0.85,
      task_balance: 1.20,
      refer_balance: 1.80,
      total_balance: 3.85,
      refer_by: "683921",
      join_date: "2026-06-20T14:45:00Z",
      status: "active"
    },
    {
      id: "102938",
      full_name: "Tariqul Islam",
      username: "tariq_dev",
      mobile: "+8801911223344",
      profile_photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      ad_balance: 0.10,
      task_balance: 0.00,
      refer_balance: 0.00,
      total_balance: 0.10,
      refer_by: "683921",
      join_date: "2026-07-01T08:15:00Z",
      status: "active"
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Join Monteg official Telegram",
      description: "Join our official announcements group. We share payment proofs and daily codes here. Instant auto-verify!",
      amount: 0.15,
      link: "https://t.me/monteg_earning_channel",
      proof_type: "text",
      verify_method: "auto",
      completed_count: 324,
      limit_count: 5000
    },
    {
      id: "task-2",
      title: "Follow Monteg on X (Twitter)",
      description: "Follow our official handle @MontegEarn on Twitter. Upload a high-quality screenshot showing that you are following us as proof.",
      amount: 0.25,
      link: "https://twitter.com/MontegEarn",
      proof_type: "image",
      verify_method: "manual",
      completed_count: 142,
      limit_count: 1000
    },
    {
      id: "task-3",
      title: "Subscribe & Like YouTube Video",
      description: "Subscribe to our sponsors YouTube channel and like the latest video. Paste your YouTube account/channel name in the proof box below.",
      amount: 0.20,
      link: "https://youtube.com",
      proof_type: "text",
      verify_method: "manual",
      completed_count: 85,
      limit_count: 1500
    },
    {
      id: "task-4",
      title: "Share Promo on Facebook Profile",
      description: "Share the pinned post of our FB page to your personal profile. Ensure it is public and submit your Facebook Profile URL for manual review.",
      amount: 0.35,
      link: "https://facebook.com",
      proof_type: "text",
      verify_method: "manual",
      completed_count: 19,
      limit_count: 500
    }
  ],
  taskSubmissions: [
    {
      id: "sub-1",
      task_id: "task-2",
      user_id: "928374",
      proof_data: "https://images.unsplash.com/photo-1611605698335-8b15d27e03f9?auto=format&fit=crop&q=80&w=300",
      status: "pending",
      submitted_at: "2026-07-15T18:22:12Z",
      task_title: "Follow Monteg on X (Twitter)",
      user_name: "Sajib Ahmed"
    }
  ],
  ads: [
    {
      id: "ad-1",
      title: "MultiTag Auto-Optimization Unit",
      reward: 0.60,
      completed_count: 482,
      limit_count: 50000,
      duration: 15
    },
    {
      id: "ad-2",
      title: "Direct Link Smart Redirect Zone",
      reward: 0.50,
      completed_count: 923,
      limit_count: 50000,
      duration: 8
    },
    {
      id: "ad-3",
      title: "Popunder High CPM Monetization Zone",
      reward: 0.30,
      completed_count: 754,
      limit_count: 50000,
      duration: 12
    },
    {
      id: "ad-4",
      title: "In-Page Push Floating Social Bar",
      reward: 0.25,
      completed_count: 1205,
      limit_count: 50000,
      duration: 6
    },
    {
      id: "ad-5",
      title: "Vignette Banner Premium Overlay",
      reward: 0.40,
      completed_count: 310,
      limit_count: 50000,
      duration: 10
    }
  ],
  adViews: [],
  withdrawals: [
    {
      id: "withdraw-1",
      user_id: "928374",
      number: "01799887766",
      payment_method: "Bkash",
      amount: 2.50,
      status: "pending",
      submitted_at: "2026-07-16T11:00:00Z",
      user_name: "Sajib Ahmed"
    },
    {
      id: "withdraw-2",
      user_id: "683921",
      number: "01999887766",
      payment_method: "Nagad",
      amount: 4.00,
      status: "approved",
      submitted_at: "2026-07-10T15:30:00Z",
      user_name: "Mahamudur Rahman"
    }
  ],
  banners: [
    {
      id: "banner-1",
      image_url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800",
      link_url: "https://t.me/monteg_earning_bot",
      title: "Special Referral Bonus Banner"
    },
    {
      id: "banner-2",
      image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800",
      link_url: "https://t.me/monteg_earning_channel",
      title: "Join Official Announcements"
    }
  ]
};

function readDb(): MockDatabase {
  try {
    if (fs.existsSync(MOCK_DB_FILE)) {
      const data = fs.readFileSync(MOCK_DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read local DB file:", err);
  }
  // Initialize file with default database
  writeDb(DEFAULT_MOCK_DB);
  return DEFAULT_MOCK_DB;
}

function writeDb(data: MockDatabase) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local DB file:", err);
  }
}

// Ensure the DB exists and is loaded on start
let mockDb = readDb();

if (mockDb.ads && mockDb.ads.length < 100) {
  for (let i = mockDb.ads.length + 1; i <= 100; i++) {
    mockDb.ads.push({
      id: `ad-${i}`,
      title: `Monetag Auto Placement Unit #${i}`,
      reward: 0.15,
      completed_count: 0,
      limit_count: 100000,
      duration: 10
    });
  }
  writeDb(mockDb);
}

// -----------------------------------------------------------------------------
// DATABASE INTERFACES (SUPABASE OR MOCK FALLBACK DYNAMIC DRIVER)
// -----------------------------------------------------------------------------
const DB = {
  getConfigs: async (): Promise<AppConfig> => {
    if (supabase) {
      const { data, error } = await supabase.from("configs").select("*");
      if (!error && data) {
        const configMap: Record<string, any> = {};
        data.forEach(item => {
          configMap[item.key] = item.value;
        });
        return {
          bot_token: configMap.bot_token || DEFAULT_MOCK_DB.configs.bot_token,
          monteg_link: configMap.monteg_link || DEFAULT_MOCK_DB.configs.monteg_link,
          per_ad_amount: Number(configMap.per_ad_amount || DEFAULT_MOCK_DB.configs.per_ad_amount),
          refer_reward: Number(configMap.refer_reward || DEFAULT_MOCK_DB.configs.refer_reward),
          ad_limit: Number(configMap.ad_limit || DEFAULT_MOCK_DB.configs.ad_limit),
          min_withdraw: Number(configMap.min_withdraw || DEFAULT_MOCK_DB.configs.min_withdraw),
          support_link: configMap.support_link || DEFAULT_MOCK_DB.configs.support_link,
          scrolling_notice: configMap.scrolling_notice || DEFAULT_MOCK_DB.configs.scrolling_notice,
        };
      }
    }
    // Fallback
    const configs = mockDb.configs;
    return {
      bot_token: configs.bot_token,
      monteg_link: configs.monteg_link,
      per_ad_amount: Number(configs.per_ad_amount),
      refer_reward: Number(configs.refer_reward),
      ad_limit: Number(configs.ad_limit),
      min_withdraw: Number(configs.min_withdraw),
      support_link: configs.support_link,
      scrolling_notice: configs.scrolling_notice
    };
  },

  updateConfig: async (key: string, value: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("configs").upsert({ key, value });
      return !error;
    }
    mockDb.configs[key] = value;
    writeDb(mockDb);
    return true;
  },

  getUsers: async (): Promise<User[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("users").select("*").order("join_date", { ascending: false });
      if (!error && data) return data as User[];
    }
    return mockDb.users;
  },

  getUser: async (id: string): Promise<User | null> => {
    if (supabase) {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
      if (!error && data) return data as User;
    }
    return mockDb.users.find(u => u.id === id) || null;
  },

  createUser: async (user: User): Promise<User> => {
    if (supabase) {
      const { data, error } = await supabase.from("users").insert(user).select().single();
      if (!error && data) return data as User;
    }
    mockDb.users.push(user);
    writeDb(mockDb);
    return user;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    if (supabase) {
      const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single();
      if (!error && data) return data as User;
    }
    const idx = mockDb.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      mockDb.users[idx] = { ...mockDb.users[idx], ...updates };
      writeDb(mockDb);
      return mockDb.users[idx];
    }
    return null;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      return !error;
    }
    const len = mockDb.users.length;
    mockDb.users = mockDb.users.filter(u => u.id !== id);
    writeDb(mockDb);
    return mockDb.users.length < len;
  },

  getTasks: async (): Promise<Task[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("tasks").select("*");
      if (!error && data) return data as Task[];
    }
    return mockDb.tasks;
  },

  createTask: async (task: Task): Promise<Task> => {
    if (supabase) {
      const { data, error } = await supabase.from("tasks").insert(task).select().single();
      if (!error && data) return data as Task;
    }
    mockDb.tasks.push(task);
    writeDb(mockDb);
    return task;
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    if (supabase) {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
      if (!error && data) return data as Task;
    }
    const idx = mockDb.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      mockDb.tasks[idx] = { ...mockDb.tasks[idx], ...updates };
      writeDb(mockDb);
      return mockDb.tasks[idx];
    }
    return null;
  },

  deleteTask: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      return !error;
    }
    const len = mockDb.tasks.length;
    mockDb.tasks = mockDb.tasks.filter(t => t.id !== id);
    writeDb(mockDb);
    return mockDb.tasks.length < len;
  },

  getTaskSubmissions: async (): Promise<TaskSubmission[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("task_submissions").select("*").order("submitted_at", { ascending: false });
      if (!error && data) return data as TaskSubmission[];
    }
    return mockDb.taskSubmissions;
  },

  createTaskSubmission: async (sub: TaskSubmission): Promise<TaskSubmission> => {
    if (supabase) {
      const { data, error } = await supabase.from("task_submissions").insert(sub).select().single();
      if (!error && data) return data as TaskSubmission;
    }
    mockDb.taskSubmissions.unshift(sub);
    writeDb(mockDb);
    return sub;
  },

  updateTaskSubmission: async (id: string, updates: Partial<TaskSubmission>): Promise<TaskSubmission | null> => {
    if (supabase) {
      const { data, error } = await supabase.from("task_submissions").update(updates).eq("id", id).select().single();
      if (!error && data) return data as TaskSubmission;
    }
    const idx = mockDb.taskSubmissions.findIndex(s => s.id === id);
    if (idx !== -1) {
      mockDb.taskSubmissions[idx] = { ...mockDb.taskSubmissions[idx], ...updates };
      writeDb(mockDb);
      return mockDb.taskSubmissions[idx];
    }
    return null;
  },

  getAds: async (): Promise<Ad[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("ads").select("*");
      if (!error && data) return data as Ad[];
    }
    return mockDb.ads;
  },

  createAd: async (ad: Ad): Promise<Ad> => {
    if (supabase) {
      const { data, error } = await supabase.from("ads").insert(ad).select().single();
      if (!error && data) return data as Ad;
    }
    mockDb.ads.push(ad);
    writeDb(mockDb);
    return ad;
  },

  updateAd: async (id: string, updates: Partial<Ad>): Promise<Ad | null> => {
    if (supabase) {
      const { data, error } = await supabase.from("ads").update(updates).eq("id", id).select().single();
      if (!error && data) return data as Ad;
    }
    const idx = mockDb.ads.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockDb.ads[idx] = { ...mockDb.ads[idx], ...updates };
      writeDb(mockDb);
      return mockDb.ads[idx];
    }
    return null;
  },

  deleteAd: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("ads").delete().eq("id", id);
      return !error;
    }
    const len = mockDb.ads.length;
    mockDb.ads = mockDb.ads.filter(a => a.id !== id);
    writeDb(mockDb);
    return mockDb.ads.length < len;
  },

  getUserCompletedAds: async (userId: string): Promise<string[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("ad_views").select("ad_id").eq("user_id", userId);
      if (!error && data) return data.map(item => item.ad_id);
    }
    return mockDb.adViews.filter(av => av.user_id === userId).map(av => av.ad_id);
  },

  createUserAdView: async (userId: string, adId: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("ad_views").insert({ user_id: userId, ad_id: adId });
      return !error;
    }
    const exists = mockDb.adViews.some(av => av.user_id === userId && av.ad_id === adId);
    if (!exists) {
      mockDb.adViews.push({ user_id: userId, ad_id: adId, viewed_at: new Date().toISOString() });
      writeDb(mockDb);
    }
    return true;
  },

  getWithdrawals: async (): Promise<Withdrawal[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("withdrawals").select("*").order("submitted_at", { ascending: false });
      if (!error && data) return data as Withdrawal[];
    }
    return mockDb.withdrawals;
  },

  createWithdrawal: async (withdrawal: Withdrawal): Promise<Withdrawal> => {
    if (supabase) {
      const { data, error } = await supabase.from("withdrawals").insert(withdrawal).select().single();
      if (!error && data) return data as Withdrawal;
    }
    mockDb.withdrawals.unshift(withdrawal);
    writeDb(mockDb);
    return withdrawal;
  },

  updateWithdrawal: async (id: string, updates: Partial<Withdrawal>): Promise<Withdrawal | null> => {
    if (supabase) {
      const { data, error } = await supabase.from("withdrawals").update(updates).eq("id", id).select().single();
      if (!error && data) return data as Withdrawal;
    }
    const idx = mockDb.withdrawals.findIndex(w => w.id === id);
    if (idx !== -1) {
      mockDb.withdrawals[idx] = { ...mockDb.withdrawals[idx], ...updates };
      writeDb(mockDb);
      return mockDb.withdrawals[idx];
    }
    return null;
  },

  getBanners: async (): Promise<Banner[]> => {
    if (supabase) {
      const { data, error } = await supabase.from("banners").select("*");
      if (!error && data) return data as Banner[];
    }
    return mockDb.banners;
  },

  createBanner: async (banner: Banner): Promise<Banner> => {
    if (supabase) {
      const { data, error } = await supabase.from("banners").insert(banner).select().single();
      if (!error && data) return data as Banner;
    }
    mockDb.banners.push(banner);
    writeDb(mockDb);
    return banner;
  },

  deleteBanner: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      return !error;
    }
    const len = mockDb.banners.length;
    mockDb.banners = mockDb.banners.filter(b => b.id !== id);
    writeDb(mockDb);
    return mockDb.banners.length < len;
  }
};

// -----------------------------------------------------------------------------
// REST API ENDPOINTS
// -----------------------------------------------------------------------------

// Global configuration fetch
app.get("/api/config", async (req, res) => {
  try {
    const config = await DB.getConfigs();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User initialization or login
app.post("/api/user/init", async (req, res) => {
  try {
    const { id, full_name, username, mobile, refer_by, profile_photo_url } = req.body;
    if (!id || !full_name) {
      return res.status(400).json({ error: "Missing required fields: id and full_name are required." });
    }

    let user = await DB.getUser(id);
    if (!user) {
      // New registration
      const cleanReferBy = refer_by && refer_by !== id ? refer_by : undefined;
      const config = await DB.getConfigs();

      // Create new user entry
      const newUser: User = {
        id,
        full_name,
        username: username || "",
        mobile: mobile || "",
        profile_photo_url: profile_photo_url || "",
        ad_balance: 0.00,
        task_balance: 0.00,
        refer_balance: 0.00,
        total_balance: 0.00,
        refer_by: cleanReferBy,
        join_date: new Date().toISOString(),
        status: "active"
      };

      user = await DB.createUser(newUser);

      // Apply Referral reward to the referrer if set
      if (cleanReferBy) {
        const referrer = await DB.getUser(cleanReferBy);
        if (referrer && referrer.status === "active") {
          const referReward = config.refer_reward || 0.20;
          await DB.updateUser(cleanReferBy, {
            refer_balance: parseFloat((referrer.refer_balance + referReward).toFixed(2)),
            total_balance: parseFloat((referrer.total_balance + referReward).toFixed(2))
          });
        }
      }
    }

    if (user.status === "banned") {
      return res.status(403).json({ error: "This account has been banned by the Administrator." });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch user profile stats
app.get("/api/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await DB.getUser(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.status === "banned") {
      return res.status(403).json({ error: "Your account is banned." });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch referrals for a user
app.get("/api/user/:id/referrals", async (req, res) => {
  try {
    const { id } = req.params;
    const allUsers = await DB.getUsers();
    const referrals = allUsers.filter(u => u.refer_by === id);
    res.json(referrals.map(r => ({
      id: r.id,
      full_name: r.full_name,
      username: r.username,
      join_date: r.join_date
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Banners endpoints
app.get("/api/banners", async (req, res) => {
  try {
    const banners = await DB.getBanners();
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Ads view and watch completion
app.get("/api/ads", async (req, res) => {
  try {
    const ads = await DB.getAds();
    res.json(ads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/:userId/completed-ads", async (req, res) => {
  try {
    const { userId } = req.params;
    const completedAdIds = await DB.getUserCompletedAds(userId);
    res.json(completedAdIds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ads/watch", async (req, res) => {
  try {
    const { userId, adId } = req.body;
    if (!userId || !adId) {
      return res.status(400).json({ error: "Missing userId or adId." });
    }

    const user = await DB.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.status === "banned") return res.status(403).json({ error: "User is banned." });

    const ads = await DB.getAds();
    const ad = ads.find(a => a.id === adId);
    if (!ad) return res.status(404).json({ error: "Ad not found." });

    // Verify limit status
    if (ad.completed_count >= ad.limit_count) {
      return res.status(400).json({ error: "This advertisement has reached its completion limit." });
    }

    // Check if user already completed this ad
    const completed = await DB.getUserCompletedAds(userId);
    if (completed.includes(adId)) {
      return res.status(400).json({ error: "You have already watched this ad today." });
    }

    const config = await DB.getConfigs();
    const adReward = config.per_ad_amount || ad.reward || 0.05;

    // Record the watch
    await DB.createUserAdView(userId, adId);

    // Update Ad completes
    await DB.updateAd(adId, { completed_count: ad.completed_count + 1 });

    // Update User Balance
    const updatedUser = await DB.updateUser(userId, {
      ad_balance: parseFloat((user.ad_balance + adReward).toFixed(2)),
      total_balance: parseFloat((user.total_balance + adReward).toFixed(2))
    });

    res.json({
      success: true,
      reward: adReward,
      user: updatedUser
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks endpoints
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await DB.getTasks();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch submissions for user to show completed/pending state
app.get("/api/user/:userId/submissions", async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await DB.getTaskSubmissions();
    const userSubs = submissions.filter(s => s.user_id === userId);
    res.json(userSubs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Task proof
app.post("/api/tasks/submit", async (req, res) => {
  try {
    const { userId, taskId, proofData } = req.body;
    if (!userId || !taskId || !proofData) {
      return res.status(400).json({ error: "Missing required submission fields." });
    }

    const user = await DB.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.status === "banned") return res.status(403).json({ error: "User is banned." });

    const tasks = await DB.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });

    // Check existing submissions
    const submissions = await DB.getTaskSubmissions();
    const existing = submissions.find(s => s.user_id === userId && s.task_id === taskId && s.status !== "rejected");
    if (existing) {
      return res.status(400).json({ error: "You already have an active submission for this task." });
    }

    const newSub: TaskSubmission = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      task_id: taskId,
      user_id: userId,
      proof_data: proofData,
      status: task.verify_method === "auto" ? "approved" : "pending",
      submitted_at: new Date().toISOString(),
      task_title: task.title,
      user_name: user.full_name
    };

    const createdSub = await DB.createTaskSubmission(newSub);

    let updatedUser = user;
    if (task.verify_method === "auto") {
      // Auto verify applies the rewards immediately
      const taskReward = task.amount;
      updatedUser = (await DB.updateUser(userId, {
        task_balance: parseFloat((user.task_balance + taskReward).toFixed(2)),
        total_balance: parseFloat((user.total_balance + taskReward).toFixed(2))
      })) || user;

      await DB.updateTask(taskId, { completed_count: (task.completed_count || 0) + 1 });
    }

    res.json({
      success: true,
      submission: createdSub,
      user: updatedUser
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Withdrawal Request Submission
app.post("/api/withdraw", async (req, res) => {
  try {
    const { userId, number, paymentMethod, amount } = req.body;
    if (!userId || !number || !paymentMethod || !amount) {
      return res.status(400).json({ error: "Missing required withdrawal parameters." });
    }

    const user = await DB.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.status === "banned") return res.status(403).json({ error: "User is banned." });

    const config = await DB.getConfigs();
    const minWithdraw = config.min_withdraw || 2.00;

    if (amount < minWithdraw) {
      return res.status(400).json({ error: `Minimum withdrawal amount is $${minWithdraw.toFixed(2)}.` });
    }

    if (user.total_balance < amount) {
      return res.status(400).json({ error: "Insufficient account balance." });
    }

    // Deduct balances immediately to lock funds safely
    const updatedUser = await DB.updateUser(userId, {
      total_balance: parseFloat((user.total_balance - amount).toFixed(2))
    });

    const newWithdrawal: Withdrawal = {
      id: "wd-" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      number,
      payment_method: paymentMethod,
      amount: Number(amount),
      status: "pending",
      submitted_at: new Date().toISOString(),
      user_name: user.full_name
    };

    const createdWd = await DB.createWithdrawal(newWithdrawal);

    res.json({
      success: true,
      withdrawal: createdWd,
      user: updatedUser
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/:userId/withdrawals", async (req, res) => {
  try {
    const { userId } = req.params;
    const withdrawals = await DB.getWithdrawals();
    const userWds = withdrawals.filter(w => w.user_id === userId);
    res.json(userWds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get top 10 earners publicly
app.get("/api/top-earners", async (req, res) => {
  try {
    const users = await DB.getUsers();
    const topEarners = [...users]
      .sort((a, b) => b.total_balance - a.total_balance)
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        total_balance: u.total_balance,
        profile_photo_url: u.profile_photo_url,
        join_date: u.join_date
      }));
    res.json(topEarners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// ADMIN MANAGEMENT ENDPOINTS
// -----------------------------------------------------------------------------

// Admin authenticate
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required." });
    }

    // Default built-in admin credentials check
    // We also support validating against Supabase if credentials exist there
    const adminEmail = process.env.ADMIN_EMAIL || "admin@monteg.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email === adminEmail && password === adminPassword) {
      return res.json({ success: true, token: "admin-jwt-mock-token-secret" });
    }

    res.status(401).json({ error: "Invalid Admin Email or Password." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get global user list (Admin only)
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await DB.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update User details / ban / balances (Admin only)
app.post("/api/admin/users/update", async (req, res) => {
  try {
    const { id, updates } = req.body;
    if (!id || !updates) {
      return res.status(400).json({ error: "Missing user ID or updates package." });
    }

    const updated = await DB.updateUser(id, updates);
    if (!updated) return res.status(404).json({ error: "User not found." });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (Admin only)
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await DB.deleteUser(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get withdrawal requests (Admin only)
app.get("/api/admin/withdrawals", async (req, res) => {
  try {
    const withdrawals = await DB.getWithdrawals();
    res.json(withdrawals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject Withdrawal (Admin only)
app.post("/api/admin/withdrawals/status", async (req, res) => {
  try {
    const { id, status, rejection_reason } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "Missing withdrawal id or target status." });
    }

    const withdrawals = await DB.getWithdrawals();
    const wd = withdrawals.find(w => w.id === id);
    if (!wd) return res.status(404).json({ error: "Withdrawal request not found." });

    // Handle return of funds on rejection
    if (status === "rejected" && wd.status === "pending") {
      const user = await DB.getUser(wd.user_id);
      if (user) {
        await DB.updateUser(wd.user_id, {
          total_balance: parseFloat((user.total_balance + wd.amount).toFixed(2))
        });
      }
    }

    const updated = await DB.updateWithdrawal(id, {
      status,
      rejection_reason: status === "rejected" ? (rejection_reason || "No reason given") : undefined
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get task submissions (Admin only)
app.get("/api/admin/submissions", async (req, res) => {
  try {
    const submissions = await DB.getTaskSubmissions();
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject Task Submission (Admin only)
app.post("/api/admin/submissions/status", async (req, res) => {
  try {
    const { id, status, rejection_reason } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "Missing submission ID or target status." });
    }

    const submissions = await DB.getTaskSubmissions();
    const sub = submissions.find(s => s.id === id);
    if (!sub) return res.status(404).json({ error: "Task submission not found." });

    if (sub.status === "pending" && status === "approved") {
      // Reward the user on manual approval
      const tasks = await DB.getTasks();
      const task = tasks.find(t => t.id === sub.task_id);
      if (task) {
        const user = await DB.getUser(sub.user_id);
        if (user) {
          await DB.updateUser(sub.user_id, {
            task_balance: parseFloat((user.task_balance + task.amount).toFixed(2)),
            total_balance: parseFloat((user.total_balance + task.amount).toFixed(2))
          });
          await DB.updateTask(task.id, { completed_count: (task.completed_count || 0) + 1 });
        }
      }
    }

    const updated = await DB.updateTaskSubmission(id, {
      status,
      rejection_reason: status === "rejected" ? (rejection_reason || "Proof was insufficient") : undefined
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Task Management Endpoints (Admin only)
app.post("/api/admin/tasks", async (req, res) => {
  try {
    const taskData: Task = {
      id: "task-" + Math.random().toString(36).substr(2, 9),
      title: req.body.title,
      description: req.body.description,
      amount: Number(req.body.amount || 0.10),
      link: req.body.link,
      proof_type: req.body.proof_type || "text",
      verify_method: req.body.verify_method || "manual",
      completed_count: 0,
      limit_count: Number(req.body.limit_count || 1000)
    };

    const task = await DB.createTask(taskData);
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await DB.updateTask(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await DB.deleteTask(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Config editing endpoints (Admin only)
app.post("/api/admin/config", async (req, res) => {
  try {
    const updates = req.body;
    for (const key of Object.keys(updates)) {
      await DB.updateConfig(key, String(updates[key]));
    }
    const finalConfig = await DB.getConfigs();
    // Reload local DB if mock in use
    mockDb = readDb();
    res.json({ success: true, config: finalConfig });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Banner management
app.post("/api/admin/banners", async (req, res) => {
  try {
    const { image_url, link_url, title } = req.body;
    const newBanner = await DB.createBanner({
      id: "banner-" + Math.random().toString(36).substr(2, 9),
      image_url,
      link_url,
      title
    });
    res.json(newBanner);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await DB.deleteBanner(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// VITE CLIENT DEV SERVING & PRODUCTION STATIC BUILD
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MONTEG SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
