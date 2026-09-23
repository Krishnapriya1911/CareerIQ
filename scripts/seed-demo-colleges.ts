/**
 * DEMO COLLEGE SEED DATA
 *
 * This script contains demo/sample college data for the colleges table.
 * Run this script to populate the Supabase colleges table with diverse college options.
 *
 * Usage:
 * npx ts-node scripts/seed-demo-colleges.ts
 *
 * Or use Supabase SQL editor to paste the SQL INSERT statements below.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const demoColleges = [
  {
    id: "college-001",
    college_name: "Indian Institute of Technology (IIT) Delhi",
    location: "New Delhi, India",
    best_suit_for: ["Computer Science", "Engineering", "Technology"],
    fees: "₹2,00,000 - ₹3,50,000",
    placement: "85% placement rate, Average package: ₹18.5 LPA",
    type: "Government",
  },
  {
    id: "college-002",
    college_name: "Delhi University - St. Stephen's College",
    location: "New Delhi, India",
    best_suit_for: ["Computer Science", "Business", "Economics"],
    fees: "₹1,00,000 - ₹1,50,000",
    placement: "72% placement rate, Average package: ₹12.3 LPA",
    type: "Government",
  },
  {
    id: "college-003",
    college_name: "Manipal Institute of Technology",
    location: "Manipal, Karnataka, India",
    best_suit_for: ["Engineering", "Technology", "Business"],
    fees: "₹3,00,000 - ₹4,50,000",
    placement: "88% placement rate, Average package: ₹16.8 LPA",
    type: "Private",
  },
  {
    id: "college-004",
    college_name: "BITS Pilani",
    location: "Pilani, Rajasthan, India",
    best_suit_for: ["Computer Science", "Engineering", "Physics"],
    fees: "₹4,00,000 - ₹5,50,000",
    placement: "92% placement rate, Average package: ₹20.1 LPA",
    type: "Private",
  },
  {
    id: "college-005",
    college_name: "Ashoka University",
    location: "Sonipat, Haryana, India",
    best_suit_for: ["Liberal Arts", "Business", "Economics"],
    fees: "₹35,00,000 - ₹40,00,000",
    placement: "95% placement rate, Average package: ₹19.5 LPA",
    type: "Private",
  },
  {
    id: "college-006",
    college_name: "NIT (National Institute of Technology) Trichy",
    location: "Trichy, Tamil Nadu, India",
    best_suit_for: ["Engineering", "Technology", "Computer Science"],
    fees: "₹1,80,000 - ₹2,50,000",
    placement: "80% placement rate, Average package: ₹14.2 LPA",
    type: "Government",
  },
  {
    id: "college-007",
    college_name: "Vellore Institute of Technology (VIT)",
    location: "Vellore, Tamil Nadu, India",
    best_suit_for: ["Engineering", "Technology", "Biotechnology"],
    fees: "₹3,20,000 - ₹4,20,000",
    placement: "86% placement rate, Average package: ₹15.7 LPA",
    type: "Private",
  },
  {
    id: "college-008",
    college_name: "Delhi School of Economics",
    location: "New Delhi, India",
    best_suit_for: ["Economics", "Business", "Public Policy"],
    fees: "₹80,000 - ₹1,20,000",
    placement: "78% placement rate, Average package: ₹11.5 LPA",
    type: "Government",
  },
  {
    id: "college-009",
    college_name: "Jio Institute",
    location: "Mumbai, Maharashtra, India",
    best_suit_for: ["Computer Science", "Engineering", "Business"],
    fees: "₹5,00,000 - ₹6,50,000",
    placement: "94% placement rate, Average package: ₹21.3 LPA",
    type: "Private",
  },
  {
    id: "college-010",
    college_name: "Pune University - College of Engineering",
    location: "Pune, Maharashtra, India",
    best_suit_for: ["Engineering", "Technology", "Computer Science"],
    fees: "₹1,40,000 - ₹2,00,000",
    placement: "75% placement rate, Average package: ₹13.1 LPA",
    type: "Government",
  },
  {
    id: "college-011",
    college_name: "Symbiosis Institute of Technology",
    location: "Pune, Maharashtra, India",
    best_suit_for: ["Computer Science", "Information Technology", "Business"],
    fees: "₹2,50,000 - ₹3,50,000",
    placement: "84% placement rate, Average package: ₹15.2 LPA",
    type: "Private",
  },
  {
    id: "college-012",
    college_name: "Anna University (MIT Campus)",
    location: "Chennai, Tamil Nadu, India",
    best_suit_for: ["Engineering", "Technology", "Architecture"],
    fees: "₹95,000 - ₹1,50,000",
    placement: "70% placement rate, Average package: ₹10.8 LPA",
    type: "Government",
  },
];

async function seedColleges() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log("🌱 Starting demo college seeding...");

    // Check if colleges already exist
    const { data: existingColleges, error: checkError } = await supabase
      .from("colleges")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("Error checking existing colleges:", checkError);
      return;
    }

    if (existingColleges && existingColleges.length > 0) {
      console.log(
        "✅ Colleges table already has data. Skipping seed to avoid duplicates."
      );
      console.log(
        "   To re-seed, manually delete existing records from the colleges table."
      );
      return;
    }

    // Insert demo colleges
    const { data, error } = await supabase
      .from("colleges")
      .insert(demoColleges);

    if (error) {
      console.error("❌ Error inserting demo colleges:", error);
      return;
    }

    console.log(`✅ Successfully seeded ${demoColleges.length} demo colleges!`);
    console.log("Demo colleges added:");
    demoColleges.forEach((college) => {
      console.log(
        `  - ${college.college_name} (${college.type}) - ${college.location}`
      );
    });
  } catch (error) {
    console.error("❌ Unexpected error during seeding:", error);
  }
}

// Run if this is the main module
if (require.main === module) {
  seedColleges();
}

export { demoColleges, seedColleges };
