# Demo Data Setup Guide

This guide explains how to populate your Supabase database with demo/sample data for development and testing.

## Overview

The CareerIQ application includes sample data for:
- **Mentors**: 8 demo mentors with different expertise areas
- **Colleges**: 12 demo colleges with placement and fee information

## Setup Methods

### Method 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query for mentors:
   - Copy the SQL INSERT statements from `scripts/seed-demo-mentors.ts`
   - Run the query

4. Create a new query for colleges:
   - Copy the SQL INSERT statements from `scripts/seed-demo-colleges.ts`
   - Run the query

### Method 2: Using the Seed Scripts Locally

First, install dependencies if not already done:
```bash
pnpm install
```

Run the mentors seed script:
```bash
npx ts-node scripts/seed-demo-mentors.ts
```

Run the colleges seed script:
```bash
npx ts-node scripts/seed-demo-colleges.ts
```

**Note**: Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Demo Data Details

### Mentors
The demo includes 8 mentors across different roles:
1. **Sarah Chen** - Senior Software Engineer (Full-stack, JavaScript, React, Node.js)
2. **Raj Patel** - Head of Product (Product Management, Strategy)
3. **Emily Rodriguez** - Lead Data Scientist (ML, Python, Data Analysis)
4. **Michael Johnson** - Cloud Architect (AWS, Kubernetes, DevOps)
5. **Jessica Williams** - Design Lead (UI/UX, Design Systems)
6. **David Lee** - Tech Startup Co-founder (Full-stack, Entrepreneurship)
7. **Amanda Foster** - VP Business Development (Sales, Partnerships)
8. **Robert Kim** - Senior QA Engineer (QA Automation, Testing)

### Colleges
The demo includes 12 colleges across India:
- **Government Colleges**: IIT Delhi, NIT Trichy, Delhi University, Pune University, Anna University
- **Private Colleges**: Manipal, BITS Pilani, Ashoka University, VIT, Jio Institute, Symbiosis
- Diverse programs: Computer Science, Engineering, Business, Economics
- Varied budget ranges: ₹50,000 - ₹40,00,000
- Placement information and average packages

## Data Characteristics

All demo data is clearly labeled as samples:
- No real contact information
- Realistic but educational data
- Covers multiple specializations and locations
- Includes diverse budget ranges for college recommendations

## Resetting Demo Data

To clear the demo data and start fresh:

1. Go to Supabase **SQL Editor**
2. Delete from mentors table:
   ```sql
   DELETE FROM mentors WHERE id LIKE 'mentor-%';
   ```
3. Delete from colleges table:
   ```sql
   DELETE FROM colleges WHERE id LIKE 'college-%';
   ```

Or delete all records:
```sql
DELETE FROM mentors;
DELETE FROM colleges;
```

## Important Notes

- ⚠️ **Development Only**: This data is for development and demo purposes only
- ⚠️ **Avoid Duplicates**: The seed scripts check for existing data to prevent duplicates
- ⚠️ **Avatar Images**: The demo mentors use images from `/public/a1.png` to `/public/a6.png`
- ✅ **Production Ready**: When deploying to production, use real mentor and college data

## Troubleshooting

**Issue**: "Error checking existing mentors"
- **Solution**: Ensure your Supabase connection is working and tables exist

**Issue**: "No mentors found when loading the page"
- **Solution**: Verify the seed script ran successfully and data was inserted

**Issue**: Duplicate mentors after running seed script
- **Solution**: Clear existing demo data using the reset commands above, then re-run the seed

## Next Steps

1. Run one of the seed methods above
2. Start the development server: `pnpm dev`
3. Navigate to `/home/mentor-connect` to see demo mentors
4. Navigate to the college recommendations feature to see demo colleges

---

For more information, see the main README.md in the project root.
