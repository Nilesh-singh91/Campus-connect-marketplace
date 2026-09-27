import { PrismaClient } from "@prisma/client";
import { Role, UserStatus, ItemCondition, TransactionType, ListingStatus } from "../src/types/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CampusConnect Marketplace database...");

  // 1. Seed College Domains
  const domains = [
    { domain: "college.edu", collegeName: "National Institute of Technology" },
    { domain: "lit.ac.in", collegeName: "Laxminarayan Innovation & Tech Campus" },
    { domain: "iitb.ac.in", collegeName: "Indian Institute of Technology Bombay" },
    { domain: "nith.ac.in", collegeName: "National Institute of Technology Hamirpur" },
    { domain: "campus.edu", collegeName: "Metropolitan Engineering College" },
  ];

  const domainMap = new Map<string, string>();
  for (const d of domains) {
    const existing = await prisma.collegeDomain.upsert({
      where: { domain: d.domain },
      update: { collegeName: d.collegeName },
      create: { domain: d.domain, collegeName: d.collegeName, isActive: true },
    });
    domainMap.set(d.domain, existing.id);
  }
  console.log(`✓ Seeded ${domains.length} college domains`);

  // 2. Seed Categories
  const categories = [
    {
      name: "Textbooks & Reference Books",
      slug: "textbooks",
      icon: "BookOpen",
      description: "Engineering, Mathematics, CS algorithms, and semester books",
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      icon: "Laptop",
      description: "Laptops, scientific calculators, Arduino kits, keyboards, and headphones",
    },
    {
      name: "Engineering Equipment & Tools",
      slug: "engineering-tools",
      icon: "Wrench",
      description: "Mini drafters, engineering drawing sets, lab coats, and breadboards",
    },
    {
      name: "Handwritten Notes & Materials",
      slug: "notes-materials",
      icon: "FileText",
      description: "Topper notes, gate preparation guides, and practical lab manuals",
    },
    {
      name: "Hostel & Room Essentials",
      slug: "hostel-essentials",
      icon: "Home",
      description: "Study lamps, kettles, extension cords, mattresses, and organizers",
    },
    {
      name: "Bicycles & Campus Mobility",
      slug: "cycles-mobility",
      icon: "Bike",
      description: "Geared & non-geared cycles, locks, and accessories for campus commutes",
    },
    {
      name: "Sports & Fitness Gear",
      slug: "sports-fitness",
      icon: "Trophy",
      description: "Badminton racquets, cricket gear, dumbbells, and footballs",
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const existing = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: { ...cat, isActive: true },
    });
    categoryMap.set(cat.slug, existing.id);
  }
  console.log(`✓ Seeded ${categories.length} categories`);

  // 3. Seed Users
  const defaultPasswordHash = await bcrypt.hash("Campus@1234", 10);
  const collegeDomainId = domainMap.get("college.edu");

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {},
    create: {
      email: "admin@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "System Administrator",
          enrollmentNumber: "ADMIN-001",
          branch: "Dean Student Affairs",
          yearOfStudy: 4,
          bio: "Platform Administrator for CampusConnect",
        },
      },
    },
  });

  // Moderator User
  const moderator = await prisma.user.upsert({
    where: { email: "moderator@college.edu" },
    update: {},
    create: {
      email: "moderator@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.MODERATOR,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Prof. Rajesh Kumar",
          enrollmentNumber: "FACULTY-402",
          branch: "Computer Science",
          yearOfStudy: 4,
          bio: "Student Council Moderator & Verification Officer",
        },
      },
    },
  });

  // Student 1: Aarav
  const aarav = await prisma.user.upsert({
    where: { email: "aarav@college.edu" },
    update: {},
    create: {
      email: "aarav@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Aarav Sharma",
          enrollmentNumber: "2023CSE042",
          branch: "Computer Science & Engineering",
          yearOfStudy: 3,
          phone: "+91 98765 43210",
          bio: "3rd year CSE student. Selling previous semester engineering books and accessories.",
        },
      },
    },
  });

  // Student 2: Priya
  const priya = await prisma.user.upsert({
    where: { email: "priya@college.edu" },
    update: {},
    create: {
      email: "priya@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Priya Patel",
          enrollmentNumber: "2024ECE115",
          branch: "Electronics & Communication",
          yearOfStudy: 2,
          phone: "+91 98123 45678",
          bio: "ECE sophomore. Looking to exchange books and sell hostel essentials.",
        },
      },
    },
  });

  console.log("✓ Seeded Admin, Moderator, and Student demo accounts");

  // 4. Seed Listings
  const textbooksCat = categoryMap.get("textbooks")!;
  const electronicsCat = categoryMap.get("electronics")!;
  const cyclesCat = categoryMap.get("cycles-mobility")!;

  const existingListings = await prisma.listing.count();
  if (existingListings === 0) {
    await prisma.listing.create({
      data: {
        title: "CLRS Introduction to Algorithms (4th Edition)",
        description: "Standard algorithms textbook in like-new condition. Clean pages with minimal pencil highlights. Essential for CSE 3rd semester.",
        price: 850.0,
        condition: ItemCondition.LIKE_NEW,
        transactionType: TransactionType.SELL,
        status: ListingStatus.AVAILABLE,
        userId: aarav.id,
        categoryId: textbooksCat,
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
          ],
        },
      },
    });

    await prisma.listing.create({
      data: {
        title: "Casio fx-991EX ClassWiz Scientific Calculator",
        description: "Advanced engineering scientific calculator with spreadsheet mode and matrix calculations. 1 year old, works perfectly.",
        price: 650.0,
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.BOTH,
        status: ListingStatus.AVAILABLE,
        userId: priya.id,
        categoryId: electronicsCat,
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
          ],
        },
      },
    });

    await prisma.listing.create({
      data: {
        title: "Hero Sprint 26T Geared Bicycle with Heavy Duty Cable Lock",
        description: "Single-hand used 21-speed bicycle. Serviced last month with new brake pads and comfortable gel seat cover. Great for campus travel.",
        price: 3200.0,
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.SELL,
        status: ListingStatus.AVAILABLE,
        userId: aarav.id,
        categoryId: cyclesCat,
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
          ],
        },
      },
    });
    console.log("✓ Seeded sample listings with images");
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
