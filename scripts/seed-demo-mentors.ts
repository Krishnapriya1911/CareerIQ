/**
 * DEMO MENTOR SEED DATA
 *
 * This script contains demo/sample mentor data for the mentors table.
 * Run this script to populate the Supabase mentors table with sample mentors.
 *
 * Usage:
 * npx ts-node scripts/seed-demo-mentors.ts
 *
 * Or use Supabase SQL editor to paste the SQL INSERT statements below.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const demoMentors = [
  {
    id: "mentor-001",
    full_name: "Sarah Chen",
    email: "sarah.chen@example.com",
    phone: "+1-555-0101",
    linkedin: "https://linkedin.com/in/sarahchen",
    bio: "Senior Software Engineer with 8+ years of experience in full-stack development. Passionate about mentoring and helping others grow their careers.",
    expertise: ["JavaScript", "React", "Node.js", "TypeScript", "System Design"],
    current_position: "Senior Engineer @ TechCorp",
    availability: true,
    rating: 4.9,
    avatar: "/a1.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-002",
    full_name: "Raj Patel",
    email: "raj.patel@example.com",
    phone: "+1-555-0102",
    linkedin: "https://linkedin.com/in/rajpatel",
    bio: "Product Manager with 10+ years of experience. Specialized in scaling startups and building user-centric products.",
    expertise: ["Product Management", "Strategy", "Analytics", "User Research", "Growth"],
    current_position: "Head of Product @ StartupXYZ",
    availability: true,
    rating: 4.8,
    avatar: "/a2.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-003",
    full_name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    phone: "+1-555-0103",
    linkedin: "https://linkedin.com/in/emilyrodriguez",
    bio: "Data Scientist and AI specialist. Helping teams implement machine learning solutions and improve data-driven decision making.",
    expertise: ["Machine Learning", "Python", "Data Analysis", "TensorFlow", "SQL"],
    current_position: "Lead Data Scientist @ AI Labs",
    availability: true,
    rating: 4.7,
    avatar: "/a3.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-004",
    full_name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "+1-555-0104",
    linkedin: "https://linkedin.com/in/michaeljohnson",
    bio: "DevOps Engineer and Cloud Architect. Experienced in scaling infrastructure and implementing CI/CD pipelines.",
    expertise: ["AWS", "Kubernetes", "Docker", "CI/CD", "Infrastructure as Code"],
    current_position: "Cloud Architect @ CloudTech",
    availability: true,
    rating: 4.6,
    avatar: "/a4.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-005",
    full_name: "Jessica Williams",
    email: "jessica.williams@example.com",
    phone: "+1-555-0105",
    linkedin: "https://linkedin.com/in/jessicawilliams",
    bio: "UX/UI Designer and Design Systems expert. Creating beautiful and functional user experiences for millions of users.",
    expertise: ["UI/UX Design", "Figma", "Design Systems", "User Research", "Prototyping"],
    current_position: "Design Lead @ DesignStudio",
    availability: true,
    rating: 4.8,
    avatar: "/a5.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-006",
    full_name: "David Lee",
    email: "david.lee@example.com",
    phone: "+1-555-0106",
    linkedin: "https://linkedin.com/in/davidlee",
    bio: "Full-stack developer and startup founder. Building innovative solutions and helping others launch their tech careers.",
    expertise: ["Full-Stack Development", "Startup Strategy", "React", "Python", "Entrepreneurship"],
    current_position: "Co-founder @ TechStartup",
    availability: true,
    rating: 4.7,
    avatar: "/a6.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-007",
    full_name: "Amanda Foster",
    email: "amanda.foster@example.com",
    phone: "+1-555-0107",
    linkedin: "https://linkedin.com/in/amandafoster",
    bio: "Business Development Manager with 7+ years in enterprise sales. Building partnerships and driving growth strategies.",
    expertise: ["Business Development", "Sales Strategy", "Partnership Management", "Negotiation", "Leadership"],
    current_position: "VP of Business Development @ EnterpriseCo",
    availability: true,
    rating: 4.5,
    avatar: "/a1.png",
    is_verified: true,
    video_url: null,
  },
  {
    id: "mentor-008",
    full_name: "Robert Kim",
    email: "robert.kim@example.com",
    phone: "+1-555-0108",
    linkedin: "https://linkedin.com/in/robertkim",
    bio: "QA Engineer and Test Automation expert. Ensuring software quality through comprehensive testing strategies.",
    expertise: ["QA Automation", "Selenium", "Testing Strategy", "Performance Testing", "Bug Analysis"],
    current_position: "Senior QA Engineer @ QualityFirst",
    availability: true,
    rating: 4.6,
    avatar: "/a2.png",
    is_verified: true,
    video_url: null,
  },
];

async function seedMentors() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log("🌱 Starting demo mentor seeding...");

    // Check if mentors already exist
    const { data: existingMentors, error: checkError } = await supabase
      .from("mentors")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("Error checking existing mentors:", checkError);
      return;
    }

    if (existingMentors && existingMentors.length > 0) {
      console.log(
        "✅ Mentors table already has data. Skipping seed to avoid duplicates."
      );
      console.log(
        "   To re-seed, manually delete existing records from the mentors table."
      );
      return;
    }

    // Insert demo mentors
    const { data, error } = await supabase.from("mentors").insert(demoMentors);

    if (error) {
      console.error("❌ Error inserting demo mentors:", error);
      return;
    }

    console.log(`✅ Successfully seeded ${demoMentors.length} demo mentors!`);
    console.log("Demo mentors added:");
    demoMentors.forEach((mentor) => {
      console.log(`  - ${mentor.full_name} (${mentor.current_position})`);
    });
  } catch (error) {
    console.error("❌ Unexpected error during seeding:", error);
  }
}

// Run if this is the main module
if (require.main === module) {
  seedMentors();
}

export { demoMentors, seedMentors };
