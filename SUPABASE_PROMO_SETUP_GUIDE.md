# 🚀 Supabase Free Cloud Database Setup Guide for DigiKaveri Promo Codes

This guide explains how to set up a **100% Free Supabase Database** to track and burn single-use promo/cheat codes globally in real time across all devices, browsers, and incognito sessions.

---

## 💎 Free Tier Limits (Supabase)
- **Database Storage**: 500 MB (holds millions of promo codes)
- **API Requests**: Unlimited (up to 500,000 requests / month for free)
- **Cost**: **0.00 € / month forever** (No credit card required to start)

---

## 🛠️ Step-by-Step Setup (Takes ~2 Minutes)

### Step 1: Create a Free Account & Project
1. Go to [supabase.com](https://supabase.com) and click **"Start your project"**.
2. Sign in with GitHub or your email.
3. Click **"New project"**:
   - **Name**: `digikaveri-db`
   - **Database Password**: *(Create a secure password or generate one)*
   - **Region**: `Europe (Frankfurt)` or `Europe (London)` (Fastest for Finland)
   - **Pricing Plan**: **Free ($0)**
4. Click **"Create new project"** (takes ~30 seconds to spin up).

---

### Step 2: Create the `redeemed_codes` Table
1. In your Supabase Dashboard, click the **SQL Editor** icon on the left sidebar.
2. Click **"New query"**, paste this SQL snippet, and click **Run**:

```sql
-- Create table for single-use redeemed promo codes
create table if not exists redeemed_codes (
  code text primary key,
  discount int not null,
  redeemed_at timestamp with time zone default now()
);

-- Enable public read & insert (Row Level Security)
alter table redeemed_codes enable row level security;

create policy "Allow public to check codes"
  on redeemed_codes for select
  using (true);

create policy "Allow public to redeem codes"
  on redeemed_codes for insert
  with check (true);
```

---

### Step 3: Copy Your Project URL & Anon Key
1. Go to **Project Settings** (gear icon on bottom left) $\rightarrow$ **API**.
2. Copy the two values:
   - **Project URL**: `https://xyzcompany.supabase.co`
   - **anon / public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔌 How We Connect It in DigiKaveri (Ready for Tomorrow)

When you resume tomorrow, all we need to do is paste your Supabase URL & Public Key into `src/js/promo-validator.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Check if code has been burned globally in real-time
export async function isCodeRedeemedInCloud(code) {
  const { data } = await supabase
    .from('redeemed_codes')
    .select('code')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  return !!data;
}

// 2. Burn the code in real-time globally on booking click
export async function redeemCodeInCloud(code, discount) {
  await supabase
    .from('redeemed_codes')
    .insert([{ code: code.toUpperCase(), discount }]);
}
```

---

## 🎯 How It Operates Once Live
1. Customer enters `DK15-3AKB63` on their iPhone $\rightarrow$ Supabase confirms it's valid.
2. Customer clicks **"Varaa palvelu"** $\rightarrow$ Supabase records `DK15-3AKB63` as redeemed instantly (0.05s).
3. If they open Chrome on a computer or Incognito mode and type `DK15-3AKB63` $\rightarrow$ The website checks Supabase in real-time and rejects it:
   > *"Tämä uniikki alennuskoodi on jo käytetty."*
